package booking

import (
	"errors"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUpdateBookingStatus(t *testing.T) {
	validBody := map[string]any{
		"status":           "CONFIRMED",
		"paymentId":        1,
		"paymentProvider":  "OMISE",
		"providerChargeId": "chrg_test_xxx",
	}

	t.Run("happy path", func(t *testing.T) {
		w := doUpdateStatus(newTestHandler(&mockService{}), "SEED02", validBody)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("invalid status", func(t *testing.T) {
		body := map[string]any{"status": "CANCELLED"}
		w := doUpdateStatus(newTestHandler(&mockService{}), "SEED02", body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "INVALID_STATUS")
	})

	t.Run("not found", func(t *testing.T) {
		svc := &mockService{err: ErrNotFound}
		w := doUpdateStatus(newTestHandler(svc), "XXXXXX", validBody)
		assert.Equal(t, http.StatusNotFound, w.Code)
		assertErrCode(t, w, "BOOKING_NOT_FOUND")
	})

	t.Run("service error", func(t *testing.T) {
		svc := &mockService{err: errors.New("db down")}
		w := doUpdateStatus(newTestHandler(svc), "SEED02", validBody)
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assertErrCode(t, w, "INTERNAL_ERROR")
	})

	t.Run("expired booking returns 409 booking_expired", func(t *testing.T) {
		svc := &mockService{err: ErrBookingExpired}
		w := doUpdateStatus(newTestHandler(svc), "SEED02", validBody)
		assert.Equal(t, http.StatusConflict, w.Code)
		assertErrCode(t, w, "booking_expired")
	})

	t.Run("already confirmed booking returns 409 already_confirmed", func(t *testing.T) {
		svc := &mockService{err: ErrAlreadyConfirmed}
		w := doUpdateStatus(newTestHandler(svc), "SEED01", validBody)
		assert.Equal(t, http.StatusConflict, w.Code)
		assertErrCode(t, w, "already_confirmed")
	})
}
