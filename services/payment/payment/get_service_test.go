package payment

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestServiceGetByBookingRef(t *testing.T) {
	t.Run("returns payment for known booking ref", func(t *testing.T) {
		want := &Payment{
			ID:          1,
			BookingRef:  "QM7X2K",
			Status:      "SUCCEEDED",
			AmountMinor: 350000,
			Currency:    "THB",
		}
		repo := &mockRepository{getPayment: want}
		svc := NewService(&mockBookingClient{}, &mockOmiser{}, repo)

		p, err := svc.GetByBookingRef(context.Background(), "QM7X2K")

		require.NoError(t, err)
		assert.Equal(t, want, p)
	})

	t.Run("repo returns ErrNotFound → service returns ErrNotFound", func(t *testing.T) {
		repo := &mockRepository{getErr: ErrNotFound}
		svc := NewService(&mockBookingClient{}, &mockOmiser{}, repo)

		p, err := svc.GetByBookingRef(context.Background(), "NOPQRS")

		assert.ErrorIs(t, err, ErrNotFound)
		assert.Nil(t, p)
	})

	t.Run("repo error propagates", func(t *testing.T) {
		repo := &mockRepository{getErr: errors.New("db down")}
		svc := NewService(&mockBookingClient{}, &mockOmiser{}, repo)

		p, err := svc.GetByBookingRef(context.Background(), "QM7X2K")

		assert.EqualError(t, err, "db down")
		assert.Nil(t, p)
	})

	// QML-009: FAILED payment failure details propagate through the service layer
	t.Run("returns FAILED payment with failure code and message, paidAt zero", func(t *testing.T) {
		want := &Payment{
			ID:             2,
			BookingRef:     "QM7X2K",
			Status:         "FAILED",
			AmountMinor:    350000,
			Currency:       "THB",
			FailureCode:    "insufficient_fund",
			FailureMessage: "The card has insufficient funds.",
		}
		repo := &mockRepository{getPayment: want}
		svc := NewService(&mockBookingClient{}, &mockOmiser{}, repo)

		p, err := svc.GetByBookingRef(context.Background(), "QM7X2K")

		require.NoError(t, err)
		assert.Equal(t, "FAILED", p.Status)
		assert.Equal(t, "insufficient_fund", p.FailureCode)
		assert.Equal(t, "The card has insufficient funds.", p.FailureMessage)
		assert.True(t, p.PaidAt.IsZero(), "paidAt must be zero for FAILED payment")
	})
}
