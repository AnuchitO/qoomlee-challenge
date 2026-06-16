//go:build integration

package payment

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRepositoryInsertAndGetByBookingRef(t *testing.T) {
	repo := NewRepository(sharedDB)
	ref := fmt.Sprintf("RP%04d", time.Now().UnixNano()%9999)

	inserted, err := repo.Insert(context.Background(), &Payment{
		BookingRef:      ref,
		BookingID:       100,
		PaymentProvider: "OMISE",
		AmountMinor:     350000,
		Currency:        "THB",
		Status:          "PENDING",
	})
	require.NoError(t, err)
	assert.Greater(t, inserted.ID, int64(0))

	got, err := repo.GetByBookingRef(context.Background(), ref)
	require.NoError(t, err)
	assert.Equal(t, ref, got.BookingRef)
	assert.Equal(t, "PENDING", got.Status)
	assert.Equal(t, int64(350000), got.AmountMinor)
}

func TestRepositoryGetByBookingRefNotFound(t *testing.T) {
	repo := NewRepository(sharedDB)

	_, err := repo.GetByBookingRef(context.Background(), "NOPE99")
	assert.ErrorIs(t, err, ErrNotFound)
}

func TestRepositoryGetByBookingRefReturnsLatest(t *testing.T) {
	repo := NewRepository(sharedDB)
	ref := fmt.Sprintf("LT%04d", time.Now().UnixNano()%9999)

	_, err := repo.Insert(context.Background(), &Payment{
		BookingRef:      ref,
		BookingID:       101,
		PaymentProvider: "OMISE",
		AmountMinor:     100000,
		Currency:        "THB",
		Status:          "FAILED",
		FailureCode:     "insufficient_fund",
		FailureMessage:  "The card has insufficient funds.",
	})
	require.NoError(t, err)

	_, err = repo.Insert(context.Background(), &Payment{
		BookingRef:      ref,
		BookingID:       101,
		PaymentProvider: "OMISE",
		AmountMinor:     100000,
		Currency:        "THB",
		Status:          "SUCCEEDED",
	})
	require.NoError(t, err)

	got, err := repo.GetByBookingRef(context.Background(), ref)
	require.NoError(t, err)
	assert.Equal(t, "SUCCEEDED", got.Status)
}

func TestRepositoryUniqueSuccessConstraint(t *testing.T) {
	repo := NewRepository(sharedDB)
	ref := fmt.Sprintf("UQ%04d", time.Now().UnixNano()%9999)

	_, err := repo.Insert(context.Background(), &Payment{
		BookingRef:      ref,
		BookingID:       102,
		PaymentProvider: "OMISE",
		AmountMinor:     100000,
		Currency:        "THB",
		Status:          "SUCCEEDED",
	})
	require.NoError(t, err)

	_, err = repo.Insert(context.Background(), &Payment{
		BookingRef:      ref,
		BookingID:       102,
		PaymentProvider: "OMISE",
		AmountMinor:     100000,
		Currency:        "THB",
		Status:          "SUCCEEDED",
	})

	require.Error(t, err)
	var pqErr *pq.Error
	require.ErrorAs(t, err, &pqErr)
	assert.Equal(t, "23505", string(pqErr.Code), "expected unique_violation on idx_payments_one_success")
}

// ── Charge against the real database, with mocked booking client and Omise ──

func TestServiceChargeAgainstRealDB(t *testing.T) {
	repo := NewRepository(sharedDB)
	ref := fmt.Sprintf("CH%04d", time.Now().UnixNano()%9999)

	booking := &mockBookingClient{
		booking: &BookingDetail{
			BookingID:        200,
			BookingRef:       ref,
			Status:           "PENDING_PAYMENT",
			TotalAmountMinor: 350000,
			Currency:         "THB",
		},
	}
	omise := &mockOmiser{
		result: &ChargeResult{
			ProviderChargeID: "chrg_test_integration",
			Status:           "SUCCEEDED",
		},
	}

	svc := NewService(booking, omise, repo)

	p, err := svc.Charge(context.Background(), ChargeRequest{
		BookingRef:  ref,
		AmountMinor: 350000,
		Currency:    "THB",
	})
	require.NoError(t, err)
	assert.Equal(t, "SUCCEEDED", p.Status)
	assert.Equal(t, "chrg_test_integration", p.ProviderChargeID)

	got, err := repo.GetByBookingRef(context.Background(), ref)
	require.NoError(t, err)
	assert.Equal(t, "SUCCEEDED", got.Status)

	assert.Equal(t, ref, booking.confirmedRef, "ConfirmBooking must be called with the booking ref")
	assert.Equal(t, "OMISE", booking.confirmedRequest.PaymentProvider)
	assert.Equal(t, "chrg_test_integration", booking.confirmedRequest.ProviderChargeID)
}

func TestServiceChargeAlreadyPaid(t *testing.T) {
	// SEED01 is a pre-seeded SUCCEEDED payment for booking_ref=SEED01.
	repo := NewRepository(sharedDB)

	booking := &mockBookingClient{
		booking: &BookingDetail{
			BookingID:        1,
			BookingRef:       "SEED01",
			Status:           "CONFIRMED",
			TotalAmountMinor: 350000,
			Currency:         "THB",
		},
	}
	omise := &mockOmiser{result: &ChargeResult{ProviderChargeID: "chrg_should_not_be_used", Status: "SUCCEEDED"}}

	svc := NewService(booking, omise, repo)

	_, err := svc.Charge(context.Background(), ChargeRequest{
		BookingRef:  "SEED01",
		AmountMinor: 350000,
		Currency:    "THB",
	})

	assert.ErrorIs(t, err, ErrAlreadyPaid)
}
