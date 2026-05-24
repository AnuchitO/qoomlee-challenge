package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gitlab.com/arise-by-infinitas/qoomlee/booking-service/repository"
)

type BookingHandler struct {
	repo *repository.BookingRepository
}

func NewBookingHandler(repo *repository.BookingRepository) *BookingHandler {
	return &BookingHandler{repo: repo}
}

// RegisterRoutes wires handler methods to a gin.Engine.
func (h *BookingHandler) RegisterRoutes(r *gin.Engine) {
	r.GET("/health/live",  h.HealthLive)
	r.GET("/health/ready", h.HealthReady)

	api := r.Group("/api/bookings")
	api.POST("", h.Create)
	api.GET("/:bookingRef", h.GetByRef)
	api.PUT("/:bookingRef/status", h.UpdateStatus)
}

func (h *BookingHandler) HealthLive(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "booking-service"})
}

// HealthReady checks the DB connection.
// TODO: inject *sql.DB so you can call db.PingContext here.
func (h *BookingHandler) HealthReady(c *gin.Context) {
	// TODO: implement — ping DB, return 503 if unreachable
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "booking-service"})
}

// Create — POST /api/bookings
//
// Creates one passenger and one booking in a single transaction.
// Generates a 6-char PNR (bookingRef) in Go before writing to the DB.
//
// Response 201: { bookingRef, bookingId, status, message }
// Response 400: missing required fields
// Response 409: NO_SEATS_AVAILABLE
//
// TODO: implement
func (h *BookingHandler) Create(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

// GetByRef — GET /api/bookings/:bookingRef
//
// Returns booking with nested flight and passenger objects.
//
// Response 200: BookingDetail
// Response 404: { "error": "BOOKING_NOT_FOUND", ... }
//
// TODO: implement
func (h *BookingHandler) GetByRef(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

// UpdateStatus — PUT /api/bookings/:bookingRef/status
//
// Called internally by payment-service after a successful Omise charge.
// Not a public-facing endpoint — no authentication required for this challenge.
//
// Request body: { "status": "CONFIRMED" }
// Response 200: { "bookingRef": "QM7X2K", "status": "CONFIRMED" }
// Response 400: INVALID_STATUS (value other than CONFIRMED)
// Response 404: BOOKING_NOT_FOUND
//
// TODO: implement
func (h *BookingHandler) UpdateStatus(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
