package booking

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

// GetByRef fetches a full booking with nested passenger and flight data.
// If the booking is PENDING and past its expires_at, it is lazily
// transitioned to EXPIRED and its seat hold is released back to
// flights.available_seats in the same transaction.
func (r *repository) GetByRef(ctx context.Context, ref string) (*Booking, error) {
	q := `
	SELECT b.id, b.booking_ref, b.status,
	       b.total_amount_minor, b.currency, b.created_at,
	       b.payment_provider, b.provider_charge_id,
	       b.expires_at, b.flight_id,
	       p.first_name, p.last_name, p.email,
	       COALESCE(p.phone, ''), COALESCE(p.passport_number, ''), COALESCE(p.nationality, ''),
	       f.flight_number, r.origin_iata, r.destination_iata,
	       f.departure_time, f.arrival_time,
	       b.return_flight_id,
	       rf.flight_number, rr.origin_iata, rr.destination_iata,
	       rf.departure_time, rf.arrival_time
	FROM bookings b
	JOIN passengers p  ON p.id  = b.passenger_id
	JOIN flights    f  ON f.id  = b.flight_id
	JOIN routes     r  ON r.id  = f.route_id
	LEFT JOIN flights rf ON rf.id = b.return_flight_id
	LEFT JOIN routes  rr ON rr.id = rf.route_id
	WHERE b.booking_ref = $1`

	var b Booking
	var expiresAt time.Time
	var flightID int64
	var returnFlightID sql.NullInt64
	var rfFlightNumber, rfOrigin, rfDestination sql.NullString
	var rfDepartureTime, rfArrivalTime sql.NullTime
	err := r.db.QueryRowContext(ctx, q, ref).Scan(
		&b.ID, &b.BookingRef, &b.Status,
		&b.TotalAmountMinor, &b.Currency, &b.CreatedAt,
		&b.PaymentProvider, &b.ProviderChargeID,
		&expiresAt, &flightID,
		&b.Passenger.FirstName, &b.Passenger.LastName, &b.Passenger.Email,
		&b.Passenger.Phone, &b.Passenger.PassportNumber, &b.Passenger.Nationality,
		&b.Flight.FlightNumber, &b.Flight.Origin, &b.Flight.Destination,
		&b.Flight.DepartureTime, &b.Flight.ArrivalTime,
		&returnFlightID,
		&rfFlightNumber, &rfOrigin, &rfDestination,
		&rfDepartureTime, &rfArrivalTime,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if returnFlightID.Valid {
		b.ReturnFlight = &FlightSummary{
			FlightNumber:  rfFlightNumber.String,
			Origin:        rfOrigin.String,
			Destination:   rfDestination.String,
			DepartureTime: rfDepartureTime.Time,
			ArrivalTime:   rfArrivalTime.Time,
		}
	}

	b.TotalAmount = fmt.Sprintf("%.2f", float64(b.TotalAmountMinor)/100)

	if b.Status == "PENDING" {
		if expiresAt.Before(time.Now()) {
			if err := r.expireBooking(ctx, ref, flightID); err != nil {
				return nil, err
			}
			b.Status = "EXPIRED"
		} else {
			b.ExpiresAt = &expiresAt
		}
	}

	return &b, nil
}

// expireBooking transitions a PENDING booking to EXPIRED and releases its
// seat hold back to the flight, in a single transaction.
func (r *repository) expireBooking(ctx context.Context, ref string, flightID int64) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		`UPDATE bookings SET status = 'EXPIRED', updated_at = NOW() WHERE booking_ref = $1 AND status = 'PENDING'`,
		ref,
	); err != nil {
		return err
	}

	if _, err := tx.ExecContext(ctx,
		`UPDATE flights SET available_seats = available_seats + 1 WHERE id = $1`,
		flightID,
	); err != nil {
		return err
	}

	return tx.Commit()
}
