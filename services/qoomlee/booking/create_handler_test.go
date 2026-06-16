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

// TestCreateBooking_BookingToken covers QML-048: bookingToken deduplication.
func TestCreateBooking_BookingToken(t *testing.T) {
	body := map[string]any{
		"flightId": 1,
		"passenger": map[string]any{
			"firstName": "John", "lastName": "Doe", "email": "john@example.com",
		},
	}

	t.Run("bookingToken query param is forwarded to service", func(t *testing.T) {
		svc := &mockService{booking: &Booking{ID: 1, BookingRef: "QM7X2K"}}
		w := doCreateWithToken(newTestHandler(svc), body, "test-booking-token-uuid")

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Equal(t, "test-booking-token-uuid", svc.gotCreateReq.BookingToken)
	})

	t.Run("missing bookingToken forwards empty string and still creates booking", func(t *testing.T) {
		svc := &mockService{booking: &Booking{ID: 2, BookingRef: "ABCDEF"}}
		w := doCreate(newTestHandler(svc), body)

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Equal(t, "", svc.gotCreateReq.BookingToken)
	})
}

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

	t.Run("forwards user_sub from JWT claims and returns expiresAt", func(t *testing.T) {
		expiresAt := time.Date(2026, 6, 14, 12, 30, 0, 0, time.UTC)
		svc := &mockService{
			booking: &Booking{ID: 1, BookingRef: "QM7X2K", ExpiresAt: &expiresAt},
		}
		body := map[string]any{
			"flightId": 1,
			"passenger": map[string]any{
				"firstName": "John", "lastName": "Doe", "email": "john@example.com",
			},
		}
		w := doCreateAs(newTestHandler(svc), body, "user-123")

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Equal(t, "user-123", svc.gotCreateReq.UserSub)

		var resp map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, expiresAt.Format(time.RFC3339), resp["expiresAt"])
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
			"flightId":  1,
			"passenger": map[string]any{"lastName": "Doe", "email": "john@example.com"},
		}
		w := doCreate(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing passenger lastName", func(t *testing.T) {
		body := map[string]any{
			"flightId":  1,
			"passenger": map[string]any{"firstName": "John", "email": "john@example.com"},
		}
		w := doCreate(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing passenger email", func(t *testing.T) {
		body := map[string]any{
			"flightId":  1,
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
