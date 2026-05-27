//go:build integration

package flight

import (
	"context"
	"database/sql"
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

// setupTestDB starts a postgres:16-alpine container, applies the qoomlee schema
// and seed data, then returns a connected *sql.DB.
// Cleanup (container termination + db close) is registered via t.Cleanup.
func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()
	ctx := context.Background()

	schemaPath, err := filepath.Abs("../../../infra/db/qoomlee/01_schema.sql")
	require.NoError(t, err, "resolve schema path")

	seedPath, err := filepath.Abs("../../../infra/db/qoomlee/02_seed.sql")
	require.NoError(t, err, "resolve seed path")

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
	require.NoError(t, err, "start postgres container")
	t.Cleanup(func() { _ = pgc.Terminate(ctx) })

	connStr, err := pgc.ConnectionString(ctx, "sslmode=disable")
	require.NoError(t, err)

	db, err := sql.Open("postgres", connStr)
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close() })

	require.NoError(t, db.PingContext(ctx), "ping postgres")
	return db
}

// bkkDate builds a time.Time for midnight of the given date in UTC (parsed from YYYY-MM-DD).
// The bkkDateToUTCRange helper in service.go converts it to the correct UTC window.
func bkkDate(year int, month time.Month, day int) time.Time {
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

// ─── Search ──────────────────────────────────────────────────────────────────

func TestRepositoryIntegration_Search_BKKtoSIN_Returns3Flights(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

	dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))
	flights, err := repo.Search(context.Background(), SearchParams{
		Origin: "BKK", Destination: "SIN",
		DateFrom: dateFrom, DateTo: dateTo,
		Passengers: 1,
	})

	require.NoError(t, err)
	// QM101, SC201, QM102 — QM999 sold-out must be excluded
	assert.Len(t, flights, 3, "expect 3 BKK→SIN flights on 2026-06-15 (QM999 excluded)")

	numbers := flightNumbers(flights)
	assert.Contains(t, numbers, "QM101")
	assert.Contains(t, numbers, "SC201")
	assert.Contains(t, numbers, "QM102")
	assert.NotContains(t, numbers, "QM999", "sold-out QM999 must be excluded")
}

func TestRepositoryIntegration_Search_OrderedByDeparture(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

	dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))
	flights, err := repo.Search(context.Background(), SearchParams{
		Origin: "BKK", Destination: "SIN",
		DateFrom: dateFrom, DateTo: dateTo,
		Passengers: 1,
	})

	require.NoError(t, err)
	require.Len(t, flights, 3)
	// QM101 08:00, SC201 10:00, QM102 14:00 — ascending departure order
	assert.Equal(t, "QM101", flights[0].FlightNumber)
	assert.Equal(t, "SC201", flights[1].FlightNumber)
	assert.Equal(t, "QM102", flights[2].FlightNumber)
}

func TestRepositoryIntegration_Search_AllFieldsPopulated(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

	dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))
	flights, err := repo.Search(context.Background(), SearchParams{
		Origin: "BKK", Destination: "SIN",
		DateFrom: dateFrom, DateTo: dateTo,
		Passengers: 1,
	})

	require.NoError(t, err)
	require.NotEmpty(t, flights)

	qm101 := flights[0]
	assert.Equal(t, int64(1), qm101.ID)
	assert.Equal(t, "QM101", qm101.FlightNumber)
	assert.Equal(t, "BKK", qm101.Origin)
	assert.Equal(t, "SIN", qm101.Destination)
	assert.Equal(t, int64(350000), qm101.BasePriceMinor)
	assert.Equal(t, "THB", qm101.Currency)
	assert.Equal(t, 154, qm101.AvailableSeats)
	assert.Equal(t, "SCHEDULED", qm101.Status)
	assert.False(t, qm101.DepartureTime.IsZero())
	assert.False(t, qm101.ArrivalTime.IsZero())
}

func TestRepositoryIntegration_Search_ExcludesSoldOut(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

	dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))
	flights, err := repo.Search(context.Background(), SearchParams{
		Origin: "BKK", Destination: "SIN",
		DateFrom: dateFrom, DateTo: dateTo,
		Passengers: 1,
	})

	require.NoError(t, err)
	for _, f := range flights {
		assert.Greater(t, f.AvailableSeats, 0, "all results must have seats ≥ passengers (1)")
		assert.NotEqual(t, "QM999", f.FlightNumber)
	}
}

func TestRepositoryIntegration_Search_DateFilter_NextDayNotInToday(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

	dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))
	flights, err := repo.Search(context.Background(), SearchParams{
		Origin: "BKK", Destination: "SIN",
		DateFrom: dateFrom, DateTo: dateTo,
		Passengers: 1,
	})

	require.NoError(t, err)
	assert.NotContains(t, flightNumbers(flights), "QM103",
		"2026-06-16 flight QM103 must not appear in 2026-06-15 search")
}

func TestRepositoryIntegration_Search_DateFilter_NextDayReturnsQM103(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

	dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 16))
	flights, err := repo.Search(context.Background(), SearchParams{
		Origin: "BKK", Destination: "SIN",
		DateFrom: dateFrom, DateTo: dateTo,
		Passengers: 1,
	})

	require.NoError(t, err)
	require.Len(t, flights, 1)
	assert.Equal(t, "QM103", flights[0].FlightNumber)
	assert.NotContains(t, flightNumbers(flights), "QM101")
}

func TestRepositoryIntegration_Search_UnknownRoute_ReturnsEmpty(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

	dateFrom, dateTo := bkkDateToUTCRange(bkkDate(2026, 6, 15))
	flights, err := repo.Search(context.Background(), SearchParams{
		Origin: "XYZ", Destination: "ABC",
		DateFrom: dateFrom, DateTo: dateTo,
		Passengers: 1,
	})

	require.NoError(t, err)
	assert.Empty(t, flights)
}

// ─── GetByID ─────────────────────────────────────────────────────────────────

func TestRepositoryIntegration_GetByID_QM101(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

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
}

func TestRepositoryIntegration_GetByID_NotFound(t *testing.T) {
	db := setupTestDB(t)
	repo := NewRepository(db)

	f, err := repo.GetByID(context.Background(), 99999)

	assert.ErrorIs(t, err, ErrNotFound)
	assert.Nil(t, f)
}

// ─── helpers ─────────────────────────────────────────────────────────────────

func flightNumbers(flights []Flight) []string {
	out := make([]string, len(flights))
	for i, f := range flights {
		out[i] = f.FlightNumber
	}
	return out
}
