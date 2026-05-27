package flight

import "github.com/gin-gonic/gin"

// Handler holds dependencies for flight HTTP handlers.
type Handler struct {
	svc Service
}

// NewHandler creates a new flight Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// apiErr builds the standard error response body.
func apiErr(code, message string) gin.H {
	return gin.H{"error": code, "message": message}
}
