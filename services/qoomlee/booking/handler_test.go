package booking

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
	booking *Booking
	err     error
}

func (m *mockService) Create(_ context.Context, _ CreateRequest) (*Booking, error) {
	return m.booking, m.err
}

func (m *mockService) GetByRef(_ context.Context, _ string) (*Booking, error) {
	return m.booking, m.err
}

func (m *mockService) UpdateStatus(_ context.Context, _ string, _ UpdateStatusRequest) error {
	return m.err
}

// --- helpers ---

func newTestHandler(svc Service) *Handler {
	return NewHandler(svc)
}

func doCreate(h *Handler, body any) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	b, _ := json.Marshal(body)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/bookings", bytes.NewReader(b))
	c.Request.Header.Set("Content-Type", "application/json")
	h.Create(c)
	return w
}

func doGetByRef(h *Handler, ref string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/api/bookings/"+ref, nil)
	c.Params = gin.Params{{Key: "bookingRef", Value: ref}}
	h.GetByRef(c)
	return w
}

func doUpdateStatus(h *Handler, ref string, body any) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	b, _ := json.Marshal(body)
	c.Request = httptest.NewRequest(http.MethodPut, "/api/bookings/"+ref+"/status", bytes.NewReader(b))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Params = gin.Params{{Key: "bookingRef", Value: ref}}
	h.UpdateStatus(c)
	return w
}

func assertErrCode(t *testing.T, w *httptest.ResponseRecorder, code string) {
	t.Helper()
	var body map[string]string
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &body))
	assert.Equal(t, code, body["error"])
}

// --- Create tests ---

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

// --- GetByRef tests ---

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

// --- UpdateStatus tests ---

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
}
