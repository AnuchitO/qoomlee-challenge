package main

import (
	"database/sql"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"golang.org/x/time/rate"

	"github.com/AnuchitO/qoomlee-payment/middleware"
	"github.com/AnuchitO/qoomlee-payment/payment"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		slog.Error("DATABASE_URL is required")
		os.Exit(1)
	}

	omisePublicKey := os.Getenv("OMISE_PUBLIC_KEY")
	omiseSecretKey := os.Getenv("OMISE_SECRET_KEY")
	if omisePublicKey == "" || omiseSecretKey == "" {
		slog.Error("OMISE_PUBLIC_KEY and OMISE_SECRET_KEY are required")
		os.Exit(1)
	}

	qoomleeServiceURL := os.Getenv("QOOMLEE_SERVICE_URL")
	if qoomleeServiceURL == "" {
		qoomleeServiceURL = "http://localhost:8082"
	}

	rawOrigins := os.Getenv("ALLOWED_ORIGINS")
	if rawOrigins == "" {
		rawOrigins = "http://localhost:3000"
	}
	allowedOrigins := strings.Split(rawOrigins, ",")

	internalToken := os.Getenv("INTERNAL_TOKEN")
	if internalToken == "" {
		slog.Error("INTERNAL_TOKEN is required")
		os.Exit(1)
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		slog.Error("open db failed", "err", err)
		os.Exit(1)
	}
	defer func() {
		if err := db.Close(); err != nil {
			slog.Error("close db failed", "err", err)
		}
	}()

	omiseClient, err := payment.NewOmiseClient(omisePublicKey, omiseSecretKey)
	if err != nil {
		slog.Error("init omise client failed", "err", err)
		os.Exit(1)
	}

	bookingClient := payment.NewHTTPBookingClient(qoomleeServiceURL, internalToken)
	repo := payment.NewRepository(db)
	svc := payment.NewService(bookingClient, omiseClient, repo)
	h := payment.NewHandler(svc)

	logger := slog.Default()

	r := gin.New()
	r.Use(gin.Recovery(), middleware.CORS(allowedOrigins), middleware.SecurityHeaders(), middleware.CorrelationID(), middleware.RequestLogger(logger))

	r.GET("/health/live", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "payment-service"})
	})
	r.GET("/health/ready", func(c *gin.Context) {
		if err := db.PingContext(c.Request.Context()); err != nil {
			slog.Error("readiness check failed", "err", err)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "degraded", "service": "payment-service", "error": "database ping failed",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "payment-service"})
	})

	api := r.Group("/api")
	api.Use(middleware.SessionAuth())
	// Rate limit charge endpoint: 10 req/s sustained, burst 20 per IP
	api.POST("/payments/charge", middleware.RateLimit(rate.Limit(10), 20), h.Charge)
	api.GET("/payments/:bookingRef", h.GetByBookingRef)

	slog.Info("payment-service starting", "port", port)
	if err := r.Run(":" + port); err != nil {
		slog.Error("server failed", "err", err)
		os.Exit(1)
	}
}
