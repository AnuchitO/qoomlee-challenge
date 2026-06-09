package payment

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func doGetReceipt(h *Handler, bookingRef string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/payments/"+bookingRef, nil)
	c.Params = gin.Params{gin.Param{Key: "bookingRef", Value: bookingRef}}
	h.GetByBookingRef(c)
	return w
}

func TestGetByBookingRefHandler(t *testing.T) {
	t.Run("returns 200 with SUCCEEDED payment", func(t *testing.T) {
		paidAt := time.Date(2026, 5, 22, 10, 5, 0, 0, time.UTC)
		svc := &mockService{
			getPayment: &Payment{
				ID:               1,
				BookingRef:       "QM7X2K",
				PaymentProvider:  "OMISE",
				ProviderChargeID: "chrg_test_5fzddg8p5j3qhp1w5jg",
				Status:           "SUCCEEDED",
				AmountMinor:      350000,
				Currency:         "THB",
				PaidAt:           paidAt,
			},
		}
		w := doGetReceipt(newTestHandler(svc), "QM7X2K")

		assert.Equal(t, http.StatusOK, w.Code)
		var resp map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, "QM7X2K", resp["bookingRef"])
		assert.Equal(t, "SUCCEEDED", resp["status"])
		assert.Equal(t, "OMISE", resp["paymentProvider"])
		assert.Equal(t, "chrg_test_5fzddg8p5j3qhp1w5jg", resp["providerChargeId"])
		assert.Equal(t, "3500.00", resp["amount"])
		assert.NotNil(t, resp["paidAt"])
	})

	t.Run("returns 200 with FAILED payment — paidAt is null", func(t *testing.T) {
		svc := &mockService{
			getPayment: &Payment{
				BookingRef:       "QM7X2K",
				PaymentProvider:  "OMISE",
				ProviderChargeID: "chrg_test_declined",
				Status:           "FAILED",
				AmountMinor:      350000,
				Currency:         "THB",
				FailureCode:      "insufficient_fund",
				FailureMessage:   "The card has insufficient funds.",
			},
		}
		w := doGetReceipt(newTestHandler(svc), "QM7X2K")

		assert.Equal(t, http.StatusOK, w.Code)
		var resp map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, "FAILED", resp["status"])
		assert.Equal(t, "insufficient_fund", resp["failureCode"])
		assert.Equal(t, "The card has insufficient funds.", resp["failureMessage"])
		assert.Nil(t, resp["paidAt"])
	})

	t.Run("returns 404 when payment not found", func(t *testing.T) {
		svc := &mockService{getErr: ErrNotFound}
		w := doGetReceipt(newTestHandler(svc), "NOPQRS")

		assert.Equal(t, http.StatusNotFound, w.Code)
		assertErrCode(t, w, "NOT_FOUND")
	})

	t.Run("returns 500 on unexpected service error", func(t *testing.T) {
		svc := &mockService{getErr: errors.New("db down")}
		w := doGetReceipt(newTestHandler(svc), "QM7X2K")

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assertErrCode(t, w, "INTERNAL_ERROR")
	})
}
