package payment

import (
	"errors"
	"time"
)

const statusConfirmed = "CONFIRMED"

var (
	ErrAlreadyPaid    = errors.New("booking already paid")
	ErrAmountMismatch = errors.New("amount does not match booking total")
)

// ConfirmRequest carries the data needed to call PUT /api/bookings/:ref/status.
type ConfirmRequest struct {
	PaymentID        int64
	PaymentProvider  string
	ProviderChargeID string
}

// PaymentFailedError is returned when Omise declines the card.
type PaymentFailedError struct {
	FailureCode    string
	FailureMessage string
}

func (e *PaymentFailedError) Error() string {
	return "payment failed: " + e.FailureCode
}

type ChargeRequest struct {
	BookingRef  string `json:"bookingRef"`
	OmiseToken  string `json:"omiseToken"`
	AmountMinor int64  `json:"amountMinor"`
	Currency    string `json:"currency"`
}

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

type BookingDetail struct {
	BookingID        int64
	BookingRef       string
	Status           string
	TotalAmountMinor int64
	Currency         string
}

type ChargeResult struct {
	ProviderChargeID string
	Status           string
	FailureCode      string
	FailureMessage   string
}
