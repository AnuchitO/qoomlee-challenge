package booking

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

// UpdateStatus flips the booking to CONFIRMED and records payment traceability data.
// A booking that is already CONFIRMED, or that is (or has just lazily become) EXPIRED,
// is rejected with ErrAlreadyConfirmed / ErrBookingExpired respectively.
func (r *repository) UpdateStatus(ctx context.Context, ref string, req UpdateStatusRequest) error {
	var status string
	var expiresAt time.Time
	var flightID int64
	err := r.db.QueryRowContext(ctx,
		`SELECT status, expires_at, flight_id FROM bookings WHERE booking_ref = $1`,
		ref,
	).Scan(&status, &expiresAt, &flightID)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}

	if status == "CONFIRMED" {
		return ErrAlreadyConfirmed
	}

	if status == "PENDING" && expiresAt.Before(time.Now()) {
		if err := r.expireBooking(ctx, ref, flightID); err != nil {
			return err
		}
		status = "EXPIRED"
	}

	if status == "EXPIRED" {
		return ErrBookingExpired
	}

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
