//go:build integration

package booking

import (
	"context"
	"fmt"
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
		}, pnr)

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

	t.Run("total amount matches flight base price", func(t *testing.T) {
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
		}, pnr)

		require.NoError(t, err)
		assert.Equal(t, basePriceMinor, b.TotalAmountMinor, "total_amount_minor must equal flight base_price_minor")
		assert.Equal(t, currency, b.Currency)
	})

	t.Run("sold out flight returns no seats available error", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		// flight ID 6 = QM999, available_seats = 0
		pnr := fmt.Sprintf("T3%04d", time.Now().UnixNano()%9999)
		b, err := repo.Create(context.Background(), 6, Passenger{
			FirstName: "Over", LastName: "Book", Email: "overbook@example.com",
		}, pnr)

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
				}, pnr)
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
