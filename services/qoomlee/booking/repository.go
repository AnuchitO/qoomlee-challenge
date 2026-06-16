package booking

import (
	"context"
	"database/sql"

	_ "github.com/lib/pq"
)

// Repository is the data-access interface for the booking domain.
type Repository interface {
	Create(ctx context.Context, flightID int64, returnFlightID *int64, passenger Passenger, pnr, userSub, idempotencyKey string) (*Booking, error)
	GetByRef(ctx context.Context, ref string) (*Booking, error)
	GetAll(ctx context.Context, userSub string) ([]Summary, error)
	UpdateStatus(ctx context.Context, ref string, req UpdateStatusRequest) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a production Repository backed by a *sql.DB.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

// nullableString converts an empty Go string to a SQL NULL.
func nullableString(s string) any {
	if s == "" {
		return nil
	}
	return s
}
