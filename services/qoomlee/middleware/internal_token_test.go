package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/AnuchitO/qoomlee/middleware"
)

func callInternalToken(handler gin.HandlerFunc, token string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPut, "/api/bookings/QM7X2K/status", nil)
	if token != "" {
		c.Request.Header.Set("X-Internal-Token", token)
	}
	handler(c)
	return w
}

func TestInternalToken(t *testing.T) {
	const secret = "super-secret-internal-token"
	handler := middleware.InternalToken(secret)

	t.Run("valid token is accepted", func(t *testing.T) {
		w := callInternalToken(handler, secret)
		assert.NotEqual(t, http.StatusForbidden, w.Code)
	})

	t.Run("missing X-Internal-Token returns 403", func(t *testing.T) {
		w := callInternalToken(handler, "")
		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("wrong token returns 403", func(t *testing.T) {
		w := callInternalToken(handler, "wrong-token")
		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("empty string token returns 403", func(t *testing.T) {
		w := callInternalToken(handler, " ")
		assert.Equal(t, http.StatusForbidden, w.Code)
	})
}
