package booking

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetAll handles GET /api/bookings
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
