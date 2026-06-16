package payment

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// HTTPBookingClient calls qoomlee-service over HTTP.
type HTTPBookingClient struct {
	baseURL       string
	internalToken string
	httpClient    *http.Client
}

// NewHTTPBookingClient creates a client pointed at the given base URL.
func NewHTTPBookingClient(baseURL, internalToken string) *HTTPBookingClient {
	return &HTTPBookingClient{
		baseURL:       baseURL,
		internalToken: internalToken,
		httpClient:    &http.Client{Timeout: 10 * time.Second},
	}
}

type bookingResponse struct {
	BookingID        int64  `json:"bookingId"`
	BookingRef       string `json:"bookingRef"`
	Status           string `json:"status"`
	TotalAmountMinor int64  `json:"totalAmountMinor"`
	Currency         string `json:"currency"`
}

// GetBooking fetches the booking detail for the given reference from qoomlee-service.
func (c *HTTPBookingClient) GetBooking(ctx context.Context, ref string) (*BookingDetail, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		fmt.Sprintf("%s/api/bookings/%s", c.baseURL, ref), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.internalToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("booking %s not found", ref)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status %d from booking service", resp.StatusCode)
	}

	var b bookingResponse
	if err := json.NewDecoder(resp.Body).Decode(&b); err != nil {
		return nil, err
	}

	return &BookingDetail{
		BookingID:        b.BookingID,
		BookingRef:       b.BookingRef,
		Status:           b.Status,
		TotalAmountMinor: b.TotalAmountMinor,
		Currency:         b.Currency,
	}, nil
}

type confirmBody struct {
	Status           string `json:"status"`
	PaymentID        int64  `json:"paymentId"`
	PaymentProvider  string `json:"paymentProvider"`
	ProviderChargeID string `json:"providerChargeId"`
}

// ConfirmBooking marks the booking as confirmed with the given payment details.
func (c *HTTPBookingClient) ConfirmBooking(ctx context.Context, ref string, req ConfirmRequest) error {
	body, _ := json.Marshal(confirmBody{
		Status:           statusConfirmed,
		PaymentID:        req.PaymentID,
		PaymentProvider:  req.PaymentProvider,
		ProviderChargeID: req.ProviderChargeID,
	})

	r, err := http.NewRequestWithContext(ctx, http.MethodPut,
		fmt.Sprintf("%s/api/bookings/%s/status", c.baseURL, ref),
		bytes.NewReader(body))
	if err != nil {
		return err
	}
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("X-Internal-Token", c.internalToken)

	resp, err := c.httpClient.Do(r)
	if err != nil {
		return err
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("confirm booking failed with status %d", resp.StatusCode)
	}
	return nil
}
