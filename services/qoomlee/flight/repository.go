package flight

import (
	"context"
	"database/sql"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// Repository is the data-access interface for flight queries.
type Repository interface {
	Search(ctx context.Context, params SearchParams) ([]Flight, error)
	GetByID(ctx context.Context, id int64) (*Flight, error)
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a production repository backed by a *sql.DB.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

// selectFlightCols is the shared SELECT clause used by Search and GetByID.
const selectFlightCols = `
	SELECT f.id, f.flight_number,
	       r.origin_iata, r.destination_iata,
	       f.departure_time, f.arrival_time,
	       f.status, f.base_price_minor, f.currency, f.available_seats`

// scanner is satisfied by both *sql.Row and *sql.Rows.
type scanner interface {
	Scan(dest ...any) error
}

func scanFlight(s scanner, f *Flight) error {
	return s.Scan(
		&f.ID, &f.FlightNumber,
		&f.Origin, &f.Destination,
		&f.DepartureTime, &f.ArrivalTime,
		&f.Status, &f.BasePriceMinor, &f.Currency, &f.AvailableSeats,
	)
}
