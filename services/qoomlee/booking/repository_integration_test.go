//go:build integration

package booking

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	tc "github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

// sharedDB is initialised once in TestMain and reused across all integration tests.
var sharedDB *sql.DB

// TestMain starts a single PostgreSQL container for the whole integration test run,
// applies schema + seed, then tears everything down after all tests finish.
func TestMain(m *testing.M) {
	ctx := context.Background()

	schemaPath, err := filepath.Abs("../../../infra/db/qoomlee/01_schema.sql")
	if err != nil {
		panic("resolve schema path: " + err.Error())
	}
	seedPath, err := filepath.Abs("../../../infra/db/qoomlee/02_seed.sql")
	if err != nil {
		panic("resolve seed path: " + err.Error())
	}

	pgc, err := postgres.Run(ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("qoomlee"),
		postgres.WithUsername("qoomlee"),
		postgres.WithPassword("qoomlee"),
		postgres.WithInitScripts(schemaPath, seedPath),
		tc.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(90*time.Second),
		),
	)
	if err != nil {
		panic("start postgres container: " + err.Error())
	}
	defer func() { _ = pgc.Terminate(ctx) }()

	connStr, err := pgc.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		panic("get connection string: " + err.Error())
	}

	sharedDB, err = sql.Open("postgres", connStr)
	if err != nil {
		panic("open db: " + err.Error())
	}
	defer func() { _ = sharedDB.Close() }()

	os.Exit(m.Run())
}

// ─── Create ──────────────────────────────────────────────────────────────────

func TestRepositoryCreateBooking(t *testing.T) {
	t.Run("creates booking and decrements available seats", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		// record seats before
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
		// Set a flight to 1 available seat for this specific test.
		// Use flight 4 (QM201, BKK→HKG) — not used in GetByRef/UpdateStatus tests.
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

		successes := 0
		failures := 0
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

// ─── GetByRef ─────────────────────────────────────────────────────────────────

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
		// passenger
		assert.NotEmpty(t, b.Passenger.FirstName)
		assert.NotEmpty(t, b.Passenger.LastName)
		assert.NotEmpty(t, b.Passenger.Email)
		// flight
		assert.NotEmpty(t, b.Flight.FlightNumber)
		assert.NotEmpty(t, b.Flight.Origin)
		assert.NotEmpty(t, b.Flight.Destination)
		assert.False(t, b.Flight.DepartureTime.IsZero())
		// payment fields nil for PENDING
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

// ─── UpdateStatus ─────────────────────────────────────────────────────────────

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

		// Verify via GetByRef
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
}
