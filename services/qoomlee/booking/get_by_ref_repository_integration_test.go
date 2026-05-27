//go:build integration

package booking

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRepositoryGetByRef(t *testing.T) {
	t.Run("SEED02 returns pending booking with nested passenger and flight", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		b, err := repo.GetByRef(context.Background(), "SEED02")

		require.NoError(t, err)
		require.NotNil(t, b)
		assert.Equal(t, "SEED02", b.BookingRef)
		assert.Equal(t, "PENDING", b.Status)
		assert.Greater(t, b.TotalAmountMinor, int64(0))
		assert.NotEmpty(t, b.Currency)
		assert.NotEmpty(t, b.Passenger.FirstName)
		assert.NotEmpty(t, b.Passenger.LastName)
		assert.NotEmpty(t, b.Passenger.Email)
		assert.NotEmpty(t, b.Flight.FlightNumber)
		assert.NotEmpty(t, b.Flight.Origin)
		assert.NotEmpty(t, b.Flight.Destination)
		assert.False(t, b.Flight.DepartureTime.IsZero())
		assert.Nil(t, b.PaymentProvider)
		assert.Nil(t, b.ProviderChargeID)
	})

	t.Run("SEED01 confirmed booking has payment provider and charge ID", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		b, err := repo.GetByRef(context.Background(), "SEED01")

		require.NoError(t, err)
		require.NotNil(t, b)
		assert.Equal(t, "CONFIRMED", b.Status)
		require.NotNil(t, b.PaymentProvider)
		assert.Equal(t, "OMISE", *b.PaymentProvider)
		require.NotNil(t, b.ProviderChargeID)
		assert.Equal(t, "chrg_test_5xkm2r9p8wqv3ntzy7au", *b.ProviderChargeID)
	})

	t.Run("unknown ref returns ErrNotFound", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		b, err := repo.GetByRef(context.Background(), "XXXXXX")

		assert.ErrorIs(t, err, ErrNotFound)
		assert.Nil(t, b)
	})
}
