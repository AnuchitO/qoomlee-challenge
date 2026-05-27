package booking

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Handler holds dependencies for booking HTTP handlers.
type Handler struct {
	svc Service
}

// NewHandler creates a new booking Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// Create handles POST /api/bookings
func (h *Handler) Create(c *gin.Context) {
	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "invalid request body"))
		return
	}

	if req.FlightID == 0 {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "flightId is required"))
		return
	}
	if req.Passenger.FirstName == "" || req.Passenger.LastName == "" || req.Passenger.Email == "" {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "passenger firstName, lastName, and email are required"))
		return
	}

	b, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, ErrNoSeatsAvailable) {
			c.JSON(http.StatusConflict, apiErr("NO_SEATS_AVAILABLE", "no seats available on this flight"))
			return
		}
		slog.Error("create booking failed", "err", err)
		c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"bookingId":  b.ID,
		"bookingRef": b.BookingRef,
	})
}

// GetByRef handles GET /api/bookings/:bookingRef
func (h *Handler) GetByRef(c *gin.Context) {
	ref := c.Param("bookingRef")

	b, err := h.svc.GetByRef(c.Request.Context(), ref)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			c.JSON(http.StatusNotFound, apiErr("BOOKING_NOT_FOUND", "booking not found"))
			return
		}
		slog.Error("get booking failed", "ref", ref, "err", err)
		c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		return
	}

	c.JSON(http.StatusOK, b)
}

// UpdateStatus handles PUT /api/bookings/:bookingRef/status
// This is an internal endpoint called only by payment-service.
func (h *Handler) UpdateStatus(c *gin.Context) {
	ref := c.Param("bookingRef")

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "invalid request body"))
		return
	}

	if req.Status != "CONFIRMED" {
		c.JSON(http.StatusBadRequest, apiErr("INVALID_STATUS", "only CONFIRMED is a valid status"))
		return
	}

	err := h.svc.UpdateStatus(c.Request.Context(), ref, req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			c.JSON(http.StatusNotFound, apiErr("BOOKING_NOT_FOUND", "booking not found"))
			return
		}
		slog.Error("update booking status failed", "ref", ref, "err", err)
		c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// apiErr builds the standard error response body.
func apiErr(code, message string) gin.H {
	return gin.H{"error": code, "message": message}
}
