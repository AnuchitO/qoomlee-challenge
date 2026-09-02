//go:build contract

package flight

import (
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestFlightContract_GetByID locks down the JSON *shape* of GET /api/flights/:id —
// the response documented in docs/openapi/qoomlee-service.yaml (generated from
// the @Success annotation on GetByID, see get_by_id_handler.go). The web app and
// the payment service both depend on this shape staying stable.
//
// This is deliberately NOT a duplicate of get_by_id_handler_test.go. The unit
// tests in that file check business logic ("does the handler return 404 when the
// service returns ErrNotFound?"). This test doesn't care about logic at all — it
// only asserts that every field a consumer relies on is present, with the right
// JSON type. Rename a field, drop it, or silently change basePriceMinor from an
// int to a float, and this test fails before it breaks whoever's calling this API.
func TestFlightContract_GetByID(t *testing.T) {
	svc := &mockService{
		flight: &Flight{
			ID:              1,
			FlightNumber:    "QM101",
			Origin:          "BKK",
			Destination:     "SIN",
			DepartureTime:   time.Now(),
			ArrivalTime:     time.Now(),
			Status:          "SCHEDULED",
			BasePriceMinor:  350000,
			BasePrice:       "3500.00",
			Currency:        "THB",
			AvailableSeats:  152,
			DurationMinutes: 210,
		},
	}

	w := doGetByID(newTestHandler(svc), "1")
	require.Equal(t, http.StatusOK, w.Code)

	var body map[string]any
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))

	// Every field the contract in docs/openapi/qoomlee-service.yaml promises.
	requiredFields := []string{
		"id", "flightNumber", "origin", "destination",
		"departureTime", "arrivalTime", "status",
		"basePriceMinor", "basePrice", "currency",
		"availableSeats", "durationMinutes",
	}
	for _, field := range requiredFields {
		assert.Containsf(t, body, field, "contract broken: response is missing %q", field)
	}

	// Type contract: money stays an integer (minor units), never a float — the
	// kind of silent breakage a contract test catches that a unit test (which
	// only checks values it already expects) would not.
	_, isNumber := body["basePriceMinor"].(float64)
	assert.True(t, isNumber, "contract broken: basePriceMinor must be numeric")
}
