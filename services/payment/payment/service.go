package payment

import (
	"context"
	"time"
)

// BookingClient fetches and updates bookings on qoomlee-service.
type BookingClient interface {
	GetBooking(ctx context.Context, ref string) (*BookingDetail, error)
	ConfirmBooking(ctx context.Context, ref string, req ConfirmRequest) error
}

// Omiser abstracts the Omise payment gateway.
type Omiser interface {
	CreateCharge(ctx context.Context, token string, amount int64, currency string) (*ChargeResult, error)
}

// Repository persists payment records.
type Repository interface {
	Insert(ctx context.Context, p *Payment) (*Payment, error)
}

// Service is the business-logic interface for the payment domain.
type Service interface {
	Charge(ctx context.Context, req ChargeRequest) (*Payment, error)
}

type service struct {
	bookingClient BookingClient
	omise         Omiser
	repo          Repository
}

// NewService creates a payment Service backed by the given dependencies.
func NewService(bookingClient BookingClient, omise Omiser, repo Repository) Service {
	return &service{bookingClient: bookingClient, omise: omise, repo: repo}
}

func (s *service) Charge(ctx context.Context, req ChargeRequest) (*Payment, error) {
	booking, err := s.bookingClient.GetBooking(ctx, req.BookingRef)
	if err != nil {
		return nil, err
	}

	if booking.Status == statusConfirmed {
		return nil, ErrAlreadyPaid
	}

	if req.AmountMinor != booking.TotalAmountMinor || req.Currency != booking.Currency {
		return nil, ErrAmountMismatch
	}

	result, err := s.omise.CreateCharge(ctx, req.OmiseToken, req.AmountMinor, req.Currency)
	if err != nil {
		return nil, err
	}

	p := &Payment{
		BookingRef:       req.BookingRef,
		BookingID:        booking.BookingID,
		PaymentProvider:  "OMISE",
		ProviderChargeID: result.ProviderChargeID,
		AmountMinor:      req.AmountMinor,
		Currency:         req.Currency,
	}

	if result.Status == "failed" {
		p.Status = "FAILED"
		p.FailureCode = result.FailureCode
		p.FailureMessage = result.FailureMessage
		if _, err := s.repo.Insert(ctx, p); err != nil {
			return nil, err
		}
		return nil, &PaymentFailedError{
			FailureCode:    result.FailureCode,
			FailureMessage: result.FailureMessage,
		}
	}

	p.Status = "SUCCEEDED"
	p.PaidAt = time.Now().UTC()
	inserted, err := s.repo.Insert(ctx, p)
	if err != nil {
		return nil, err
	}

	if err := s.bookingClient.ConfirmBooking(ctx, req.BookingRef, ConfirmRequest{
		PaymentID:        inserted.ID,
		PaymentProvider:  inserted.PaymentProvider,
		ProviderChargeID: inserted.ProviderChargeID,
	}); err != nil {
		return nil, err
	}

	return inserted, nil
}
