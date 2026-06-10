//go:build integration

package flight

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRepositoryGetByID(t *testing.T) {
	t.Run("returns QM101 with all fields", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		f, err := repo.GetByID(context.Background(), 11)

		require.NoError(t, err)
		require.NotNil(t, f)
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

	t.Run("not found returns ErrNotFound", func(t *testing.T) {
		repo := NewRepository(sharedDB)

		f, err := repo.GetByID(context.Background(), 99999)

		assert.ErrorIs(t, err, ErrNotFound)
		assert.Nil(t, f)
	})
}
