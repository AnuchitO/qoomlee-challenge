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

func TestGetBookingByRef(t *testing.T) {
	provider := "OMISE"
	chargeID := "chrg_test_5xkm2r9p8wqv3ntzy7au"

	t.Run("happy path confirmed booking", func(t *testing.T) {
		svc := &mockService{
			booking: &Booking{
				ID:               1,
				BookingRef:       "SEED01",
				Status:           "CONFIRMED",
				TotalAmountMinor: 350000,
				TotalAmount:      "3500.00",
				Currency:         "THB",
				PaymentProvider:  &provider,
				ProviderChargeID: &chargeID,
				Passenger:        Passenger{FirstName: "Seed", LastName: "User", Email: "seed@example.com"},
				Flight: FlightSummary{
					FlightNumber:  "QM101",
					Origin:        "BKK",
					Destination:   "SIN",
					DepartureTime: time.Now(),
					ArrivalTime:   time.Now(),
				},
			},
		}

		w := doGetByRef(newTestHandler(svc), "SEED01")
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, "SEED01", resp["bookingRef"])
		assert.Equal(t, "CONFIRMED", resp["status"])
		assert.Equal(t, "OMISE", resp["paymentProvider"])
		assert.Equal(t, "chrg_test_5xkm2r9p8wqv3ntzy7au", resp["providerChargeId"])
		assert.NotNil(t, resp["passenger"])
		assert.NotNil(t, resp["flight"])
	})

	t.Run("pending booking has null payment fields", func(t *testing.T) {
		svc := &mockService{
			booking: &Booking{
				ID: 2, BookingRef: "SEED02", Status: "PENDING",
				TotalAmountMinor: 350000, TotalAmount: "3500.00", Currency: "THB",
				PaymentProvider: nil, ProviderChargeID: nil,
			},
		}
		w := doGetByRef(newTestHandler(svc), "SEED02")
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, "PENDING", resp["status"])
		assert.Nil(t, resp["paymentProvider"])
		assert.Nil(t, resp["providerChargeId"])
	})

	t.Run("expired booking returns status EXPIRED with no expiresAt", func(t *testing.T) {
		svc := &mockService{
			booking: &Booking{
				ID: 3, BookingRef: "EXPRD1", Status: "EXPIRED",
				TotalAmountMinor: 350000, TotalAmount: "3500.00", Currency: "THB",
				ExpiresAt: nil, // lazy-expired; must not appear in response
				Flight: FlightSummary{
					FlightNumber:  "QM101",
					Origin:        "BKK",
					Destination:   "SIN",
					DepartureTime: time.Now(),
					ArrivalTime:   time.Now(),
				},
			},
		}
		w := doGetByRef(newTestHandler(svc), "EXPRD1")
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, "EXPIRED", resp["status"])
		assert.Nil(t, resp["expiresAt"], "expiresAt must be absent for an expired booking")
	})

	t.Run("not found", func(t *testing.T) {
		svc := &mockService{err: ErrNotFound}
		w := doGetByRef(newTestHandler(svc), "XXXXXX")
		assert.Equal(t, http.StatusNotFound, w.Code)
		assertErrCode(t, w, "BOOKING_NOT_FOUND")
	})

	t.Run("service error", func(t *testing.T) {
		svc := &mockService{err: errors.New("db down")}
		w := doGetByRef(newTestHandler(svc), "SEED01")
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assertErrCode(t, w, "INTERNAL_ERROR")
	})
}
