package payment

import (
	"bytes"
	"context"
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

// --- mock Service ---

type mockService struct {
	payment    *Payment
	err        error
	getPayment *Payment
	getErr     error
}

func (m *mockService) Charge(_ context.Context, _ ChargeRequest) (*Payment, error) {
	return m.payment, m.err
}

func (m *mockService) GetByBookingRef(_ context.Context, _ string) (*Payment, error) {
	return m.getPayment, m.getErr
}

// --- helpers ---

func newTestHandler(svc Service) *Handler {
	return NewHandler(svc)
}

func doCharge(h *Handler, body any) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	b, _ := json.Marshal(body)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/payments/charge", bytes.NewReader(b))
	c.Request.Header.Set("Content-Type", "application/json")
	h.Charge(c)
	return w
}

func assertErrCode(t *testing.T, w *httptest.ResponseRecorder, code string) {
	t.Helper()
	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, code, body["error"])
}

var validBody = map[string]any{
	"bookingRef":      "QM7X2K",
	"cardName":        "John Doe",
	"cardNumber":      "4242424242424242",
	"expirationMonth": 12,
	"expirationYear":  2028,
	"securityCode":    "123",
	"amountMinor":     350000,
	"currency":        "THB",
}

// ─── Charge handler tests ─────────────────────────────────────────────────────

func TestChargeHandler(t *testing.T) {
	t.Run("happy path returns 201 with SUCCEEDED payment", func(t *testing.T) {
		svc := &mockService{
			payment: &Payment{
				ID:               1,
				PaymentProvider:  "OMISE",
				ProviderChargeID: "chrg_test_5fzddg8p5j3qhp1w5jg",
				Status:           "SUCCEEDED",
				AmountMinor:      350000,
				Currency:         "THB",
				PaidAt:           time.Now(),
			},
		}
		w := doCharge(newTestHandler(svc), validBody)

		assert.Equal(t, http.StatusCreated, w.Code)
		var resp map[string]any
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, "SUCCEEDED", resp["status"])
		assert.Equal(t, "OMISE", resp["paymentProvider"])
		assert.Equal(t, "chrg_test_5fzddg8p5j3qhp1w5jg", resp["providerChargeId"])
	})

	t.Run("missing bookingRef returns 400", func(t *testing.T) {
		body := map[string]any{"cardNumber": "4242424242424242", "expirationMonth": 12, "expirationYear": 2028, "amountMinor": 350000}
		w := doCharge(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing cardNumber returns 400", func(t *testing.T) {
		body := map[string]any{"bookingRef": "QM7X2K", "expirationMonth": 12, "expirationYear": 2028, "amountMinor": 350000}
		w := doCharge(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing expiration dates returns 400", func(t *testing.T) {
		body := map[string]any{"bookingRef": "QM7X2K", "cardNumber": "4242424242424242", "amountMinor": 350000}
		w := doCharge(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("missing amountMinor returns 400", func(t *testing.T) {
		body := map[string]any{"bookingRef": "QM7X2K", "cardNumber": "4242424242424242", "expirationMonth": 12, "expirationYear": 2028}
		w := doCharge(newTestHandler(&mockService{}), body)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "MISSING_REQUIRED_FIELD")
	})

	t.Run("already paid returns 409", func(t *testing.T) {
		svc := &mockService{err: ErrAlreadyPaid}
		w := doCharge(newTestHandler(svc), validBody)
		assert.Equal(t, http.StatusConflict, w.Code)
		assertErrCode(t, w, "ALREADY_PAID")
	})

	t.Run("amount mismatch returns 400", func(t *testing.T) {
		svc := &mockService{err: ErrAmountMismatch}
		w := doCharge(newTestHandler(svc), validBody)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assertErrCode(t, w, "AMOUNT_MISMATCH")
	})

	t.Run("card declined returns 402 with failure details", func(t *testing.T) {
		svc := &mockService{err: &FailedError{
			FailureCode:    "insufficient_fund",
			FailureMessage: "The card has insufficient funds.",
		}}
		w := doCharge(newTestHandler(svc), validBody)
		assert.Equal(t, http.StatusPaymentRequired, w.Code)
		var resp map[string]string
		require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
		assert.Equal(t, "PAYMENT_FAILED", resp["error"])
		assert.Equal(t, "insufficient_fund", resp["failureCode"])
		assert.Equal(t, "The card has insufficient funds.", resp["failureMessage"])
	})

	t.Run("service error returns 500", func(t *testing.T) {
		svc := &mockService{err: errors.New("db down")}
		w := doCharge(newTestHandler(svc), validBody)
		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assertErrCode(t, w, "INTERNAL_ERROR")
	})

	t.Run("expired booking returns 409 booking_expired", func(t *testing.T) {
		svc := &mockService{err: ErrBookingExpired}
		w := doCharge(newTestHandler(svc), validBody)
		assert.Equal(t, http.StatusConflict, w.Code)
		assertErrCode(t, w, "booking_expired")
	})
}
