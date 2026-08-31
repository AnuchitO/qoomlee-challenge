package booking

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetByRef handles GET /api/bookings/:bookingRef
//
// @Summary Get a booking by reference
// @Description Fetches a single booking (with its embedded passenger and flight/returnFlight snapshots) by its booking reference. If the booking is PENDING and past its expiry, it is lazily transitioned to EXPIRED (and its seat hold released) before being returned.
// @Tags Bookings
// @Produce json
// @Security BearerAuth
// @Param bookingRef path string true "Booking reference"
// @Success 200 {object} booking.Booking
// @Failure 401 {object} object{error=string,message=string} "UNAUTHORIZED — missing or malformed session token"
// @Failure 404 {object} object{error=string,message=string} "BOOKING_NOT_FOUND"
// @Router /api/bookings/{bookingRef} [get]
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
