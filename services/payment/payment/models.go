package payment

import (
	"errors"
	"time"
)

const statusConfirmed = "CONFIRMED"

var (
	// ErrAlreadyPaid is returned when a booking has already been paid.
	ErrAlreadyPaid = errors.New("booking already paid")
	// ErrAmountMismatch is returned when the charge amount does not match the booking total.
	ErrAmountMismatch = errors.New("amount does not match booking total")
	// ErrNotFound is returned when no payment record exists for a booking.
	ErrNotFound = errors.New("payment not found")
	// ErrBookingExpired is returned when a charge is attempted for a booking
	// whose seat hold has expired.
	ErrBookingExpired = errors.New("booking expired")
)

// ReceiptResponse is the response body for GET /api/payments/:bookingRef.
type ReceiptResponse struct {
	BookingRef       string  `json:"bookingRef"`
	PaymentProvider  string  `json:"paymentProvider"`
	ProviderChargeID string  `json:"providerChargeId"`
	Status           string  `json:"status"`
	AmountMinor      int64   `json:"amountMinor"`
	Currency         string  `json:"currency"`
	Amount           string  `json:"amount"`
	PaidAt           *string `json:"paidAt"`
	FailureCode      string  `json:"failureCode,omitempty"`
	FailureMessage   string  `json:"failureMessage,omitempty"`
}

// ConfirmRequest carries the data needed to call PUT /api/bookings/:ref/status.
type ConfirmRequest struct {
	PaymentID        int64
	PaymentProvider  string
	ProviderChargeID string
}

// FailedError is returned when Omise declines the card.
type FailedError struct {
	FailureCode    string
	FailureMessage string
}

func (e *FailedError) Error() string {
	return "payment failed: " + e.FailureCode
}

// ChargeRequest is the request body for POST /api/payments/charge.
// The payment service tokenizes the card with Omise internally — callers
// never interact with Omise directly.
type ChargeRequest struct {
	BookingRef      string `json:"bookingRef"`
	CardName        string `json:"cardName"`
	CardNumber      string `json:"cardNumber"`
	ExpirationMonth int    `json:"expirationMonth"`
	ExpirationYear  int    `json:"expirationYear"`
	SecurityCode    string `json:"securityCode"`
	AmountMinor     int64  `json:"amountMinor"`
	Currency        string `json:"currency"`
}

// ChargeResponse is the response body for POST /api/payments/charge.
type ChargeResponse struct {
	PaymentID        int64  `json:"paymentId"`
	PaymentProvider  string `json:"paymentProvider"`
	ProviderChargeID string `json:"providerChargeId"`
	Status           string `json:"status"`
	AmountMinor      int64  `json:"amountMinor"`
	Currency         string `json:"currency"`
	Amount           string `json:"amount"`
	PaidAt           string `json:"paidAt"`
}

// Payment represents a stored payment record.
type Payment struct {
	ID               int64
	BookingID        int64
	BookingRef       string
	PaymentProvider  string
	ProviderChargeID string
	Status           string
	AmountMinor      int64
	Currency         string
	FailureCode      string
	FailureMessage   string
	PaidAt           time.Time
}

// BookingDetail describes the booking returned by the booking service.
type BookingDetail struct {
	BookingID        int64
	BookingRef       string
	Status           string
	TotalAmountMinor int64
	Currency         string
}

// ChargeResult is the outcome of creating a charge with the payment provider.
type ChargeResult struct {
	ProviderChargeID string
	Status           string
	FailureCode      string
	FailureMessage   string
}
