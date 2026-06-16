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
	booking   *Booking
	summaries []Summary
	err       error
}

func (m *mockRepository) Create(_ context.Context, _ int64, _ *int64, _ Passenger, _ string, _ string, _ string) (*Booking, error) {
	return m.booking, m.err
}

func (m *mockRepository) GetByRef(_ context.Context, _ string) (*Booking, error) {
	return m.booking, m.err
}

func (m *mockRepository) GetAll(_ context.Context, _ string) ([]Summary, error) {
	return m.summaries, m.err
}

func (m *mockRepository) UpdateStatus(_ context.Context, _ string, _ UpdateStatusRequest) error {
	return m.err
}

// captureRepo lets us inspect the PNR and bookingToken passed into Create.
type captureRepo struct {
	capturedPNR          string
	capturedBookingToken string
}

func (r *captureRepo) Create(_ context.Context, _ int64, _ *int64, _ Passenger, pnr string, _ string, bookingToken string) (*Booking, error) {
	r.capturedPNR = pnr
	r.capturedBookingToken = bookingToken
	return &Booking{BookingRef: pnr}, nil
}

func (r *captureRepo) GetByRef(_ context.Context, _ string) (*Booking, error) {
	return nil, ErrNotFound
}

func (r *captureRepo) GetAll(_ context.Context, _ string) ([]Summary, error) {
	return nil, nil
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

	// QML-048: bookingToken is forwarded from CreateRequest to the repository.
	t.Run("bookingToken is forwarded to repo", func(t *testing.T) {
		repo := &captureRepo{}
		svc := NewService(repo)
		_, _ = svc.Create(context.Background(), CreateRequest{
			FlightID:     1,
			Passenger:    Passenger{FirstName: "John", LastName: "Doe", Email: "john@example.com"},
			BookingToken: "test-uuid-token",
		})
		assert.Equal(t, "test-uuid-token", repo.capturedBookingToken)
	})

	// QML-048: empty bookingToken is forwarded as empty string (backward-compatible).
	t.Run("empty bookingToken forwarded as empty string", func(t *testing.T) {
		repo := &captureRepo{}
		svc := NewService(repo)
		_, _ = svc.Create(context.Background(), CreateRequest{
			FlightID:  1,
			Passenger: Passenger{FirstName: "John", LastName: "Doe", Email: "john@example.com"},
		})
		assert.Equal(t, "", repo.capturedBookingToken)
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

// --- Service.GetAll tests ---

func TestServiceGetAll(t *testing.T) {
	t.Run("happy path", func(t *testing.T) {
		repo := &mockRepository{
			summaries: []Summary{
				{BookingRef: "SEED01", Status: "CONFIRMED"},
				{BookingRef: "SEED02", Status: "PENDING"},
			},
		}
		svc := NewService(repo)
		summaries, err := svc.GetAll(context.Background(), "user-123")

		require.NoError(t, err)
		assert.Len(t, summaries, 2)
	})

	t.Run("propagates repo error", func(t *testing.T) {
		repo := &mockRepository{err: errors.New("db down")}
		svc := NewService(repo)
		summaries, err := svc.GetAll(context.Background(), "user-123")

		assert.EqualError(t, err, "db down")
		assert.Nil(t, summaries)
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
