-- Qoomlee Airline — Payment DB Seed Data
--
-- ── Deterministic IDs ─────────────────────────────────────────────────────────
--   payments: SEED01 SUCCEEDED=1, SEED02 FAILED=2,
--             MNKP23 SUCCEEDED=3, AKVWQ4 SUCCEEDED=4, NRPQ56 FAILED=5
--
-- ── booking_id values reference booking DB bookings.id (logical cross-DB ref) ─
--   SEED01 booking → booking DB id=1
--   SEED02 booking → booking DB id=2
--   MNKP23 booking → booking DB id=3
--   AKVWQ4 booking → booking DB id=4
--   NRPQ56 booking → booking DB id=5
--
-- ── Pre-seeded test payments ──────────────────────────────────────────────────
--   SEED01 SUCCEEDED → use for FindByBookingRef read test and ALREADY_PAID guard
--   SEED02 FAILED    → use for GetPayment on a failed attempt (booking stays PENDING)
--   MNKP23 SUCCEEDED → confirmed booking read test (multi-route)
--   AKVWQ4 SUCCEEDED → confirmed booking read test (CGK route)
--   NRPQ56 FAILED    → use for payment retry test (passenger retries with new card)

INSERT INTO payments (booking_ref, booking_id, payment_provider, provider_charge_id, amount_minor, currency, status, failure_code, failure_message, paid_at, created_at)
VALUES
    ('SEED01', 1, 'OMISE', 'chrg_test_seed01xxxxxxxxxx', 350000, 'THB', 'SUCCEEDED', NULL,                NULL,                              '2026-06-01 00:05:00+00', '2026-06-01 00:05:00+00'),  -- id=1  "3500.00" THB
    ('SEED02', 2, 'OMISE', 'chrg_test_seed02xxxxxxxxxx', 350000, 'THB', 'FAILED',    'insufficient_fund', 'The card has insufficient funds.', NULL,                     '2026-06-01 00:01:00+00'),  -- id=2  "3500.00" THB
    ('MNKP23', 3, 'OMISE', 'chrg_test_mnkp23xxxxxxxxxx', 129000, 'THB', 'SUCCEEDED', NULL,                NULL,                              '2026-06-02 08:05:00+00', '2026-06-02 08:05:00+00'),  -- id=3  "1290.00" THB
    ('AKVWQ4', 4, 'OMISE', 'chrg_test_akvwq4xxxxxxxxxx', 289000, 'THB', 'SUCCEEDED', NULL,                NULL,                              '2026-06-03 03:05:00+00', '2026-06-03 03:05:00+00'),  -- id=4  "2890.00" THB
    ('NRPQ56', 5, 'OMISE', 'chrg_test_nrpq56xxxxxxxxxx', 129000, 'THB', 'FAILED',    'insufficient_fund', 'The card has insufficient funds.', NULL,                     '2026-06-04 05:01:00+00');  -- id=5  "1290.00" THB
