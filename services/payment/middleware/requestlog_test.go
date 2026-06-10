package middleware_test

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/AnuchitO/qoomlee-payment/middleware"
)

func newTestLogger() (*slog.Logger, *bytes.Buffer) {
	buf := &bytes.Buffer{}
	return slog.New(slog.NewJSONHandler(buf, nil)), buf
}

func parseLog(t *testing.T, buf *bytes.Buffer) map[string]any {
	t.Helper()
	var m map[string]any
	require.NoError(t, json.Unmarshal(buf.Bytes(), &m))
	return m
}

func TestRequestLogger(t *testing.T) {
	t.Run("logs method, path, status, latency_ms, correlation_id", func(t *testing.T) {
		logger, buf := newTestLogger()
		gin.SetMode(gin.TestMode)
		r := gin.New()
		r.Use(middleware.CorrelationID(), middleware.RequestLogger(logger))
		r.GET("/test", func(c *gin.Context) { c.Status(http.StatusOK) })

		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("X-Correlation-ID", "corr-abc")
		r.ServeHTTP(httptest.NewRecorder(), req)

		m := parseLog(t, buf)
		assert.Equal(t, "GET", m["method"])
		assert.Equal(t, "/test", m["path"])
		assert.Equal(t, float64(200), m["status"])
		assert.NotNil(t, m["latency_ms"])
		assert.Equal(t, "corr-abc", m["correlation_id"])
	})

	t.Run("latency_ms is non-negative number", func(t *testing.T) {
		logger, buf := newTestLogger()
		gin.SetMode(gin.TestMode)
		r := gin.New()
		r.Use(middleware.CorrelationID(), middleware.RequestLogger(logger))
		r.GET("/test", func(c *gin.Context) { c.Status(http.StatusOK) })
		r.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/test", nil))

		m := parseLog(t, buf)
		latency, ok := m["latency_ms"].(float64)
		require.True(t, ok, "latency_ms should be a number")
		assert.GreaterOrEqual(t, latency, float64(0))
	})

	t.Run("logs 404 status for unknown route", func(t *testing.T) {
		logger, buf := newTestLogger()
		gin.SetMode(gin.TestMode)
		r := gin.New()
		r.Use(middleware.CorrelationID(), middleware.RequestLogger(logger))
		r.NoRoute(func(c *gin.Context) { c.Status(http.StatusNotFound) })
		r.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/no-such-route", nil))

		m := parseLog(t, buf)
		assert.Equal(t, float64(404), m["status"])
	})

	t.Run("generates correlation_id when header absent", func(t *testing.T) {
		logger, buf := newTestLogger()
		gin.SetMode(gin.TestMode)
		r := gin.New()
		r.Use(middleware.CorrelationID(), middleware.RequestLogger(logger))
		r.GET("/test", func(c *gin.Context) { c.Status(http.StatusOK) })
		r.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/test", nil))

		m := parseLog(t, buf)
		corrID, ok := m["correlation_id"].(string)
		require.True(t, ok)
		assert.NotEmpty(t, corrID)
	})
}
