//go:build contract

package payment

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestBookingClient_DecodesQoomleeContract locks the *consumer* side of the
// contract services/qoomlee/booking/contract_test.go
// (TestBookingContract_GetByRef) locks from the provider side: the JSON
// shape GET /api/bookings/:ref returns per docs/openapi/qoomlee-service.yaml,
// which bookingResponse (booking_client.go) decodes.
//
// mockBookingClient, used by the rest of this package's tests, implements
// the Go BookingClient interface directly and never touches JSON — it can't
// detect a wire-format mismatch. This test decodes a literal JSON payload
// shaped exactly like qoomlee's documented response, the same way the real
// HTTPBookingClient does, so a field renamed or retyped on either side
// breaks it before it breaks a real charge.
func TestBookingClient_DecodesQoomleeContract(t *testing.T) {
	// Field-for-field copy of what docs/openapi/qoomlee-service.yaml
	// documents for GET /api/bookings/{bookingRef} — not derived from the Go
	// struct under test.
	qoomleeResponse := `{
		"bookingId": 42,
		"bookingRef": "QM7X2K",
		"status": "PENDING",
		"totalAmountMinor": 350000,
		"currency": "THB"
	}`

	var got bookingResponse
	require.NoError(t, json.Unmarshal([]byte(qoomleeResponse), &got))

	assert.Equal(t, int64(42), got.BookingID, "contract broken: bookingId did not decode")
	assert.Equal(t, "QM7X2K", got.BookingRef, "contract broken: bookingRef did not decode")
	assert.Equal(t, "PENDING", got.Status, "contract broken: status did not decode")
	assert.Equal(t, int64(350000), got.TotalAmountMinor, "contract broken: totalAmountMinor did not decode")
	assert.Equal(t, "THB", got.Currency, "contract broken: currency did not decode")
}

// TestBookingClient_SendsQoomleeContract locks the mirror image: the request
// body ConfirmBooking (booking_client.go) sends to
// PUT /api/bookings/:ref/status must use the field names
// booking.UpdateStatusRequest binds from on the qoomlee-service side (see
// services/qoomlee/booking/models.go and
// TestBookingContract_UpdateStatus in services/qoomlee/booking/contract_test.go).
// This test only inspects the raw JSON keys confirmBody marshals to — if
// either side renames a field independently, this test and the qoomlee-side
// one can't both stay green.
func TestBookingClient_SendsQoomleeContract(t *testing.T) {
	body := confirmBody{
		Status:           statusConfirmed,
		PaymentID:        7,
		PaymentProvider:  "OMISE",
		ProviderChargeID: "chrg_test_xxx",
	}

	raw, err := json.Marshal(body)
	require.NoError(t, err)

	var got map[string]any
	require.NoError(t, json.Unmarshal(raw, &got))

	assert.Equal(t, "CONFIRMED", got["status"], "contract broken: status key changed — qoomlee-service's UpdateStatusRequest expects \"status\"")
	assert.Equal(t, float64(7), got["paymentId"], "contract broken: paymentId key changed")
	assert.Equal(t, "OMISE", got["paymentProvider"], "contract broken: paymentProvider key changed")
	assert.Equal(t, "chrg_test_xxx", got["providerChargeId"], "contract broken: providerChargeId key changed")
}
