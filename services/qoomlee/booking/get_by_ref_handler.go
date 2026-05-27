package booking

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

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
