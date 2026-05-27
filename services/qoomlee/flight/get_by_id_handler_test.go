package flight

import (
	"encoding/json"
	"errors"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestGetFlightByID(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
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
	})

	t.Run("not found", func(t *testing.T) {
		svc := &mockService{err: ErrNotFound}
		w := doGetByID(newTestHandler(svc), "99999")
		assert.Equal(t, http.StatusNotFound, w.Code)
		assertErrorCode(t, w, "FLIGHT_NOT_FOUND")
	})

	t.Run("invalid id", func(t *testing.T) {
		w := doGetByID(newTestHandler(&mockService{}), "abc")
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrorCode(t, w, "INVALID_FIELD")
	})

	t.Run("service error", func(t *testing.T) {
		svc := &mockService{err: errors.New("db down")}
		w := doGetByID(newTestHandler(svc), "1")
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assertErrorCode(t, w, "INTERNAL_ERROR")
	})
}
