package main

import (
	"database/sql"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"github.com/AnuchitO/qoomlee/booking"
	"github.com/AnuchitO/qoomlee/flight"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		slog.Error("DATABASE_URL is required")
		os.Exit(1)
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		slog.Error("open db failed", "err", err)
		os.Exit(1)
	}
	defer db.Close()

	// Wiring
	flightRepo := flight.NewRepository(db)
	flightSvc := flight.NewService(flightRepo)
	flightHandler := flight.NewHandler(flightSvc)

	bookingRepo := booking.NewRepository(db)
	bookingSvc := booking.NewService(bookingRepo)
	bookingHandler := booking.NewHandler(bookingSvc)

	r := gin.Default()

	// Health probes — no auth
	r.GET("/health/live", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "qoomlee-service"})
	})
	r.GET("/health/ready", func(c *gin.Context) {
		if err := db.PingContext(c.Request.Context()); err != nil {
			slog.Error("readiness check failed", "err", err)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "degraded", "service": "qoomlee-service", "error": "database ping failed",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "qoomlee-service"})
	})

	// Internal route — no JWT, internal-token guard (added in future story)
	r.PUT("/api/bookings/:bookingRef/status", bookingHandler.UpdateStatus)

	// Public API routes
	api := r.Group("/api")
	api.GET("/flights/search", flightHandler.Search)
	api.GET("/flights/:id", flightHandler.GetByID)
	api.POST("/bookings", bookingHandler.Create)
	api.GET("/bookings/:bookingRef", bookingHandler.GetByRef)

	slog.Info("qoomlee-service starting", "port", port)
	if err := r.Run(":" + port); err != nil {
		slog.Error("server failed", "err", err)
		os.Exit(1)
	}
}
