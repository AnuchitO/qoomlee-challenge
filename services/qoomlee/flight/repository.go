package flight

import (
	"context"
	"database/sql"
)

// Repository is the data-access interface for flight queries.
type Repository interface {
	Search(ctx context.Context, params SearchParams) ([]Flight, error)
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a production repository backed by a *sql.DB.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Search(ctx context.Context, params SearchParams) ([]Flight, error) {
	// TODO: implement in GREEN phase
	return nil, nil
}
