package booking

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateStatus handles PUT /api/bookings/:bookingRef/status
// This is an internal endpoint called only by payment-service.
//
// @Summary Confirm a booking (internal)
// @Description Internal-only endpoint used by payment-service to mark a booking CONFIRMED after payment succeeds. Guarded by a shared X-Internal-Token secret, NOT by session auth — never call this from a client-facing context.
// @Tags Bookings
// @Accept json
// @Produce json
// @Security InternalToken
// @Param bookingRef path string true "Booking reference"
// @Param request body booking.UpdateStatusRequest true "Status update (only status=CONFIRMED is accepted)"
// @Success 200 {object} object{status=string}
// @Failure 400 {object} object{error=string,message=string} "MISSING_REQUIRED_FIELD (invalid body) or INVALID_STATUS (status is not CONFIRMED)"
// @Failure 403 {object} object{error=string,message=string} "FORBIDDEN — missing or incorrect X-Internal-Token"
// @Failure 404 {object} object{error=string,message=string} "BOOKING_NOT_FOUND"
// @Failure 409 {object} object{error=string} "booking_expired — the booking (or its lazily-expired PENDING hold) can no longer be confirmed; already_confirmed — the booking is already CONFIRMED. These conflict bodies carry only an error key, no message."
// @Router /api/bookings/{bookingRef}/status [put]
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
