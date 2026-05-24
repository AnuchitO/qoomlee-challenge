package model

import "time"

type Payment struct {
	ID             int64      `json:"id"`
	BookingRef     string     `json:"bookingRef"`
	BookingID      int64      `json:"bookingId"`
	Amount         int64      `json:"amount"` // in satang (THB smallest unit)
	Currency       string     `json:"currency"`
	Status         string     `json:"status"`
	OmiseChargeID  string     `json:"omiseChargeId,omitempty"`
	FailureCode    string     `json:"failureCode,omitempty"`
	FailureMessage string     `json:"failureMessage,omitempty"`
	PaidAt         *time.Time `json:"paidAt,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
}

type ChargeRequest struct {
	BookingRef  string `json:"bookingRef" binding:"required"`
	BookingID   int64  `json:"bookingId" binding:"required"`
	Amount      int64  `json:"amount" binding:"required"` // satang
	Currency    string `json:"currency"`
	OmiseToken  string `json:"omiseToken" binding:"required"`
}

type ChargeResponse struct {
	PaymentID     int64      `json:"paymentId"`
	OmiseChargeID string     `json:"omiseChargeId"`
	Status        string     `json:"status"`
	Amount        int64      `json:"amount"`
	Currency      string     `json:"currency"`
	PaidAt        *time.Time `json:"paidAt,omitempty"`
}

type ChargeErrorResponse struct {
	Error          string `json:"error"`
	FailureCode    string `json:"failureCode"`
	FailureMessage string `json:"failureMessage"`
}
