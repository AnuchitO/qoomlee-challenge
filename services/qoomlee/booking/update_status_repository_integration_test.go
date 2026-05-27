//go:build integration

package booking

import (
	"context"
	"testing"

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
}
