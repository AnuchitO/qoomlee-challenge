package middleware

import (
	"crypto/subtle"
	"net/http"

	"github.com/gin-gonic/gin"
)

// InternalToken returns middleware that validates the X-Internal-Token header
// using a constant-time comparison to prevent timing attacks.
func InternalToken(secret string) gin.HandlerFunc {
	secretBytes := []byte(secret)
	return func(c *gin.Context) {
		token := c.GetHeader("X-Internal-Token")
		if subtle.ConstantTimeCompare([]byte(token), secretBytes) != 1 {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "FORBIDDEN",
				"message": "internal token required",
			})
			return
		}
		c.Next()
	}
}
