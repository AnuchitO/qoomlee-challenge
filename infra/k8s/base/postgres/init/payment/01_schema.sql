-- Qoomlee Airline — Payment DB Schema  (payment-service owns this database)
-- Database: postgres-qoomlee-payment  (port 5434 on host)
--
-- Key conventions:
--   • ALL monetary amounts use BIGINT minor units (satang).  1 THB = 100 satang.
--   • payments.booking_id is a logical cross-DB reference to bookings.id
--     in the booking database.  There is NO foreign key constraint.
--     payment-service calls GET /api/bookings/:ref before charging to validate
--     status and amount, then calls PUT /api/bookings/:ref/status after success.
--   • payment-service MUST validate that request.amount_minor == booking.total_amount_minor
--     and currencies match before calling Omise. Mismatches return 400 AMOUNT_MISMATCH.

-- ─────────────────────────────────────────
-- PAYMENT SERVICE domain
-- ─────────────────────────────────────────

CREATE TABLE payments (
    id                    SERIAL PRIMARY KEY,
    booking_ref           VARCHAR(6)   NOT NULL,
    booking_id            INT          NOT NULL,  -- logical ref to booking DB; NO FK constraint
    payment_provider      VARCHAR(50)  NOT NULL DEFAULT 'OMISE', -- OMISE | 2C2P | STRIPE | …
    provider_charge_id    VARCHAR(100),                          -- provider's transaction reference
    amount_minor          BIGINT       NOT NULL,                 -- minor units (satang); MUST equal bookings.total_amount_minor
    currency              CHAR(3)      NOT NULL DEFAULT 'THB',
    status                VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING | SUCCEEDED | FAILED
    failure_code          VARCHAR(100),
    failure_message       TEXT,
    paid_at               TIMESTAMPTZ,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

CREATE INDEX idx_payments_booking_ref     ON payments(booking_ref);
CREATE INDEX idx_payments_status          ON payments(status);
CREATE INDEX idx_payments_provider_charge ON payments(provider_charge_id);

-- Prevents two SUCCEEDED payments for the same booking (DB-level double-charge guard).
CREATE UNIQUE INDEX idx_payments_one_success
    ON payments(booking_ref)
    WHERE status = 'SUCCEEDED';
