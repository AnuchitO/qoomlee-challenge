package booking

import "github.com/gin-gonic/gin"

// Handler holds dependencies for booking HTTP handlers.
type Handler struct {
	svc Service
}

// NewHandler creates a new booking Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// apiErr builds the standard error response body.
func apiErr(code, message string) gin.H {
	return gin.H{"error": code, "message": message}
}
