package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/AnuchitO/qoomlee/middleware"
)

func TestSessionAuth(t *testing.T) {
	t.Run("valid bearer token is accepted and sets userSub", func(t *testing.T) {
		gin.SetMode(gin.TestMode)
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest(http.MethodPost, "/api/bookings", nil)
		c.Request.Header.Set("Authorization", "Bearer session-abc-123")

		middleware.SessionAuth()(c)

		assert.False(t, c.IsAborted())
		sub, ok := c.Get("userSub")
		assert.True(t, ok)
		assert.Equal(t, "session-abc-123", sub)
	})

	t.Run("missing Authorization header returns 401", func(t *testing.T) {
		gin.SetMode(gin.TestMode)
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest(http.MethodPost, "/api/bookings", nil)

		middleware.SessionAuth()(c)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Authorization header without Bearer prefix returns 401", func(t *testing.T) {
		gin.SetMode(gin.TestMode)
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest(http.MethodPost, "/api/bookings", nil)
		c.Request.Header.Set("Authorization", "session-abc-123")

		middleware.SessionAuth()(c)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Bearer with empty token returns 401", func(t *testing.T) {
		gin.SetMode(gin.TestMode)
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest(http.MethodPost, "/api/bookings", nil)
		c.Request.Header.Set("Authorization", "Bearer ")

		middleware.SessionAuth()(c)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
