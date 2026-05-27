package booking

import (
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
	c.JSON(http.StatusNotImplemented, apiErr("NOT_IMPLEMENTED", "not yet implemented"))
}

// GetByRef handles GET /api/bookings/:bookingRef
func (h *Handler) GetByRef(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, apiErr("NOT_IMPLEMENTED", "not yet implemented"))
}

// UpdateStatus handles PUT /api/bookings/:bookingRef/status
func (h *Handler) UpdateStatus(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, apiErr("NOT_IMPLEMENTED", "not yet implemented"))
}

// apiErr builds the standard error response body.
func apiErr(code, message string) gin.H {
	return gin.H{"error": code, "message": message}
}
