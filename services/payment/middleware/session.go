package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// SessionAuth returns a Gin middleware that extracts an opaque session token
// from the Authorization header and exposes it to handlers as "userSub".
// The token is a frontend-generated, persisted identifier used to track
// anonymous users across requests; it is not cryptographically verified.
func SessionAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			abortSession(c, "missing session token")
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" {
			abortSession(c, "missing session token")
			return
		}

		c.Set("userSub", token)
		c.Next()
	}
}

func abortSession(c *gin.Context, msg string) {
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
		"error":   "UNAUTHORIZED",
		"message": msg,
	})
}
