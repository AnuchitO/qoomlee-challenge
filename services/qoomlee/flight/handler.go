package flight

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Handler holds dependencies for flight HTTP handlers.
type Handler struct {
	repo Repository
}

// NewHandler creates a new flight Handler.
func NewHandler(repo Repository) *Handler {
	return &Handler{repo: repo}
}

// Search handles GET /api/flights/search
func (h *Handler) Search(c *gin.Context) {
	// TODO: implement in GREEN phase
	c.JSON(http.StatusNotImplemented, gin.H{"error": "NOT_IMPLEMENTED", "message": "not yet implemented"})
}
