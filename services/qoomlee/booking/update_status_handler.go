package booking

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

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
		switch {
		case errors.Is(err, ErrNotFound):
			c.JSON(http.StatusNotFound, apiErr("BOOKING_NOT_FOUND", "booking not found"))
		case errors.Is(err, ErrBookingExpired):
			c.JSON(http.StatusConflict, gin.H{"error": "booking_expired"})
		case errors.Is(err, ErrAlreadyConfirmed):
			c.JSON(http.StatusConflict, gin.H{"error": "already_confirmed"})
		default:
			slog.Error("update booking status failed", "ref", ref, "err", err)
			c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
