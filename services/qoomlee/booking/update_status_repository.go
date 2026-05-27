package booking

import "context"

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
