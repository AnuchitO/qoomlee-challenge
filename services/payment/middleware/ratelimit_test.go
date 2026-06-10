package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/time/rate"

	"github.com/AnuchitO/qoomlee-payment/middleware"
)

func callRateLimit(handler gin.HandlerFunc, ip string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/payments/charge", nil)
	c.Request.RemoteAddr = ip + ":1234"
	handler(c)
	return w
}

func TestRateLimit(t *testing.T) {
	t.Run("single request within limit is allowed", func(t *testing.T) {
		handler := middleware.RateLimit(rate.Limit(100), 100)
		w := callRateLimit(handler, "10.0.0.1")
		assert.NotEqual(t, http.StatusTooManyRequests, w.Code)
	})

	t.Run("burst exhausted: second request from same IP is blocked", func(t *testing.T) {
		// Burst = 1 so the second request from the same IP is immediately rejected
		handler := middleware.RateLimit(rate.Limit(0.001), 1)
		callRateLimit(handler, "10.0.0.2")      // consumes the burst
		w := callRateLimit(handler, "10.0.0.2") // second: rate limited
		assert.Equal(t, http.StatusTooManyRequests, w.Code)
	})

	t.Run("different IPs have independent limits", func(t *testing.T) {
		handler := middleware.RateLimit(rate.Limit(0.001), 1)
		callRateLimit(handler, "10.0.0.3")      // IP A: burst consumed
		w := callRateLimit(handler, "10.0.0.4") // IP B: fresh limiter
		assert.NotEqual(t, http.StatusTooManyRequests, w.Code)
	})

	t.Run("429 response includes RATE_LIMIT_EXCEEDED error code", func(t *testing.T) {
		handler := middleware.RateLimit(rate.Limit(0.001), 1)
		callRateLimit(handler, "10.0.0.5")
		w := callRateLimit(handler, "10.0.0.5")
		assert.Equal(t, http.StatusTooManyRequests, w.Code)
		assert.Contains(t, w.Body.String(), "RATE_LIMIT_EXCEEDED")
	})
}
