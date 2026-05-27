package flight

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

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

// --- Search tests ---

func TestSearchFlights_HappyPath(t *testing.T) {
	dep := time.Date(2026, 6, 15, 1, 0, 0, 0, time.UTC)
	arr := time.Date(2026, 6, 15, 4, 30, 0, 0, time.UTC)

	svc := &mockService{
		flights: []Flight{
			{
				ID:              1,
				FlightNumber:    "QM101",
				Origin:          "BKK",
				Destination:     "SIN",
				DepartureTime:   dep,
				ArrivalTime:     arr,
				Status:          "SCHEDULED",
				BasePriceMinor:  350000,
				BasePrice:       "3500.00",
				Currency:        "THB",
				AvailableSeats:  152,
				DurationMinutes: 210,
			},
		},
	}

	w := doSearch(newTestHandler(svc), "origin=BKK&destination=SIN&date=2026-06-15&passengers=1")

	assert.Equal(t, http.StatusOK, w.Code)

	var body map[string]any
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))

	flights, ok := body["flights"].([]any)
	assert.True(t, ok, "response must have a 'flights' array")
	assert.Len(t, flights, 1)

	first := flights[0].(map[string]any)
	assert.Equal(t, "QM101", first["flightNumber"])
	assert.Equal(t, "BKK", first["origin"])
	assert.Equal(t, "SIN", first["destination"])
	assert.EqualValues(t, 350000, first["basePriceMinor"])
	assert.Equal(t, "3500.00", first["basePrice"])
	assert.Equal(t, "THB", first["currency"])
	assert.EqualValues(t, 152, first["availableSeats"])
	assert.EqualValues(t, 210, first["durationMinutes"])
}

func TestSearchFlights_NoMatchReturnsEmptyList(t *testing.T) {
	svc := &mockService{flights: []Flight{}}

	w := doSearch(newTestHandler(svc), "origin=BKK&destination=SIN&date=2026-06-15&passengers=1")

	assert.Equal(t, http.StatusOK, w.Code)

	var body map[string]any
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))

	flights, ok := body["flights"].([]any)
	assert.True(t, ok, "response must have a 'flights' array")
	assert.Empty(t, flights)
}

func TestSearchFlights_MissingOrigin(t *testing.T) {
	w := doSearch(newTestHandler(&mockService{}), "destination=SIN&date=2026-06-15")

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assertErrorCode(t, w, "MISSING_REQUIRED_FIELD")
}

func TestSearchFlights_MissingDestination(t *testing.T) {
	w := doSearch(newTestHandler(&mockService{}), "origin=BKK&date=2026-06-15")

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assertErrorCode(t, w, "MISSING_REQUIRED_FIELD")
}

func TestSearchFlights_MissingDate(t *testing.T) {
	w := doSearch(newTestHandler(&mockService{}), "origin=BKK&destination=SIN")

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assertErrorCode(t, w, "MISSING_REQUIRED_FIELD")
}

func TestSearchFlights_InvalidDateFormat(t *testing.T) {
	w := doSearch(newTestHandler(&mockService{}), "origin=BKK&destination=SIN&date=15-06-2026")

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assertErrorCode(t, w, "INVALID_DATE_FORMAT")
}

func TestSearchFlights_InvalidPassengers(t *testing.T) {
	w := doSearch(newTestHandler(&mockService{}), "origin=BKK&destination=SIN&date=2026-06-15&passengers=0")

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assertErrorCode(t, w, "INVALID_FIELD")
}

func TestSearchFlights_ServiceError(t *testing.T) {
	svc := &mockService{err: errors.New("db down")}

	w := doSearch(newTestHandler(svc), "origin=BKK&destination=SIN&date=2026-06-15")

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assertErrorCode(t, w, "INTERNAL_ERROR")
}

// --- GetByID tests (RED — GetByID stub returns 501) ---

func TestGetFlightByID_HappyPath(t *testing.T) {
	dep := time.Date(2026, 6, 15, 1, 0, 0, 0, time.UTC)
	arr := time.Date(2026, 6, 15, 4, 30, 0, 0, time.UTC)

	svc := &mockService{
		flight: &Flight{
			ID:              1,
			FlightNumber:    "QM101",
			Origin:          "BKK",
			Destination:     "SIN",
			DepartureTime:   dep,
			ArrivalTime:     arr,
			Status:          "SCHEDULED",
			BasePriceMinor:  350000,
			BasePrice:       "3500.00",
			Currency:        "THB",
			AvailableSeats:  152,
			DurationMinutes: 210,
		},
	}

	w := doGetByID(newTestHandler(svc), "1")

	assert.Equal(t, http.StatusOK, w.Code)

	var body map[string]any
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))

	assert.Equal(t, "QM101", body["flightNumber"])
	assert.Equal(t, "BKK", body["origin"])
	assert.Equal(t, "SIN", body["destination"])
	assert.EqualValues(t, 350000, body["basePriceMinor"])
	assert.Equal(t, "3500.00", body["basePrice"])
	assert.Equal(t, "THB", body["currency"])
	assert.EqualValues(t, 152, body["availableSeats"])
	assert.EqualValues(t, 210, body["durationMinutes"])
}

func TestGetFlightByID_NotFound(t *testing.T) {
	svc := &mockService{err: ErrNotFound}

	w := doGetByID(newTestHandler(svc), "99999")

	assert.Equal(t, http.StatusNotFound, w.Code)
	assertErrorCode(t, w, "FLIGHT_NOT_FOUND")
}

func TestGetFlightByID_InvalidID(t *testing.T) {
	w := doGetByID(newTestHandler(&mockService{}), "abc")

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assertErrorCode(t, w, "INVALID_FIELD")
}

func TestGetFlightByID_ServiceError(t *testing.T) {
	svc := &mockService{err: errors.New("db down")}

	w := doGetByID(newTestHandler(svc), "1")

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assertErrorCode(t, w, "INTERNAL_ERROR")
}

// --- helpers ---

func assertErrorCode(t *testing.T, w *httptest.ResponseRecorder, code string) {
	t.Helper()
	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, code, body["error"])
}
