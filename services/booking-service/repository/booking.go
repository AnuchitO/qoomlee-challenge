package repository

import (
	"database/sql"
	"errors"

	"gitlab.com/arise-by-infinitas/qoomlee/booking-service/model"
)

var ErrNotFound = errors.New("not found")

// BookingRepository handles all database operations for bookings and passengers.
// Define this as an interface in your service layer so it can be mocked in unit tests.
type BookingRepository struct {
	db *sql.DB
}

func NewBookingRepository(db *sql.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

// InsertPassenger creates a new passenger row and returns the generated id.
//
// TODO: implement
func (r *BookingRepository) InsertPassenger(p *model.PassengerRequest) (int64, error) {
	return 0, errors.New("not implemented")
}

// InsertBooking creates a booking and decrements available_seats in one transaction.
// If available_seats is already 0 the UPDATE matches 0 rows — return a
// "no seats available" error so the handler can return 409.
//
// Transaction order:
//  1. UPDATE flights SET available_seats = available_seats - 1 WHERE id = $1 AND available_seats > 0
//  2. INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount, currency)
//
// TODO: implement
func (r *BookingRepository) InsertBooking(b *model.Booking) (*model.Booking, error) {
	return nil, errors.New("not implemented")
}

// GetByRef retrieves a booking joined with its passenger and flight (including route).
// Return ErrNotFound if no booking matches bookingRef.
//
// TODO: implement
func (r *BookingRepository) GetByRef(bookingRef string) (*model.BookingDetail, error) {
	return nil, errors.New("not implemented")
}

// UpdateStatus sets booking.status and booking.updated_at for the given bookingRef.
// Return ErrNotFound if no booking matches.
//
// TODO: implement
func (r *BookingRepository) UpdateStatus(bookingRef, status string) error {
	return errors.New("not implemented")
}
