package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

// RequestLogger returns a gin middleware that emits a structured JSON log line
// per request with method, path, status, latency_ms, and correlation_id.
// It must run after CorrelationID() so the "correlation_id" context key is set.
func RequestLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		logger.Info("request",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"latency_ms", time.Since(start).Milliseconds(),
			"correlation_id", c.GetString("correlation_id"),
		)
	}
}
