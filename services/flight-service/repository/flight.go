package repository

import (
	"database/sql"
	"errors"

	"gitlab.com/arise-by-infinitas/qoomlee/flight-service/model"
)

var ErrNotFound = errors.New("not found")

// FlightRepository defines the database operations for flights.
// Define this as an interface in your service layer so it can be mocked in unit tests.
type FlightRepository struct {
	db *sql.DB
}

func NewFlightRepository(db *sql.DB) *FlightRepository {
	return &FlightRepository{db: db}
}

// Search returns SCHEDULED flights matching origin/destination on a given UTC date
// with at least `passengers` available seats.
//
// Hint: convert the date string to a UTC time range (start of day → end of day)
// before querying. Use parameterised queries ($1, $2, ...) to avoid SQL injection.
//
// TODO: implement
func (r *FlightRepository) Search(origin, destination, date string, passengers int) ([]model.Flight, error) {
	return nil, errors.New("not implemented")
}

// GetByID fetches a single flight by primary key.
// Return ErrNotFound if no row matches.
//
// TODO: implement
func (r *FlightRepository) GetByID(id int64) (*model.Flight, error) {
	return nil, errors.New("not implemented")
}
