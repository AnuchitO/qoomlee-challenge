package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"gitlab.com/arise-by-infinitas/qoomlee/payment-service/model"
)

var ErrNotFound = errors.New("not found")

type PaymentRepository struct {
	db *sql.DB
}

func NewPaymentRepository(db *sql.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

// Insert records a new payment row and returns it with the generated ID.
func (r *PaymentRepository) Insert(p *model.Payment) (*model.Payment, error) {
	row := r.db.QueryRow(
		`INSERT INTO payments
		   (booking_ref, booking_id, amount, currency, status,
		    omise_charge_id, failure_code, failure_message, paid_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING id, created_at`,
		p.BookingRef, p.BookingID, p.Amount, p.Currency, p.Status,
		p.OmiseChargeID, p.FailureCode, p.FailureMessage, p.PaidAt,
	)
	err := row.Scan(&p.ID, &p.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert payment: %w", err)
	}
	return p, nil
}

// UpdateStatus sets the status, failure info, and paid_at on an existing payment.
func (r *PaymentRepository) UpdateStatus(id int64, status, failureCode, failureMessage string, paidAt *time.Time) error {
	_, err := r.db.Exec(
		`UPDATE payments SET status=$1, failure_code=$2, failure_message=$3, paid_at=$4 WHERE id=$5`,
		status, failureCode, failureMessage, paidAt, id,
	)
	return err
}

// GetByBookingRef retrieves the most recent payment for a booking.
// Return ErrNotFound if no payment record exists for bookingRef.
//
// Hint: ORDER BY created_at DESC LIMIT 1
//
// TODO: implement
func (r *PaymentRepository) GetByBookingRef(bookingRef string) (*model.Payment, error) {
	return nil, errors.New("not implemented")
}
