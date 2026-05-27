package booking

import (
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateBooking(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
		svc := &mockService{
			booking: &Booking{ID: 1, BookingRef: "QM7X2K"},
		}
		body := map[string]any{
			"flightId": 1,
			"passenger": map[string]any{
				"firstName": "John",
				"lastName":  "Doe",
				"email":     "john@example.com",
			},
		}
		w := doCreate(newTestHandler(svc), body)

		assert.Equal(t, http.StatusCreated, w.Code)
		var resp map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, "QM7X2K", resp["bookingRef"])
		assert.EqualValues(t, 1, resp["bookingId"])
	})

	t.Run("missing flightId", func(t *testing.T) {
		body := map[string]any{
			"passenger": map[string]any{
				"firstName": "John", "lastName": "Doe", "email": "john@example.com",
			},
		}
		w := doCreate(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing passenger firstName", func(t *testing.T) {
		body := map[string]any{
			"flightId": 1,
			"passenger": map[string]any{"lastName": "Doe", "email": "john@example.com"},
		}
		w := doCreate(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing passenger lastName", func(t *testing.T) {
		body := map[string]any{
			"flightId": 1,
			"passenger": map[string]any{"firstName": "John", "email": "john@example.com"},
		}
		w := doCreate(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing passenger email", func(t *testing.T) {
		body := map[string]any{
			"flightId": 1,
			"passenger": map[string]any{"firstName": "John", "lastName": "Doe"},
		}
		w := doCreate(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("no seats available", func(t *testing.T) {
		svc := &mockService{err: ErrNoSeatsAvailable}
		body := map[string]any{
			"flightId": 6,
			"passenger": map[string]any{
				"firstName": "John", "lastName": "Doe", "email": "john@example.com",
			},
		}
		w := doCreate(newTestHandler(svc), body)
		assert.Equal(t, http.StatusConflict, w.Code)
		assertErrCode(t, w, "NO_SEATS_AVAILABLE")
	})

	t.Run("service error", func(t *testing.T) {
		svc := &mockService{err: errors.New("db down")}
		body := map[string]any{
			"flightId": 1,
			"passenger": map[string]any{
				"firstName": "John", "lastName": "Doe", "email": "john@example.com",
			},
		}
		w := doCreate(newTestHandler(svc), body)
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assertErrCode(t, w, "INTERNAL_ERROR")
	})
}
