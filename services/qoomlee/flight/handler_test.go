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

// --- mock Repository ---

type mockRepository struct {
	flights []Flight
	err     error
}

func (m *mockRepository) Search(_ context.Context, _ SearchParams) ([]Flight, error) {
	return m.flights, m.err
}

// --- helpers ---

func newTestHandler(repo Repository) *Handler {
	return NewHandler(repo)
}

func doSearch(h *Handler, query string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/flights/search?"+query, nil)
	h.Search(c)
	return w
}

// --- test cases ---

func TestSearchFlights_HappyPath(t *testing.T) {
	dep := time.Date(2026, 6, 15, 1, 0, 0, 0, time.UTC)  // 08:00 BKK
	arr := time.Date(2026, 6, 15, 4, 30, 0, 0, time.UTC) // 11:30 BKK

	mock := &mockRepository{
		flights: []Flight{
			{
				ID:             1,
				FlightNumber:   "QM101",
				Origin:         "BKK",
				Destination:    "SIN",
				DepartureTime:  dep,
				ArrivalTime:    arr,
				Status:         "SCHEDULED",
				BasePriceMinor: 350000,
				BasePrice:      "3500.00",
				Currency:       "THB",
				AvailableSeats: 152,
				DurationMinutes: 210,
			},
		},
	}

	w := doSearch(newTestHandler(mock), "origin=BKK&destination=SIN&date=2026-06-15&passengers=1")

	assert.Equal(t, http.StatusOK, w.Code)

	var body map[string]interface{}
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))

	flights, ok := body["flights"].([]interface{})
	assert.True(t, ok, "response must have a 'flights' array")
	assert.Len(t, flights, 1)

	first := flights[0].(map[string]interface{})
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
	mock := &mockRepository{flights: []Flight{}}

	w := doSearch(newTestHandler(mock), "origin=BKK&destination=SIN&date=2026-06-15&passengers=1")

	assert.Equal(t, http.StatusOK, w.Code)

	var body map[string]interface{}
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))

	flights, ok := body["flights"].([]interface{})
	assert.True(t, ok, "response must have a 'flights' array")
	assert.Empty(t, flights)
}

func TestSearchFlights_MissingOrigin(t *testing.T) {
	w := doSearch(newTestHandler(&mockRepository{}), "destination=SIN&date=2026-06-15")

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "MISSING_REQUIRED_FIELD", body["error"])
}

func TestSearchFlights_MissingDestination(t *testing.T) {
	w := doSearch(newTestHandler(&mockRepository{}), "origin=BKK&date=2026-06-15")

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "MISSING_REQUIRED_FIELD", body["error"])
}

func TestSearchFlights_MissingDate(t *testing.T) {
	w := doSearch(newTestHandler(&mockRepository{}), "origin=BKK&destination=SIN")

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "MISSING_REQUIRED_FIELD", body["error"])
}

func TestSearchFlights_InvalidDateFormat(t *testing.T) {
	w := doSearch(newTestHandler(&mockRepository{}), "origin=BKK&destination=SIN&date=15-06-2026")

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "INVALID_DATE_FORMAT", body["error"])
}

func TestSearchFlights_InvalidPassengers(t *testing.T) {
	w := doSearch(newTestHandler(&mockRepository{}), "origin=BKK&destination=SIN&date=2026-06-15&passengers=0")

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "INVALID_FIELD", body["error"])
}

func TestSearchFlights_RepoError(t *testing.T) {
	mock := &mockRepository{err: errors.New("db down")}

	w := doSearch(newTestHandler(mock), "origin=BKK&destination=SIN&date=2026-06-15")

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, "INTERNAL_ERROR", body["error"])
}
