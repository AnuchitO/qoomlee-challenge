package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"gitlab.com/arise-by-infinitas/qoomlee/flight-service/model"
)

var ErrNotFound = errors.New("not found")

type FlightRepository struct {
	db *sql.DB
}

func NewFlightRepository(db *sql.DB) *FlightRepository {
	return &FlightRepository{db: db}
}

// Search returns SCHEDULED flights matching origin/destination on a given UTC date with enough seats.
func (r *FlightRepository) Search(origin, destination string, date time.Time, passengers int) ([]model.Flight, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
	endOfDay := startOfDay.Add(24 * time.Hour)

	rows, err := r.db.Query(`
		SELECT f.id, f.flight_number,
		       ro.origin_iata, ro.destination_iata,
		       f.departure_time, f.arrival_time,
		       f.status, f.base_price, f.currency, f.available_seats
		FROM flights f
		JOIN routes ro ON ro.id = f.route_id
		WHERE ro.origin_iata      = $1
		  AND ro.destination_iata = $2
		  AND f.departure_time   >= $3
		  AND f.departure_time    < $4
		  AND f.available_seats  >= $5
		  AND f.status            = 'SCHEDULED'
		ORDER BY f.departure_time`,
		origin, destination, startOfDay, endOfDay, passengers,
	)
	if err != nil {
		return nil, fmt.Errorf("search flights: %w", err)
	}
	defer rows.Close()

	var flights []model.Flight
	for rows.Next() {
		var f model.Flight
		if err := rows.Scan(
			&f.ID, &f.FlightNumber,
			&f.Origin, &f.Destination,
			&f.DepartureTime, &f.ArrivalTime,
			&f.Status, &f.BasePrice, &f.Currency, &f.AvailableSeats,
		); err != nil {
			return nil, fmt.Errorf("scan flight: %w", err)
		}
		f.DurationMinutes = int(f.ArrivalTime.Sub(f.DepartureTime).Minutes())
		flights = append(flights, f)
	}
	return flights, rows.Err()
}

// GetByID fetches a single flight by primary key.
// TODO: implement
func (r *FlightRepository) GetByID(id int64) (*model.Flight, error) {
	return nil, errors.New("not implemented")
}
