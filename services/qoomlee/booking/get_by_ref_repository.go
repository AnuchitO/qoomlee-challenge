package booking

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

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
