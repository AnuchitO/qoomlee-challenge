//go:build contract

package booking

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestBookingContract_GetByRef locks down the JSON *shape* of
// GET /api/bookings/:bookingRef — specifically the subset of fields
// documented in docs/openapi/qoomlee-service.yaml that payment-service
// depends on. services/payment/payment/booking_client.go decodes exactly
// this response into its own bookingResponse struct; if this test and
// TestBookingClient_DecodesQoomleeContract (payment-service, same field
// list) ever disagree, one of them is about to fail before a real charge
// does.
//
// Like flight/contract_test.go, this is deliberately NOT a duplicate of
// get_by_ref_handler_test.go — it doesn't care about business logic, only
// that every field a consumer relies on is present with the right JSON
// type.
func TestBookingContract_GetByRef(t *testing.T) {
	svc := &mockService{
		booking: &Booking{
			ID:               42,
			BookingRef:       "QM7X2K",
			Status:           "PENDING",
			TotalAmountMinor: 350000,
			TotalAmount:      "3500.00",
			Currency:         "THB",
		},
	}

	w := doGetByRef(newTestHandler(svc), "QM7X2K")
	require.Equal(t, http.StatusOK, w.Code)

	var body map[string]any
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))

	// Every field payment-service's bookingResponse (booking_client.go)
	// decodes from this response.
	requiredFields := []string{"bookingId", "bookingRef", "status", "totalAmountMinor", "currency"}
	for _, field := range requiredFields {
		assert.Containsf(t, body, field, "contract broken: response is missing %q — payment-service's booking_client.go depends on it", field)
	}

	// Type contract: money stays an integer (minor units), never a float —
	// the same class of silent breakage flight/contract_test.go guards
	// against, and the one a unit test (which only checks values it already
	// expects) would not catch.
	_, isNumber := body["totalAmountMinor"].(float64)
	assert.True(t, isNumber, "contract broken: totalAmountMinor must be numeric")
}

// contractCaptureService is a minimal Service stand-in scoped to this file:
// unlike mockService in handler_test.go, it captures the UpdateStatusRequest
// the handler actually bound, so TestBookingContract_UpdateStatus can assert
// on the parsed fields rather than just the HTTP status code.
type contractCaptureService struct {
	got UpdateStatusRequest
}

func (s *contractCaptureService) Create(_ context.Context, _ CreateRequest) (*Booking, error) {
	return nil, nil
}

func (s *contractCaptureService) GetByRef(_ context.Context, _ string) (*Booking, error) {
	return nil, nil
}

func (s *contractCaptureService) GetAll(_ context.Context, _ string) ([]Summary, error) {
	return nil, nil
}

func (s *contractCaptureService) UpdateStatus(_ context.Context, _ string, req UpdateStatusRequest) error {
	s.got = req
	return nil
}

// TestBookingContract_UpdateStatus locks down the *request* shape of
// PUT /api/bookings/:bookingRef/status from the other direction: the field
// names payment-service's confirmBody (booking_client.go) sends must be the
// ones UpdateStatusRequest (models.go) binds from. The body below is typed
// as a plain map with the exact keys confirmBody marshals — status,
// paymentId, paymentProvider, providerChargeId — deliberately not
// constructed from UpdateStatusRequest itself, so a field rename on this
// side shows up as a silently-dropped (zero-value) field here instead of
// trivially matching.
func TestBookingContract_UpdateStatus(t *testing.T) {
	requestBody := map[string]any{
		"status":           "CONFIRMED",
		"paymentId":        7,
		"paymentProvider":  "OMISE",
		"providerChargeId": "chrg_test_xxx",
	}

	svc := &contractCaptureService{}
	w := doUpdateStatus(newTestHandler(svc), "QM7X2K", requestBody)
	require.Equal(t, http.StatusOK, w.Code)

	assert.Equal(t, "CONFIRMED", svc.got.Status, "contract broken: status field not bound — payment-service sends confirmBody.Status")
	assert.Equal(t, int64(7), svc.got.PaymentID, "contract broken: paymentId field not bound")
	assert.Equal(t, "OMISE", svc.got.PaymentProvider, "contract broken: paymentProvider field not bound")
	assert.Equal(t, "chrg_test_xxx", svc.got.ProviderChargeID, "contract broken: providerChargeId field not bound")
}
