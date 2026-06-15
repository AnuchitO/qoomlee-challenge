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

func TestRepositoryUpdateStatus(t *testing.T) {
	t.Run("updates booking to CONFIRMED with payment details", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		// Use NRPQ56 — a PENDING booking not used by other update tests
		err := repo.UpdateStatus(context.Background(), "NRPQ56", UpdateStatusRequest{
			Status:           "CONFIRMED",
			PaymentID:        99,
			PaymentProvider:  "OMISE",
			ProviderChargeID: "chrg_test_integration",
		})

		require.NoError(t, err)

		b, err := repo.GetByRef(context.Background(), "NRPQ56")
		require.NoError(t, err)
		assert.Equal(t, "CONFIRMED", b.Status)
		require.NotNil(t, b.PaymentProvider)
		assert.Equal(t, "OMISE", *b.PaymentProvider)
		require.NotNil(t, b.ProviderChargeID)
		assert.Equal(t, "chrg_test_integration", *b.ProviderChargeID)
	})

	t.Run("unknown ref returns ErrNotFound", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		err := repo.UpdateStatus(context.Background(), "XXXXXX", UpdateStatusRequest{
			Status: "CONFIRMED", PaymentID: 1,
		})

		assert.ErrorIs(t, err, ErrNotFound)
	})

	t.Run("already CONFIRMED booking returns ErrAlreadyConfirmed", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		// SEED01 is already CONFIRMED
		err := repo.UpdateStatus(context.Background(), "SEED01", UpdateStatusRequest{
			Status: "CONFIRMED", PaymentID: 1,
		})

		assert.ErrorIs(t, err, ErrAlreadyConfirmed)
	})

	t.Run("already EXPIRED booking returns ErrBookingExpired", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		ctx := context.Background()

		ref := fmt.Sprintf("X4%04d", time.Now().UnixNano()%9999)
		_, err := sharedDB.ExecContext(ctx,
			`INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount_minor, currency, expires_at, user_sub)
			 VALUES ($1, 8, 1, 'EXPIRED', 100000, 'THB', NOW() - INTERVAL '1 minute', 'user-expired')`,
			ref)
		require.NoError(t, err)

		err = repo.UpdateStatus(ctx, ref, UpdateStatusRequest{Status: "CONFIRMED", PaymentID: 1})

		assert.ErrorIs(t, err, ErrBookingExpired)
	})

	t.Run("PENDING booking past expires_at is lazily expired, seat released, and returns ErrBookingExpired", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		ctx := context.Background()

		// flight id 9; seed it with a known seat count for this test.
		_, err := sharedDB.ExecContext(ctx, "UPDATE flights SET available_seats = 8 WHERE id = 9")
		require.NoError(t, err)

		ref := fmt.Sprintf("X5%04d", time.Now().UnixNano()%9999)
		_, err = sharedDB.ExecContext(ctx,
			`INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount_minor, currency, expires_at, user_sub)
			 VALUES ($1, 9, 1, 'PENDING', 100000, 'THB', NOW() - INTERVAL '1 minute', 'user-expired')`,
			ref)
		require.NoError(t, err)
		// simulate the seat hold taken at booking creation
		_, err = sharedDB.ExecContext(ctx, "UPDATE flights SET available_seats = available_seats - 1 WHERE id = 9")
		require.NoError(t, err)

		err = repo.UpdateStatus(ctx, ref, UpdateStatusRequest{Status: "CONFIRMED", PaymentID: 1})

		assert.ErrorIs(t, err, ErrBookingExpired)

		var status string
		err = sharedDB.QueryRowContext(ctx, "SELECT status FROM bookings WHERE booking_ref = $1", ref).Scan(&status)
		require.NoError(t, err)
		assert.Equal(t, "EXPIRED", status)

		var availableSeats int
		err = sharedDB.QueryRowContext(ctx, "SELECT available_seats FROM flights WHERE id = 9").Scan(&availableSeats)
		require.NoError(t, err)
		assert.Equal(t, 8, availableSeats, "seat must be released back")
	})
}
