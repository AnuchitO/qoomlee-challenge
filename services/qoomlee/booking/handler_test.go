package booking

import (
	"bytes"
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
	booking   *Booking
	summaries []Summary
	err       error

	gotCreateReq CreateRequest
	gotGetAllSub string
}

func (m *mockService) Create(_ context.Context, req CreateRequest) (*Booking, error) {
	m.gotCreateReq = req
	return m.booking, m.err
}

func (m *mockService) GetByRef(_ context.Context, _ string) (*Booking, error) {
	return m.booking, m.err
}

func (m *mockService) GetAll(_ context.Context, userSub string) ([]Summary, error) {
	m.gotGetAllSub = userSub
	return m.summaries, m.err
}

func (m *mockService) UpdateStatus(_ context.Context, _ string, _ UpdateStatusRequest) error {
	return m.err
}

// --- helpers ---

func newTestHandler(svc Service) *Handler {
	return NewHandler(svc)
}

func doCreate(h *Handler, body any) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	b, _ := json.Marshal(body)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/bookings", bytes.NewReader(b))
	c.Request.Header.Set("Content-Type", "application/json")
	h.Create(c)
	return w
}

func doCreateWithToken(h *Handler, body any, bookingToken string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	b, _ := json.Marshal(body)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/bookings?bookingToken="+bookingToken, bytes.NewReader(b))
	c.Request.Header.Set("Content-Type", "application/json")
	h.Create(c)
	return w
}

// doCreateAs is like doCreate but sets the opaque session token as the
// SessionAuth middleware would for an authenticated request.
func doCreateAs(h *Handler, body any, sub string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	b, _ := json.Marshal(body)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/bookings", bytes.NewReader(b))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("userSub", sub)
	h.Create(c)
	return w
}

func doGetByRef(h *Handler, ref string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/bookings/"+ref, nil)
	c.Params = gin.Params{{Key: "bookingRef", Value: ref}}
	h.GetByRef(c)
	return w
}

func doGetAll(h *Handler, sub string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/bookings", nil)
	c.Set("userSub", sub)
	h.GetAll(c)
	return w
}

func doUpdateStatus(h *Handler, ref string, body any) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	b, _ := json.Marshal(body)
	c.Request = httptest.NewRequest(http.MethodPut, "/api/bookings/"+ref+"/status", bytes.NewReader(b))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Params = gin.Params{{Key: "bookingRef", Value: ref}}
	h.UpdateStatus(c)
	return w
}

func assertErrCode(t *testing.T, w *httptest.ResponseRecorder, code string) {
	t.Helper()
	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, code, body["error"])
}
