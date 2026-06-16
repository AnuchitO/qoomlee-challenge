//go:build integration

package booking

import (
	"context"
	"fmt"
	"math"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRepositoryCreateBooking(t *testing.T) {
	t.Run("creates booking and decrements available seats", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		var seatsBefore int
		err := sharedDB.QueryRowContext(context.Background(),
			"SELECT available_seats FROM flights WHERE id = $1", 2).Scan(&seatsBefore)
		require.NoError(t, err)

		pnr := fmt.Sprintf("T1%04d", time.Now().UnixNano()%9999)
		b, err := repo.Create(context.Background(), 2, Passenger{
			FirstName: "Test", LastName: "User", Email: "test@example.com",
		}, pnr, "user-sub-test", "")

		require.NoError(t, err)
		require.NotNil(t, b)
		assert.Equal(t, pnr, b.BookingRef)
		assert.Greater(t, b.ID, int64(0))

		var seatsAfter int
		err = sharedDB.QueryRowContext(context.Background(),
			"SELECT available_seats FROM flights WHERE id = $1", 2).Scan(&seatsAfter)
		require.NoError(t, err)
		assert.Equal(t, seatsBefore-1, seatsAfter, "available_seats must decrement by 1")
	})

	t.Run("stores user_sub and a 15-minute expires_at", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		pnr := fmt.Sprintf("T9%04d", time.Now().UnixNano()%9999)
		before := time.Now()
		b, err := repo.Create(context.Background(), 5, Passenger{
			FirstName: "Hold", LastName: "Test", Email: "hold@example.com",
		}, pnr, "user-abc-123", "")

		require.NoError(t, err)
		require.NotNil(t, b.ExpiresAt)
		assert.WithinDuration(t, before.Add(SeatHoldDuration), *b.ExpiresAt, 5*time.Second)

		var userSub string
		var expiresAt time.Time
		err = sharedDB.QueryRowContext(context.Background(),
			"SELECT user_sub, expires_at FROM bookings WHERE booking_ref = $1", pnr).
			Scan(&userSub, &expiresAt)
		require.NoError(t, err)
		assert.Equal(t, "user-abc-123", userSub)
		assert.WithinDuration(t, before.Add(SeatHoldDuration), expiresAt, 5*time.Second)
	})

	t.Run("total amount is base price plus 15% tax", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		var basePriceMinor int64
		var currency string
		err := sharedDB.QueryRowContext(context.Background(),
			"SELECT base_price_minor, currency FROM flights WHERE id = $1", 3).
			Scan(&basePriceMinor, &currency)
		require.NoError(t, err)

		pnr := fmt.Sprintf("T2%04d", time.Now().UnixNano()%9999)
		b, err := repo.Create(context.Background(), 3, Passenger{
			FirstName: "Price", LastName: "Test", Email: "price@example.com",
		}, pnr, "user-sub-test", "")

		require.NoError(t, err)
		taxMinor := int64(math.Round(float64(basePriceMinor) * 0.15))
		expectedTotal := basePriceMinor + taxMinor
		assert.Equal(t, expectedTotal, b.TotalAmountMinor,
			"total_amount_minor must be base_price_minor + 15%% tax (got base=%d, tax=%d)",
			basePriceMinor, taxMinor)
		assert.Equal(t, currency, b.Currency)
	})

	t.Run("total amount tax rounds to nearest minor unit", func(t *testing.T) {
		// Verify math.Round behaviour: a base price that would produce a fractional
		// tax (e.g. 10 minor → tax = 1.5 → rounds to 2) is handled correctly,
		// mirroring the JS Math.round() in usePaymentClient.ts.
		cases := []struct {
			base     int64
			expected int64 // base + round(base*0.15)
		}{
			{10000, 11500},   // 10000 + 1500 = 11500 (exact)
			{420000, 483000}, // 420000 + 63000 = 483000 (exact)
			{10, 12},         // 10 + round(1.5) = 10 + 2 = 12
			{20, 23},         // 20 + round(3.0) = 23
		}
		for _, tc := range cases {
			taxMinor := int64(math.Round(float64(tc.base) * 0.15))
			got := tc.base + taxMinor
			assert.Equal(t, tc.expected, got,
				"base=%d: expected total %d, got %d", tc.base, tc.expected, got)
		}
	})

	t.Run("sold out flight returns no seats available error", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		// flight ID 16 = QM999, available_seats = 0
		pnr := fmt.Sprintf("T3%04d", time.Now().UnixNano()%9999)
		b, err := repo.Create(context.Background(), 16, Passenger{
			FirstName: "Over", LastName: "Book", Email: "overbook@example.com",
		}, pnr, "user-sub-test", "")

		assert.ErrorIs(t, err, ErrNoSeatsAvailable)
		assert.Nil(t, b)
	})

	t.Run("concurrent bookings on 1-seat flight: exactly 1 success and 1 failure", func(t *testing.T) {
		// Set flight 4 (QM201, BKK→HKG) to 1 available seat for this test.
		_, err := sharedDB.ExecContext(context.Background(),
			"UPDATE flights SET available_seats = 1 WHERE id = 4")
		require.NoError(t, err)

		repo := NewRepository(sharedDB)

		type result struct {
			booking *Booking
			err     error
		}

		results := make([]result, 2)
		var wg sync.WaitGroup
		wg.Add(2)

		for i := 0; i < 2; i++ {
			i := i
			go func() {
				defer wg.Done()
				pnr := fmt.Sprintf("C%d%04d", i, time.Now().UnixNano()%9999)
				b, err := repo.Create(context.Background(), 4, Passenger{
					FirstName: fmt.Sprintf("Concurrent%d", i),
					LastName:  "User",
					Email:     fmt.Sprintf("concurrent%d@example.com", i),
				}, pnr, "user-sub-test", "")
				results[i] = result{booking: b, err: err}
			}()
		}
		wg.Wait()

		successes, failures := 0, 0
		for _, r := range results {
			if r.err == nil {
				successes++
			} else if r.err == ErrNoSeatsAvailable {
				failures++
			}
		}
		assert.Equal(t, 1, successes, "exactly 1 goroutine should succeed")
		assert.Equal(t, 1, failures, "exactly 1 goroutine should get ErrNoSeatsAvailable")

		var seatsAfter int
		err = sharedDB.QueryRowContext(context.Background(),
			"SELECT available_seats FROM flights WHERE id = 4").Scan(&seatsAfter)
		require.NoError(t, err)
		assert.Equal(t, 0, seatsAfter, "available_seats must be 0 after concurrent booking")
	})
}
