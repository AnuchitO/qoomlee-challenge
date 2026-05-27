//go:build integration

package flight

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"
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

// bkkDate builds midnight of the given calendar date in UTC for use with bkkDateToUTCRange.
func bkkDate(year int, month time.Month, day int) time.Time {
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

// ─── Search ──────────────────────────────────────────────────────────────────

func TestRepositorySearch(t *testing.T) {
	t.Run("BKK to SIN returns 3 flights", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "BKK", Destination: "SIN",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		assert.Len(t, flights, 3, "expect QM101, SC201, QM102; QM999 sold-out excluded")

		nums := flightNumbers(flights)
		assert.Contains(t, nums, "QM101")
		assert.Contains(t, nums, "SC201")
		assert.Contains(t, nums, "QM102")
		assert.NotContains(t, nums, "QM999")
	})

	t.Run("ordered by departure time", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "BKK", Destination: "SIN",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		require.Len(t, flights, 3)
		// QM101 08:00 BKK < SC201 10:00 BKK < QM102 14:00 BKK
		assert.Equal(t, "QM101", flights[0].FlightNumber)
		assert.Equal(t, "SC201", flights[1].FlightNumber)
		assert.Equal(t, "QM102", flights[2].FlightNumber)
	})

	t.Run("all fields populated", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "BKK", Destination: "SIN",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		require.NotEmpty(t, flights)

		f := flights[0] // QM101
		assert.Equal(t, int64(1), f.ID)
		assert.Equal(t, "QM101", f.FlightNumber)
		assert.Equal(t, "BKK", f.Origin)
		assert.Equal(t, "SIN", f.Destination)
		assert.Equal(t, int64(350000), f.BasePriceMinor)
		assert.Equal(t, "THB", f.Currency)
		assert.Equal(t, 154, f.AvailableSeats)
		assert.Equal(t, "SCHEDULED", f.Status)
		assert.False(t, f.DepartureTime.IsZero())
		assert.False(t, f.ArrivalTime.IsZero())
	})

	t.Run("excludes sold out flights", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "BKK", Destination: "SIN",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		for _, f := range flights {
			assert.Greater(t, f.AvailableSeats, 0)
			assert.NotEqual(t, "QM999", f.FlightNumber)
		}
	})

	t.Run("next day flight not in today search", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "BKK", Destination: "SIN",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		assert.NotContains(t, flightNumbers(flights), "QM103",
			"2026-06-16 flight QM103 must not appear in 2026-06-15 search")
	})

	t.Run("next day date returns QM103", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 16))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "BKK", Destination: "SIN",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		require.Len(t, flights, 1)
		assert.Equal(t, "QM103", flights[0].FlightNumber)
	})

	t.Run("unknown route returns empty", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "XYZ", Destination: "ABC",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		assert.Empty(t, flights)
	})
}

// ─── GetByID ─────────────────────────────────────────────────────────────────

func TestRepositoryGetByID(t *testing.T) {
	t.Run("returns QM101 with all fields", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		f, err := repo.GetByID(context.Background(), 1)

		require.NoError(t, err)
		require.NotNil(t, f)
		assert.Equal(t, int64(1), f.ID)
		assert.Equal(t, "QM101", f.FlightNumber)
		assert.Equal(t, "BKK", f.Origin)
		assert.Equal(t, "SIN", f.Destination)
		assert.Equal(t, int64(350000), f.BasePriceMinor)
		assert.Equal(t, "THB", f.Currency)
		assert.Equal(t, 154, f.AvailableSeats)
		assert.Equal(t, "SCHEDULED", f.Status)
		assert.False(t, f.DepartureTime.IsZero())
		assert.False(t, f.ArrivalTime.IsZero())
	})

	t.Run("not found returns ErrNotFound", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		f, err := repo.GetByID(context.Background(), 99999)

		assert.ErrorIs(t, err, ErrNotFound)
		assert.Nil(t, f)
	})
}

// ─── helpers ─────────────────────────────────────────────────────────────────

func flightNumbers(flights []Flight) []string {
	out := make([]string, len(flights))
	for i, f := range flights {
		out[i] = f.FlightNumber
	}
	return out
}
