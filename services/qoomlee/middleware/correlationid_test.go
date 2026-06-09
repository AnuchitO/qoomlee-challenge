package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/AnuchitO/qoomlee/middleware"
)

func callCorrelationID(handler gin.HandlerFunc, reqCorID string) (*httptest.ResponseRecorder, string) {
	gin.SetMode(gin.TestMode)
	var ctxID string
	r := gin.New()
	r.Use(handler)
	r.GET("/", func(c *gin.Context) {
		ctxID = c.GetString("correlation_id")
		c.Status(http.StatusOK)
	})
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	if reqCorID != "" {
		req.Header.Set("X-Correlation-ID", reqCorID)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w, ctxID
}

func TestCorrelationID(t *testing.T) {
	t.Run("propagates existing X-Correlation-ID from request", func(t *testing.T) {
		h := middleware.CorrelationID()
		w, ctxID := callCorrelationID(h, "test-corr-123")
		assert.Equal(t, "test-corr-123", w.Result().Header.Get("X-Correlation-ID"))
		assert.Equal(t, "test-corr-123", ctxID)
	})

	t.Run("generates UUID when header is absent", func(t *testing.T) {
		h := middleware.CorrelationID()
		w, ctxID := callCorrelationID(h, "")
		respID := w.Result().Header.Get("X-Correlation-ID")
		require.NotEmpty(t, respID)
		assert.Equal(t, respID, ctxID)
		assert.Regexp(t, `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, respID)
	})

	t.Run("two absent-header requests generate different IDs", func(t *testing.T) {
		h := middleware.CorrelationID()
		_, id1 := callCorrelationID(h, "")
		_, id2 := callCorrelationID(h, "")
		assert.NotEqual(t, id1, id2)
	})

	t.Run("response always carries X-Correlation-ID", func(t *testing.T) {
		h := middleware.CorrelationID()
		w, _ := callCorrelationID(h, "explicit-id")
		assert.Equal(t, "explicit-id", w.Result().Header.Get("X-Correlation-ID"))
	})
}
