package booking

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

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
