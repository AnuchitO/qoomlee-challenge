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

func TestRepositoryGetAll(t *testing.T) {
	t.Run("returns only the caller's bookings, most recent first", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		summaries, err := repo.GetAll(context.Background(), "seed-user-01")

		require.NoError(t, err)
		require.Len(t, summaries, 2)
		assert.Equal(t, "SEED02", summaries[0].BookingRef, "SEED02 was created after SEED01")
		assert.Equal(t, "SEED01", summaries[1].BookingRef)
	})

	t.Run("CONFIRMED rows omit expiresAt, PENDING rows include it", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		summaries, err := repo.GetAll(context.Background(), "seed-user-01")
		require.NoError(t, err)
		require.Len(t, summaries, 2)

		for _, s := range summaries {
			switch s.BookingRef {
			case "SEED01":
				assert.Equal(t, "CONFIRMED", s.Status)
				assert.Nil(t, s.ExpiresAt)
			case "SEED02":
				assert.Equal(t, "PENDING", s.Status)
				require.NotNil(t, s.ExpiresAt)
				assert.True(t, s.ExpiresAt.After(time.Now()))
			}
			assert.Equal(t, 1, s.Passengers)
			assert.NotEmpty(t, s.FlightNumber)
			assert.NotEmpty(t, s.Origin)
			assert.NotEmpty(t, s.Destination)
			assert.NotEmpty(t, s.TotalAmount)
			assert.NotEmpty(t, s.Currency)
		}
	})

	t.Run("unknown user has no bookings", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		summaries, err := repo.GetAll(context.Background(), "no-such-user")

		require.NoError(t, err)
		assert.Empty(t, summaries)
	})

	t.Run("PENDING booking past expires_at is lazily expired and seat is released", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		ctx := context.Background()

		_, err := sharedDB.ExecContext(ctx, "UPDATE flights SET available_seats = 20 WHERE id = 8")
		require.NoError(t, err)

		user := fmt.Sprintf("user-list-expire-%d", time.Now().UnixNano())
		ref := fmt.Sprintf("X3%04d", time.Now().UnixNano()%9999)
		_, err = sharedDB.ExecContext(ctx,
			`INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount_minor, currency, expires_at, user_sub)
			 VALUES ($1, 8, 1, 'PENDING', 100000, 'THB', NOW() - INTERVAL '1 minute', $2)`,
			ref, user)
		require.NoError(t, err)
		_, err = sharedDB.ExecContext(ctx, "UPDATE flights SET available_seats = available_seats - 1 WHERE id = 8")
		require.NoError(t, err)

		summaries, err := repo.GetAll(ctx, user)
		require.NoError(t, err)
		require.Len(t, summaries, 1)
		assert.Equal(t, "EXPIRED", summaries[0].Status)
		assert.Nil(t, summaries[0].ExpiresAt)

		var availableSeats int
		err = sharedDB.QueryRowContext(ctx, "SELECT available_seats FROM flights WHERE id = 8").Scan(&availableSeats)
		require.NoError(t, err)
		assert.Equal(t, 20, availableSeats, "seat must be released back")
	})
}
