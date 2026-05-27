package flight

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// --- mock Service ---

type mockService struct {
	flights []Flight
	flight  *Flight
	err     error
}

func (m *mockService) Search(_ context.Context, _ SearchParams) ([]Flight, error) {
	return m.flights, m.err
}

func (m *mockService) GetByID(_ context.Context, _ int64) (*Flight, error) {
	return m.flight, m.err
}

// --- helpers ---

func newTestHandler(svc Service) *Handler {
	return NewHandler(svc)
}

func doSearch(h *Handler, query string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/flights/search?"+query, nil)
	h.Search(c)
	return w
}

func doGetByID(h *Handler, id string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/flights/"+id, nil)
	c.Params = gin.Params{{Key: "id", Value: id}}
	h.GetByID(c)
	return w
}

func assertErrorCode(t *testing.T, w *httptest.ResponseRecorder, code string) {
	t.Helper()
	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, code, body["error"])
}
