package payment

import (
	"context"
	"database/sql"
)

type postgresRepository struct {
	db *sql.DB
}

// NewRepository creates a Postgres-backed Repository.
func NewRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Insert(ctx context.Context, p *Payment) (*Payment, error) {
	var paidAt sql.NullTime
	if !p.PaidAt.IsZero() {
		paidAt = sql.NullTime{Time: p.PaidAt, Valid: true}
	}

	err := r.db.QueryRowContext(ctx,
		`INSERT INTO payments
		   (booking_ref, booking_id, payment_provider, provider_charge_id,
		    amount_minor, currency, status, failure_code, failure_message, paid_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		 RETURNING id`,
		p.BookingRef, p.BookingID, p.PaymentProvider, p.ProviderChargeID,
		p.AmountMinor, p.Currency, p.Status,
		nullStr(p.FailureCode), nullStr(p.FailureMessage),
		paidAt,
	).Scan(&p.ID)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func nullStr(s string) sql.NullString {
	return sql.NullString{String: s, Valid: s != ""}
}
