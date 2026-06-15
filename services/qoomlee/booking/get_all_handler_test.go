package booking

import (
	"encoding/json"
	"errors"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetAllBookings(t *testing.T) {
	t.Run("returns the caller's bookings", func(t *testing.T) {
		expiresAt := time.Now().Add(10 * time.Minute)
		svc := &mockService{
			summaries: []Summary{
				{
					BookingRef:    "SEED01",
					Status:        "CONFIRMED",
					FlightNumber:  "QM101",
					Origin:        "BKK",
					Destination:   "SIN",
					DepartureTime: time.Now(),
					Passengers:    1,
					TotalAmount:   "3500.00",
					Currency:      "THB",
				},
				{
					BookingRef:    "SEED02",
					Status:        "PENDING",
					ExpiresAt:     &expiresAt,
					FlightNumber:  "QM102",
					Origin:        "SIN",
					Destination:   "BKK",
					DepartureTime: time.Now(),
					Passengers:    1,
					TotalAmount:   "3500.00",
					Currency:      "THB",
				},
			},
		}

		w := doGetAll(newTestHandler(svc), "user-123")
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "user-123", svc.gotGetAllSub)

		var resp []map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		require.Len(t, resp, 2)

		assert.Equal(t, "SEED01", resp[0]["bookingRef"])
		assert.Equal(t, "CONFIRMED", resp[0]["status"])
		assert.Nil(t, resp[0]["expiresAt"])

		assert.Equal(t, "SEED02", resp[1]["bookingRef"])
		assert.Equal(t, "PENDING", resp[1]["status"])
		assert.NotNil(t, resp[1]["expiresAt"])
	})

	t.Run("returns empty array when no bookings", func(t *testing.T) {
		svc := &mockService{summaries: []Summary{}}

		w := doGetAll(newTestHandler(svc), "user-123")
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "[]", w.Body.String())
	})

	t.Run("service error", func(t *testing.T) {
		svc := &mockService{err: errors.New("db down")}
		w := doGetAll(newTestHandler(svc), "user-123")
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assertErrCode(t, w, "INTERNAL_ERROR")
	})
}
