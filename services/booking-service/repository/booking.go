package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"gitlab.com/arise-by-infinitas/qoomlee/booking-service/model"
)

var ErrNotFound = errors.New("not found")

type BookingRepository struct {
	db *sql.DB
}

func NewBookingRepository(db *sql.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

// InsertPassenger creates a new passenger row and returns the generated ID.
func (r *BookingRepository) InsertPassenger(p *model.PassengerRequest) (int64, error) {
	var id int64
	err := r.db.QueryRow(
		`INSERT INTO passengers (first_name, last_name, email, phone, passport_number, nationality)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id`,
		p.FirstName, p.LastName, p.Email, p.Phone, p.PassportNumber, p.Nationality,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("insert passenger: %w", err)
	}
	return id, nil
}

// InsertBooking creates a booking and decrements available_seats in the same transaction.
func (r *BookingRepository) InsertBooking(b *model.Booking) (*model.Booking, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck

	// Decrement available_seats (overbooking guard)
	res, err := tx.Exec(
		`UPDATE flights SET available_seats = available_seats - 1
		 WHERE id = $1 AND available_seats > 0`,
		b.FlightID,
	)
	if err != nil {
		return nil, fmt.Errorf("decrement seats: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, errors.New("no seats available")
	}

	err = tx.QueryRow(
		`INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount, currency)
		 VALUES ($1, $2, $3, 'PENDING', $4, $5)
		 RETURNING id, created_at, updated_at`,
		b.BookingRef, b.FlightID, b.PassengerID, b.TotalAmount, b.Currency,
	).Scan(&b.ID, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert booking: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return b, nil
}

// GetByRef retrieves a booking by its 6-char PNR.
// TODO: implement full version
func (r *BookingRepository) GetByRef(bookingRef string) (*model.Booking, error) {
	return nil, errors.New("not implemented")
}

// UpdateStatus sets the booking status and updated_at.
// TODO: implement full version
func (r *BookingRepository) UpdateStatus(bookingRef, status string) error {
	_, err := r.db.Exec(
		`UPDATE bookings SET status=$1, updated_at=$2 WHERE booking_ref=$3`,
		status, time.Now(), bookingRef,
	)
	return err
}
