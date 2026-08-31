package flight

import (
	"errors"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetByID handles GET /api/flights/:id
//
// @Summary Get flight by ID
// @Description Fetches a single flight by its numeric ID. Requires an opaque session bearer token.
// @Tags Flights
// @Produce json
// @Security BearerAuth
// @Param id path int true "Flight ID"
// @Success 200 {object} flight.Flight
// @Failure 400 {object} object{error=string,message=string} "INVALID_FIELD — id must be a positive integer"
// @Failure 401 {object} object{error=string,message=string} "UNAUTHORIZED — missing or malformed session token"
// @Failure 404 {object} object{error=string,message=string} "FLIGHT_NOT_FOUND"
// @Router /api/flights/{id} [get]
func (h *Handler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id < 1 {
		c.JSON(http.StatusBadRequest, apiErr("INVALID_FIELD", "id must be a positive integer"))
		return
	}

	f, err := h.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			c.JSON(http.StatusNotFound, apiErr("FLIGHT_NOT_FOUND", "flight not found"))
			return
		}
		slog.Error("get flight by id failed", "id", id, "err", err)
		c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		return
	}

	c.JSON(http.StatusOK, f)
}
