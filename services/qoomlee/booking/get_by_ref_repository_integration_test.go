//go:build integration

package booking

import (
	"context"
	"fmt"
	"testing"
	"time"

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
		require.NotNil(t, b.ExpiresAt, "PENDING booking must include expiresAt")
		assert.True(t, b.ExpiresAt.After(time.Now()), "SEED02 expires_at should be in the future")
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
		assert.Nil(t, b.ExpiresAt, "CONFIRMED booking must not include expiresAt")
	})

	t.Run("unknown ref returns ErrNotFound", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		b, err := repo.GetByRef(context.Background(), "XXXXXX")

		assert.ErrorIs(t, err, ErrNotFound)
		assert.Nil(t, b)
	})

	t.Run("PENDING booking past expires_at is lazily expired and seat is released", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		ctx := context.Background()

		// flight 6 = QM301 (BKK->CNX); seed it with a known seat count for this test.
		_, err := sharedDB.ExecContext(ctx, "UPDATE flights SET available_seats = 10 WHERE id = 6")
		require.NoError(t, err)

		ref := fmt.Sprintf("X1%04d", time.Now().UnixNano()%9999)
		_, err = sharedDB.ExecContext(ctx,
			`INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount_minor, currency, expires_at, user_sub)
			 VALUES ($1, 6, 1, 'PENDING', 100000, 'THB', NOW() - INTERVAL '1 minute', 'user-expired')`,
			ref)
		require.NoError(t, err)
		// simulate the seat hold taken at booking creation
		_, err = sharedDB.ExecContext(ctx, "UPDATE flights SET available_seats = available_seats - 1 WHERE id = 6")
		require.NoError(t, err)

		b, err := repo.GetByRef(ctx, ref)
		require.NoError(t, err)
		require.NotNil(t, b)
		assert.Equal(t, "EXPIRED", b.Status)
		assert.Nil(t, b.ExpiresAt, "expired booking must not include expiresAt")

		var status string
		err = sharedDB.QueryRowContext(ctx, "SELECT status FROM bookings WHERE booking_ref = $1", ref).Scan(&status)
		require.NoError(t, err)
		assert.Equal(t, "EXPIRED", status)

		var availableSeats int
		err = sharedDB.QueryRowContext(ctx, "SELECT available_seats FROM flights WHERE id = 6").Scan(&availableSeats)
		require.NoError(t, err)
		assert.Equal(t, 10, availableSeats, "seat must be released back")
	})

	t.Run("already EXPIRED booking is returned unchanged with no extra seat increment", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		ctx := context.Background()

		_, err := sharedDB.ExecContext(ctx, "UPDATE flights SET available_seats = 7 WHERE id = 7")
		require.NoError(t, err)

		ref := fmt.Sprintf("X2%04d", time.Now().UnixNano()%9999)
		_, err = sharedDB.ExecContext(ctx,
			`INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount_minor, currency, expires_at, user_sub)
			 VALUES ($1, 7, 1, 'EXPIRED', 100000, 'THB', NOW() - INTERVAL '1 minute', 'user-expired')`,
			ref)
		require.NoError(t, err)

		b, err := repo.GetByRef(ctx, ref)
		require.NoError(t, err)
		assert.Equal(t, "EXPIRED", b.Status)
		assert.Nil(t, b.ExpiresAt)

		var availableSeats int
		err = sharedDB.QueryRowContext(ctx, "SELECT available_seats FROM flights WHERE id = 7").Scan(&availableSeats)
		require.NoError(t, err)
		assert.Equal(t, 7, availableSeats, "available_seats must not change for an already-EXPIRED booking")
	})
}
