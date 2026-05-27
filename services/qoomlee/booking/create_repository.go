package booking

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

// Create runs a single ACID transaction:
//  1. SELECT available_seats … FOR UPDATE (row lock)
//  2. Guard against overbooking
//  3. INSERT INTO passengers
//  4. INSERT INTO bookings  (total_amount_minor copied from flights.base_price_minor)
//  5. UPDATE flights SET available_seats = available_seats - 1
func (r *repository) Create(ctx context.Context, flightID int64, passenger Passenger, pnr string) (*Booking, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback() }()

	// Step 1+2: lock the flight row and check seat availability
	var availableSeats int
	var basePriceMinor int64
	var currency string
	err = tx.QueryRowContext(ctx,
		`SELECT available_seats, base_price_minor, currency
		   FROM flights WHERE id = $1 FOR UPDATE`,
		flightID,
	).Scan(&availableSeats, &basePriceMinor, &currency)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("flight %d not found", flightID)
	}
	if err != nil {
		return nil, err
	}
	if availableSeats <= 0 {
		return nil, ErrNoSeatsAvailable
	}

	// Step 3: insert passenger
	var passengerID int64
	err = tx.QueryRowContext(ctx,
		`INSERT INTO passengers (first_name, last_name, email, phone, passport_number, nationality)
		 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		passenger.FirstName, passenger.LastName, passenger.Email,
		nullableString(passenger.Phone),
		nullableString(passenger.PassportNumber),
		nullableString(passenger.Nationality),
	).Scan(&passengerID)
	if err != nil {
		return nil, err
	}

	// Step 4: insert booking
	var bookingID int64
	err = tx.QueryRowContext(ctx,
		`INSERT INTO bookings (booking_ref, flight_id, passenger_id, total_amount_minor, currency)
		 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		pnr, flightID, passengerID, basePriceMinor, currency,
	).Scan(&bookingID)
	if err != nil {
		return nil, err
	}

	// Step 5: decrement seat counter
	_, err = tx.ExecContext(ctx,
		`UPDATE flights SET available_seats = available_seats - 1 WHERE id = $1`,
		flightID,
	)
	if err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &Booking{
		ID:               bookingID,
		BookingRef:       pnr,
		Status:           "PENDING",
		TotalAmountMinor: basePriceMinor,
		TotalAmount:      fmt.Sprintf("%.2f", float64(basePriceMinor)/100),
		Currency:         currency,
	}, nil
}
