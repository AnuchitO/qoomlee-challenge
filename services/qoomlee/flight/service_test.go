package flight

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// --- mock Repository ---

type mockRepository struct {
	flights []Flight
	flight  *Flight
	err     error
}

func (m *mockRepository) Search(_ context.Context, _ SearchParams) ([]Flight, error) {
	return m.flights, m.err
}

func (m *mockRepository) GetByID(_ context.Context, _ int64) (*Flight, error) {
	return m.flight, m.err
}

// --- Service.Search tests ---

func TestServiceSearch(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
		dep := time.Date(2026, 6, 15, 1, 0, 0, 0, time.UTC)
		arr := time.Date(2026, 6, 15, 4, 30, 0, 0, time.UTC)

		repo := &mockRepository{
			flights: []Flight{
				{
					ID:             1,
					FlightNumber:   "QM101",
					BasePriceMinor: 350000,
					DepartureTime:  dep,
					ArrivalTime:    arr,
				},
			},
		}

		svc := NewService(repo)
		flights, err := svc.Search(context.Background(), SearchParams{
			Origin: "BKK", Destination: "SIN",
			DateFrom: dep, DateTo: arr, Passengers: 1,
		})

		assert.NoError(t, err)
		assert.Len(t, flights, 1)
		assert.Equal(t, "3500.00", flights[0].BasePrice)
		assert.Equal(t, 210, flights[0].DurationMinutes)
	})

	t.Run("returns empty slice when repo returns nil", func(t *testing.T) {
		repo := &mockRepository{flights: nil}

		svc := NewService(repo)
		flights, err := svc.Search(context.Background(), SearchParams{Passengers: 1})

		assert.NoError(t, err)
		assert.NotNil(t, flights)
		assert.Empty(t, flights)
	})

	t.Run("propagates repo error", func(t *testing.T) {
		repo := &mockRepository{err: errors.New("db down")}

		svc := NewService(repo)
		flights, err := svc.Search(context.Background(), SearchParams{Passengers: 1})

		assert.EqualError(t, err, "db down")
		assert.Nil(t, flights)
	})
}

// --- Service.GetByID tests ---

func TestServiceGetByID(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
		dep := time.Date(2026, 6, 15, 1, 0, 0, 0, time.UTC)
		arr := time.Date(2026, 6, 15, 4, 30, 0, 0, time.UTC)

		repo := &mockRepository{
			flight: &Flight{
				ID:             1,
				FlightNumber:   "QM101",
				BasePriceMinor: 350000,
				DepartureTime:  dep,
				ArrivalTime:    arr,
			},
		}

		svc := NewService(repo)
		f, err := svc.GetByID(context.Background(), 1)

		assert.NoError(t, err)
		assert.NotNil(t, f)
		assert.Equal(t, "3500.00", f.BasePrice)
		assert.Equal(t, 210, f.DurationMinutes)
	})

	t.Run("not found", func(t *testing.T) {
		repo := &mockRepository{err: ErrNotFound}

		svc := NewService(repo)
		f, err := svc.GetByID(context.Background(), 99999)

		assert.ErrorIs(t, err, ErrNotFound)
		assert.Nil(t, f)
	})

	t.Run("propagates repo error", func(t *testing.T) {
		repo := &mockRepository{err: errors.New("db down")}

		svc := NewService(repo)
		f, err := svc.GetByID(context.Background(), 1)

		assert.Error(t, err)
		assert.Nil(t, f)
	})
}
