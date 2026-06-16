package booking

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math"
	"time"
)

// SeatHoldDuration is how long a PENDING booking holds its seat before it is
// lazily expired on the next read (see GetByRef).
const SeatHoldDuration = 15 * time.Minute

// Create runs a single ACID transaction:
//  1. Idempotency check — if a booking with this key already exists, return it immediately
//  2. SELECT available_seats … FOR UPDATE (row lock)
//  3. Guard against overbooking
//  4. INSERT INTO passengers
//  5. INSERT INTO bookings  (total_amount_minor copied from flights.base_price_minor,
//     expires_at = now + SeatHoldDuration, user_sub from the caller's JWT)
//  6. UPDATE flights SET available_seats = available_seats - 1
func (r *repository) Create(ctx context.Context, flightID int64, passenger Passenger, pnr, userSub, bookingToken string) (*Booking, error) {
	if bookingToken != "" {
		existing, err := r.findByBookingToken(ctx, bookingToken)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return nil, err
		}
		if existing != nil {
			return existing, nil
		}
	}

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

	// Step 5: insert booking — total = base + 15 % tax (mirrors frontend calculation)
	taxMinor := int64(math.Round(float64(basePriceMinor) * 0.15))
	totalAmountMinor := basePriceMinor + taxMinor
	expiresAt := time.Now().Add(SeatHoldDuration)
	var bookingID int64
	err = tx.QueryRowContext(ctx,
		`INSERT INTO bookings (booking_ref, flight_id, passenger_id, total_amount_minor, currency, expires_at, user_sub, booking_token)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		pnr, flightID, passengerID, totalAmountMinor, currency, expiresAt, userSub, nullableString(bookingToken),
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
		TotalAmountMinor: totalAmountMinor,
		TotalAmount:      fmt.Sprintf("%.2f", float64(totalAmountMinor)/100),
		Currency:         currency,
		ExpiresAt:        &expiresAt,
	}, nil
}

func (r *repository) findByBookingToken(ctx context.Context, key string) (*Booking, error) {
	var b Booking
	var expiresAt time.Time
	err := r.db.QueryRowContext(ctx,
		`SELECT id, booking_ref, status, total_amount_minor, currency, expires_at
		   FROM bookings WHERE booking_token = $1`,
		key,
	).Scan(&b.ID, &b.BookingRef, &b.Status, &b.TotalAmountMinor, &b.Currency, &expiresAt)
	if err != nil {
		return nil, err
	}
	b.TotalAmount = fmt.Sprintf("%.2f", float64(b.TotalAmountMinor)/100)
	b.ExpiresAt = &expiresAt
	return &b, nil
}
