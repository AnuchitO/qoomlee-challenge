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

// @title Qoomlee Payment Service API
// @version 1.0
// @description Card-charge endpoint (via Omise) and payment-receipt lookup for the Qoomlee Airline challenge. Monetary amounts appear as a *Minor/currency/* triple (integer satang / ISO code / display string) — never a JSON float. Test cards: 4242424242424242 (success), 4111111111111111 (decline, insufficient_fund).
// @host localhost:9984
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Opaque session bearer token (format: "Bearer <token>"). NOT a verified JWT — no signature check is performed; the raw token value is used to scope requests to an anonymous user.
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

	// @Summary Liveness check
	// @Description Returns 200 if the payment-service process is up. Does not check any dependency (database, Omise, qoomlee-service). No auth required.
	// @Tags Health
	// @Produce json
	// @Success 200 {object} object{status=string,service=string}
	// @Router /health/live [get]
	r.GET("/health/live", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "payment-service"})
	})
	// @Summary Readiness check
	// @Description Returns 200 when the service is ready to accept traffic (verified by pinging the database). Returns 503 with a degraded status body when the database ping fails. No auth required.
	// @Tags Health
	// @Produce json
	// @Success 200 {object} object{status=string,service=string}
	// @Failure 503 {object} object{status=string,service=string,error=string}
	// @Router /health/ready [get]
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
