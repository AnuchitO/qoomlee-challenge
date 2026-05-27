package booking

import (
	"context"
	"database/sql"
	"errors"

	_ "github.com/lib/pq"
)

// Repository is the data-access interface for the booking domain.
type Repository interface {
	Create(ctx context.Context, flightID int64, passenger Passenger, pnr string) (*Booking, error)
	GetByRef(ctx context.Context, ref string) (*Booking, error)
	UpdateStatus(ctx context.Context, ref string, req UpdateStatusRequest) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a production Repository backed by a *sql.DB.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, flightID int64, passenger Passenger, pnr string) (*Booking, error) {
	return nil, errors.New("not implemented")
}

func (r *repository) GetByRef(ctx context.Context, ref string) (*Booking, error) {
	return nil, errors.New("not implemented")
}

func (r *repository) UpdateStatus(ctx context.Context, ref string, req UpdateStatusRequest) error {
	return errors.New("not implemented")
}
