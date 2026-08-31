package booking

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetAll handles GET /api/bookings
//
// @Summary List my bookings
// @Description Returns every booking belonging to the caller's opaque session, most recent first, as a plain JSON array. Any PENDING booking past its expiry is lazily transitioned to EXPIRED (and its seat hold released) before the list is returned.
// @Tags Bookings
// @Produce json
// @Security BearerAuth
// @Success 200 {array} booking.Summary
// @Failure 401 {object} object{error=string,message=string} "UNAUTHORIZED — missing or malformed session token"
// @Router /api/bookings [get]
func (h *Handler) GetAll(c *gin.Context) {
	userSub := c.GetString("userSub")

	summaries, err := h.svc.GetAll(c.Request.Context(), userSub)
	if err != nil {
		slog.Error("get bookings failed", "userSub", userSub, "err", err)
		c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		return
	}

	c.JSON(http.StatusOK, summaries)
}
