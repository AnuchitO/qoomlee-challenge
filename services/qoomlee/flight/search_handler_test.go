package flight

import (
	"encoding/json"
	"errors"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSearchFlights(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
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
	})

	t.Run("no match returns empty list", func(t *testing.T) {
		svc := &mockService{flights: []Flight{}}

		w := doSearch(newTestHandler(svc), "origin=BKK&destination=SIN&date=2026-06-15&passengers=1")

		assert.Equal(t, http.StatusOK, w.Code)

		var body map[string]any
		assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))

		flights, ok := body["flights"].([]any)
		assert.True(t, ok, "response must have a 'flights' array")
		assert.Empty(t, flights)
	})

	t.Run("missing origin", func(t *testing.T) {
		w := doSearch(newTestHandler(&mockService{}), "destination=SIN&date=2026-06-15")
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrorCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing destination", func(t *testing.T) {
		w := doSearch(newTestHandler(&mockService{}), "origin=BKK&date=2026-06-15")
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrorCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing date", func(t *testing.T) {
		w := doSearch(newTestHandler(&mockService{}), "origin=BKK&destination=SIN")
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrorCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("invalid date format", func(t *testing.T) {
		w := doSearch(newTestHandler(&mockService{}), "origin=BKK&destination=SIN&date=15-06-2026")
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrorCode(t, w, "INVALID_DATE_FORMAT")
	})

	t.Run("invalid passengers", func(t *testing.T) {
		w := doSearch(newTestHandler(&mockService{}), "origin=BKK&destination=SIN&date=2026-06-15&passengers=0")
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrorCode(t, w, "INVALID_FIELD")
	})

	t.Run("service error", func(t *testing.T) {
		svc := &mockService{err: errors.New("db down")}
		w := doSearch(newTestHandler(svc), "origin=BKK&destination=SIN&date=2026-06-15")
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assertErrorCode(t, w, "INTERNAL_ERROR")
	})
}
