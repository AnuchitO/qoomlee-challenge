package main

import (
	"database/sql"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

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
	defer db.Close()

	omiseClient, err := payment.NewOmiseClient(omisePublicKey, omiseSecretKey)
	if err != nil {
		slog.Error("init omise client failed", "err", err)
		os.Exit(1)
	}

	bookingClient := payment.NewHTTPBookingClient(qoomleeServiceURL, internalToken)
	repo := payment.NewRepository(db)
	svc := payment.NewService(bookingClient, omiseClient, repo)
	h := payment.NewHandler(svc)

	r := gin.Default()

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
	api.POST("/payments/charge", h.Charge)

	slog.Info("payment-service starting", "port", port)
	if err := r.Run(":" + port); err != nil {
		slog.Error("server failed", "err", err)
		os.Exit(1)
	}
}
