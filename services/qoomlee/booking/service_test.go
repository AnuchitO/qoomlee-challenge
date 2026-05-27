package booking

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// --- mock Repository ---

type mockRepository struct {
	booking *Booking
	err     error
}

func (m *mockRepository) Create(_ context.Context, _ int64, _ Passenger, _ string) (*Booking, error) {
	return m.booking, m.err
}

func (m *mockRepository) GetByRef(_ context.Context, _ string) (*Booking, error) {
	return m.booking, m.err
}

func (m *mockRepository) UpdateStatus(_ context.Context, _ string, _ UpdateStatusRequest) error {
	return m.err
}

// captureRepo lets us inspect the PNR passed into Create.
type captureRepo struct {
	capturedPNR string
}

func (r *captureRepo) Create(_ context.Context, _ int64, _ Passenger, pnr string) (*Booking, error) {
	r.capturedPNR = pnr
	return &Booking{BookingRef: pnr}, nil
}

func (r *captureRepo) GetByRef(_ context.Context, _ string) (*Booking, error) {
	return nil, ErrNotFound
}

func (r *captureRepo) UpdateStatus(_ context.Context, _ string, _ UpdateStatusRequest) error {
	return nil
}

// --- Service.Create tests ---

func TestServiceCreateBooking(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
		repo := &mockRepository{
			booking: &Booking{ID: 1, BookingRef: "QM7X2K"},
		}
		svc := NewService(repo)
		result, err := svc.Create(context.Background(), CreateRequest{
			FlightID:  1,
			Passenger: Passenger{FirstName: "John", LastName: "Doe", Email: "john@example.com"},
		})

		require.NoError(t, err)
		require.NotNil(t, result)
		assert.Equal(t, "QM7X2K", result.BookingRef)
	})

	t.Run("PNR passed to repo is exactly 6 chars", func(t *testing.T) {
		repo := &captureRepo{}
		svc := NewService(repo)
		_, _ = svc.Create(context.Background(), CreateRequest{
			FlightID:  1,
			Passenger: Passenger{FirstName: "John", LastName: "Doe", Email: "john@example.com"},
		})
		assert.Len(t, repo.capturedPNR, 6)
	})

	t.Run("propagates no seats available error", func(t *testing.T) {
		repo := &mockRepository{err: ErrNoSeatsAvailable}
		svc := NewService(repo)
		result, err := svc.Create(context.Background(), CreateRequest{
			FlightID:  6,
			Passenger: Passenger{FirstName: "John", LastName: "Doe", Email: "j@e.com"},
		})

		assert.ErrorIs(t, err, ErrNoSeatsAvailable)
		assert.Nil(t, result)
	})

	t.Run("propagates repo error", func(t *testing.T) {
		repo := &mockRepository{err: errors.New("db down")}
		svc := NewService(repo)
		result, err := svc.Create(context.Background(), CreateRequest{
			FlightID:  1,
			Passenger: Passenger{FirstName: "John", LastName: "Doe", Email: "j@e.com"},
		})

		assert.EqualError(t, err, "db down")
		assert.Nil(t, result)
	})
}

// --- Service.GetByRef tests ---

func TestServiceGetByRef(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
		repo := &mockRepository{
			booking: &Booking{ID: 1, BookingRef: "SEED01", Status: "CONFIRMED"},
		}
		svc := NewService(repo)
		b, err := svc.GetByRef(context.Background(), "SEED01")

		require.NoError(t, err)
		assert.Equal(t, "SEED01", b.BookingRef)
	})

	t.Run("not found", func(t *testing.T) {
		repo := &mockRepository{err: ErrNotFound}
		svc := NewService(repo)
		b, err := svc.GetByRef(context.Background(), "XXXXXX")

		assert.ErrorIs(t, err, ErrNotFound)
		assert.Nil(t, b)
	})
}

// --- Service.UpdateStatus tests ---

func TestServiceUpdateStatus(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
		repo := &mockRepository{}
		svc := NewService(repo)
		err := svc.UpdateStatus(context.Background(), "SEED02", UpdateStatusRequest{
			Status: "CONFIRMED", PaymentID: 1,
			PaymentProvider: "OMISE", ProviderChargeID: "chrg_test_xxx",
		})
		assert.NoError(t, err)
	})

	t.Run("propagates not found error", func(t *testing.T) {
		repo := &mockRepository{err: ErrNotFound}
		svc := NewService(repo)
		err := svc.UpdateStatus(context.Background(), "XXXXXX", UpdateStatusRequest{Status: "CONFIRMED"})
		assert.ErrorIs(t, err, ErrNotFound)
	})
}
