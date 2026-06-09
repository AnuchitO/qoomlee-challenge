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
}
