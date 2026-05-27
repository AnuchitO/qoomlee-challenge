package booking

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

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

// GetByRef fetches a full booking with nested passenger and flight data.
func (r *repository) GetByRef(ctx context.Context, ref string) (*Booking, error) {
	q := `
	SELECT b.id, b.booking_ref, b.status,
	       b.total_amount_minor, b.currency, b.created_at,
	       b.payment_provider, b.provider_charge_id,
	       p.first_name, p.last_name, p.email,
	       COALESCE(p.phone, ''), COALESCE(p.passport_number, ''), COALESCE(p.nationality, ''),
	       f.flight_number, r.origin_iata, r.destination_iata,
	       f.departure_time, f.arrival_time
	FROM bookings b
	JOIN passengers p ON p.id = b.passenger_id
	JOIN flights    f ON f.id = b.flight_id
	JOIN routes     r ON r.id = f.route_id
	WHERE b.booking_ref = $1`

	var b Booking
	err := r.db.QueryRowContext(ctx, q, ref).Scan(
		&b.ID, &b.BookingRef, &b.Status,
		&b.TotalAmountMinor, &b.Currency, &b.CreatedAt,
		&b.PaymentProvider, &b.ProviderChargeID,
		&b.Passenger.FirstName, &b.Passenger.LastName, &b.Passenger.Email,
		&b.Passenger.Phone, &b.Passenger.PassportNumber, &b.Passenger.Nationality,
		&b.Flight.FlightNumber, &b.Flight.Origin, &b.Flight.Destination,
		&b.Flight.DepartureTime, &b.Flight.ArrivalTime,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	b.TotalAmount = fmt.Sprintf("%.2f", float64(b.TotalAmountMinor)/100)
	return &b, nil
}

// UpdateStatus flips the booking to CONFIRMED and records payment traceability data.
func (r *repository) UpdateStatus(ctx context.Context, ref string, req UpdateStatusRequest) error {
	res, err := r.db.ExecContext(ctx,
		`UPDATE bookings
		    SET status               = $1,
		        confirmed_payment_id = $2,
		        payment_provider     = $3,
		        provider_charge_id   = $4,
		        updated_at           = NOW()
		  WHERE booking_ref = $5`,
		req.Status, req.PaymentID, req.PaymentProvider, req.ProviderChargeID, ref,
	)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// nullableString converts an empty Go string to a SQL NULL.
func nullableString(s string) any {
	if s == "" {
		return nil
	}
	return s
}
