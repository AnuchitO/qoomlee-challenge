package booking

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// GetAll returns every booking belonging to userSub, most recent first.
// Any PENDING booking past its expires_at is lazily transitioned to EXPIRED
// and its seat hold released back to flights.available_seats, the same as
// GetByRef does for a single booking.
func (r *repository) GetAll(ctx context.Context, userSub string) ([]Summary, error) {
	if err := r.expirePastDue(ctx, userSub); err != nil {
		return nil, err
	}

	q := `
	SELECT b.booking_ref, b.status, b.expires_at,
	       b.total_amount_minor, b.currency,
	       f.flight_number, rt.origin_iata, rt.destination_iata,
	       f.departure_time, f.arrival_time,
	       rf.flight_number, rr.origin_iata, rr.destination_iata,
	       rf.departure_time, rf.arrival_time
	FROM bookings b
	JOIN flights f  ON f.id  = b.flight_id
	JOIN routes  rt ON rt.id = f.route_id
	LEFT JOIN flights rf ON rf.id = b.return_flight_id
	LEFT JOIN routes  rr ON rr.id = rf.route_id
	WHERE b.user_sub = $1
	ORDER BY b.created_at DESC`

	rows, err := r.db.QueryContext(ctx, q, userSub)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	summaries := []Summary{}
	for rows.Next() {
		var s Summary
		var expiresAt time.Time
		var totalAmountMinor int64
		var rfFlightNumber, rfOrigin, rfDestination sql.NullString
		var rfDepTime, rfArrTime sql.NullTime
		if err := rows.Scan(
			&s.BookingRef, &s.Status, &expiresAt,
			&totalAmountMinor, &s.Currency,
			&s.FlightNumber, &s.Origin, &s.Destination,
			&s.DepartureTime, &s.ArrivalTime,
			&rfFlightNumber, &rfOrigin, &rfDestination,
			&rfDepTime, &rfArrTime,
		); err != nil {
			return nil, err
		}

		s.TotalAmount = fmt.Sprintf("%.2f", float64(totalAmountMinor)/100)
		s.Passengers = 1

		if s.Status == "PENDING" {
			s.ExpiresAt = &expiresAt
		}
		if rfFlightNumber.Valid {
			s.ReturnFlightNumber = rfFlightNumber.String
			s.ReturnOrigin = rfOrigin.String
			s.ReturnDestination = rfDestination.String
			t := rfDepTime.Time
			s.ReturnDepartureTime = &t
			t2 := rfArrTime.Time
			s.ReturnArrivalTime = &t2
		}

		summaries = append(summaries, s)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return summaries, nil
}

// expirePastDue transitions every PENDING booking owned by userSub whose
// expires_at is in the past to EXPIRED, releasing each one's seat hold back
// to flights.available_seats, all in a single transaction.
func (r *repository) expirePastDue(ctx context.Context, userSub string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	rows, err := tx.QueryContext(ctx,
		`UPDATE bookings SET status = 'EXPIRED', updated_at = NOW()
		 WHERE user_sub = $1 AND status = 'PENDING' AND expires_at < NOW()
		 RETURNING flight_id`,
		userSub,
	)
	if err != nil {
		return err
	}

	var flightIDs []int64
	for rows.Next() {
		var flightID int64
		if err := rows.Scan(&flightID); err != nil {
			_ = rows.Close()
			return err
		}
		flightIDs = append(flightIDs, flightID)
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		return err
	}
	_ = rows.Close()

	for _, flightID := range flightIDs {
		if _, err := tx.ExecContext(ctx,
			`UPDATE flights SET available_seats = available_seats + 1 WHERE id = $1`,
			flightID,
		); err != nil {
			return err
		}
	}

	return tx.Commit()
}
