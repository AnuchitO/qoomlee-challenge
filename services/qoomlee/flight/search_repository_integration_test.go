//go:build integration

package flight

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRepositorySearch(t *testing.T) {
	t.Run("BKK to SIN returns 3 flights", func(t *testing.T) {
		repo := NewRepository(sharedDB)
		dateFrom, dateTo := bkkDateToUTCRange(seedDate(14))

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
		dateFrom, dateTo := bkkDateToUTCRange(seedDate(14))

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
		dateFrom, dateTo := bkkDateToUTCRange(seedDate(14))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "BKK", Destination: "SIN",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		require.NotEmpty(t, flights)

		f := flights[0] // QM101
		assert.Equal(t, int64(11), f.ID)
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
		dateFrom, dateTo := bkkDateToUTCRange(seedDate(14))

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
		dateFrom, dateTo := bkkDateToUTCRange(seedDate(14))

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
		dateFrom, dateTo := bkkDateToUTCRange(seedDate(15))

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
		dateFrom, dateTo := bkkDateToUTCRange(seedDate(14))

		flights, err := repo.Search(context.Background(), SearchParams{
			Origin: "XYZ", Destination: "ABC",
			DateFrom: dateFrom, DateTo: dateTo, Passengers: 1,
		})

		require.NoError(t, err)
		assert.Empty(t, flights)
	})
}
