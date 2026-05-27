package flight

import (
	"context"
	"database/sql"
	"errors"

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

const selectFlightCols = `
	SELECT f.id, f.flight_number,
	       r.origin_iata, r.destination_iata,
	       f.departure_time, f.arrival_time,
	       f.status, f.base_price_minor, f.currency, f.available_seats`

func (r *repository) Search(ctx context.Context, params SearchParams) ([]Flight, error) {
	q := selectFlightCols + `
	FROM flights f
	JOIN routes r ON r.id = f.route_id
	WHERE r.origin_iata      = $1
	  AND r.destination_iata = $2
	  AND f.departure_time  >= $3
	  AND f.departure_time   < $4
	  AND f.available_seats >= $5
	  AND f.status           = 'SCHEDULED'
	ORDER BY f.departure_time`

	rows, err := r.db.QueryContext(ctx, q,
		params.Origin, params.Destination,
		params.DateFrom, params.DateTo,
		params.Passengers,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flights []Flight
	for rows.Next() {
		var f Flight
		if err := scanFlight(rows, &f); err != nil {
			return nil, err
		}
		flights = append(flights, f)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return flights, nil
}

func (r *repository) GetByID(ctx context.Context, id int64) (*Flight, error) {
	q := selectFlightCols + `
	FROM flights f
	JOIN routes r ON r.id = f.route_id
	WHERE f.id = $1`

	var f Flight
	err := r.db.QueryRowContext(ctx, q, id).Scan(
		&f.ID, &f.FlightNumber,
		&f.Origin, &f.Destination,
		&f.DepartureTime, &f.ArrivalTime,
		&f.Status, &f.BasePriceMinor, &f.Currency, &f.AvailableSeats,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &f, nil
}

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
