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
    ('SEED01', 1, 'OMISE', 'chrg_test_5xkm2r9p8wqv3ntzy7au', 350000, 'THB', 'SUCCEEDED', NULL,                NULL,                              '2026-06-01 00:05:00+00', '2026-06-01 00:05:00+00'),  -- id=1  "3500.00" THB
    ('SEED02', 2, 'OMISE', 'chrg_test_8jqw4n7k2xpm5vtzy1ar', 350000, 'THB', 'FAILED',    'insufficient_fund', 'The card has insufficient funds.', NULL,                     '2026-06-01 00:01:00+00'),  -- id=2  "3500.00" THB
    ('MNKP23', 3, 'OMISE', 'chrg_test_3aw9m6k5xpqr2nvtz8yu', 129000, 'THB', 'SUCCEEDED', NULL,                NULL,                              '2026-06-02 08:05:00+00', '2026-06-02 08:05:00+00'),  -- id=3  "1290.00" THB
    ('AKVWQ4', 4, 'OMISE', 'chrg_test_7pn4w2m9xkqr6vtzy3au', 289000, 'THB', 'SUCCEEDED', NULL,                NULL,                              '2026-06-03 03:05:00+00', '2026-06-03 03:05:00+00'),  -- id=4  "2890.00" THB
    ('NRPQ56', 5, 'OMISE', 'chrg_test_2mk8p3n7xwqr5vtzy9au', 129000, 'THB', 'FAILED',    'insufficient_fund', 'The card has insufficient funds.', NULL,                     '2026-06-04 05:01:00+00');  -- id=5  "1290.00" THB
