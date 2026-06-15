package main

import (
	"database/sql"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"github.com/AnuchitO/qoomlee/booking"
	"github.com/AnuchitO/qoomlee/flight"
	"github.com/AnuchitO/qoomlee/middleware"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")

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
	defer func() {
		if err := db.Close(); err != nil {
			slog.Error("close db failed", "err", err)
		}
	}()

	// Wiring
	flightRepo := flight.NewRepository(db)
	flightSvc := flight.NewService(flightRepo)
	flightHandler := flight.NewHandler(flightSvc)

	bookingRepo := booking.NewRepository(db)
	bookingSvc := booking.NewService(bookingRepo)
	bookingHandler := booking.NewHandler(bookingSvc)

	logger := slog.Default()

	r := gin.New()
	r.Use(
		gin.Recovery(),
		middleware.SecurityHeaders(),
		middleware.CORS(allowedOrigins),
		middleware.CorrelationID(),
		middleware.RequestLogger(logger),
	)

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

	// Internal route — X-Internal-Token guard (no JWT)
	internalToken := os.Getenv("INTERNAL_TOKEN")
	if internalToken == "" {
		slog.Error("INTERNAL_TOKEN is required")
		os.Exit(1)
	}
	internal := r.Group("/api/bookings")
	internal.Use(middleware.InternalToken(internalToken))
	internal.PUT("/:bookingRef/status", bookingHandler.UpdateStatus)

	// Public flight search — no auth required (anyone can search before logging in)
	r.GET("/api/flights/search", flightHandler.Search)

	// Authenticated API routes — opaque session token required
	api := r.Group("/api")
	api.Use(middleware.SessionAuth())
	api.GET("/flights/:id", flightHandler.GetByID)
	api.POST("/bookings", bookingHandler.Create)
	api.GET("/bookings", bookingHandler.GetAll)
	api.GET("/bookings/:bookingRef", bookingHandler.GetByRef)

	slog.Info("qoomlee-service starting", "port", port)
	if err := r.Run(":" + port); err != nil {
		slog.Error("server failed", "err", err)
		os.Exit(1)
	}
}
