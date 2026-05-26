-- Qoomlee Airline — Seed Data
--
-- ── Deterministic IDs ─────────────────────────────────────────────────────────
--   aircraft_types  : A320=1, B777=2, A330=3
--   routes          : BKK→SIN=1, BKK→HKG=2, BKK→NRT=3
--   flights         : QM101=1, QM102=2, SC201=3, QM201=4, QM301=5, QM999=6
--   passengers      : seed passenger id=1
--   bookings        : SEED01=1 (CONFIRMED), SEED02=2 (PENDING)
--   payments        : SEED01 SUCCEEDED=1, SEED02 FAILED=2
--
-- ── Flights by route (all on 2026-06-15, use this date in all tests) ──────────
--   BKK → SIN  :  QM101 (id=1), QM102 (id=2), SC201 (id=3), QM999 (id=6, SOLD OUT)
--   BKK → HKG  :  QM201 (id=4)
--   BKK → NRT  :  QM301 (id=5, overnight)
--
-- ── Pre-seeded test bookings (use in integration / contract tests) ─────────────
--   SEED01  flight=QM101  status=CONFIRMED  → use for duplicate-payment guard (409 ALREADY_PAID)
--   SEED02  flight=QM101  status=PENDING    → use for GetByRef read tests and payment flow tests
--   QM999   available_seats=0              → use for no-seats-available (409 NO_SEATS_AVAILABLE)

-- ── Aircraft types ────────────────────────────────────────────────────────────
INSERT INTO aircraft_types (code, name, total_seats) VALUES
    ('A320', 'Airbus A320',        180),
    ('B777', 'Boeing 777-300ER',   396),
    ('A330', 'Airbus A330-300',    295);

-- ── Routes (outbound only — round-trip out of scope) ─────────────────────────
INSERT INTO routes (origin_iata, destination_iata, distance_km) VALUES
    ('BKK', 'SIN', 1435),   -- id=1
    ('BKK', 'HKG', 1701),   -- id=2
    ('BKK', 'NRT', 4609);   -- id=3

-- ── Flights ───────────────────────────────────────────────────────────────────
-- Departure timezone:  BKK = UTC+7, SIN = UTC+8, HKG = UTC+8, NRT = UTC+9
-- Duration (UTC):
--   QM101 / QM102 / SC201 / QM999 : BKK→SIN  150 min
--   QM201                          : BKK→HKG  150 min
--   QM301                          : BKK→NRT  365 min (overnight, arrives next day)
--   QM999                          : SOLD OUT — available_seats=0; use for NO_SEATS_AVAILABLE test
--
-- available_seats is the authoritative counter for flight search.
-- Decrement it (with SELECT FOR UPDATE) inside the same transaction as
-- INSERT INTO bookings to prevent overbooking.
-- Note: QM101 available_seats=154 — 2 are held by pre-seeded bookings SEED01 and SEED02.
INSERT INTO flights
    (flight_number, route_id, aircraft_type_id, departure_time, arrival_time, base_price, available_seats)
VALUES
--   number   route  aircraft  departure (local+tz)            arrival (local+tz)             price    seats
    ('QM101',   1,     1,    '2026-06-15 08:00:00+07', '2026-06-15 11:30:00+08',  3500.00,  154),  -- id=1 (2 seats pre-booked)
    ('QM102',   1,     1,    '2026-06-15 14:00:00+07', '2026-06-15 17:30:00+08',  2800.00,   30),  -- id=2
    ('SC201',   1,     1,    '2026-06-15 10:00:00+07', '2026-06-15 13:30:00+08',  2200.00,   78),  -- id=3
    ('QM201',   2,     2,    '2026-06-15 07:30:00+07', '2026-06-15 11:00:00+08',  4500.00,  200),  -- id=4
    ('QM301',   3,     2,    '2026-06-15 23:55:00+07', '2026-06-16 08:00:00+09',  9800.00,  150),  -- id=5 overnight
    ('QM999',   1,     1,    '2026-06-15 22:00:00+07', '2026-06-16 01:30:00+08',  3500.00,    0);  -- id=6 SOLD OUT

-- ── Seats for QM101 (flight id=1) ─────────────────────────────────────────────
-- Rows 1–4   → BUSINESS  (4 rows × 6 cols = 24 seats)
-- Rows 5–30  → ECONOMY   (26 rows × 6 cols = 156 seats)
-- Seats for flights 2–6 are not seeded — seat picker is out of scope.
DO $$
DECLARE
    r   INT;
    col CHAR;
    cls VARCHAR(10);
BEGIN
    FOREACH col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
        FOR r IN 1..30 LOOP
            cls := CASE WHEN r <= 4 THEN 'BUSINESS' ELSE 'ECONOMY' END;
            INSERT INTO seats (flight_id, seat_number, class)
            VALUES (1, r::TEXT || col, cls);
        END LOOP;
    END LOOP;
END $$;

-- ── Pre-seeded passenger (id=1) ───────────────────────────────────────────────
INSERT INTO passengers (first_name, last_name, email, phone, passport_number, date_of_birth, nationality)
VALUES ('Seed', 'User', 'seed@qoomlee.test', '+66800000001', 'SEED0001', '1990-01-01', 'TH');
-- → id=1

-- ── Pre-seeded bookings ───────────────────────────────────────────────────────
-- SEED01: CONFIRMED booking — use to test duplicate-payment guard (409 ALREADY_PAID)
-- SEED02: PENDING booking   — use for GetByRef read tests and payment retry flow
-- confirmed_payment_id is NULL here; wired to payments.id=1 via UPDATE below.
INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount, currency, created_at, updated_at)
VALUES
    ('SEED01', 1, 1, 'CONFIRMED', 3500.00, 'THB', '2026-06-01 00:00:00+00', '2026-06-01 00:05:00+00'),  -- id=1
    ('SEED02', 1, 1, 'PENDING',   3500.00, 'THB', '2026-06-01 00:00:00+00', '2026-06-01 00:00:00+00');  -- id=2

-- ── Pre-seeded payments ───────────────────────────────────────────────────────
-- SEED01 payment: SUCCEEDED — use for FindByBookingRef read test
-- SEED02 payment: FAILED    — use for GetPayment on a failed attempt (booking stays PENDING)
INSERT INTO payments (booking_ref, booking_id, amount, currency, status, omise_charge_id, failure_code, failure_message, paid_at, created_at)
VALUES
    ('SEED01', 1, 350000, 'THB', 'SUCCEEDED', 'chrg_test_seed01xxxxxxxxxx', NULL,                NULL,                                   '2026-06-01 00:05:00+00', '2026-06-01 00:05:00+00'),  -- id=1
    ('SEED02', 2, 350000, 'THB', 'FAILED',    'chrg_test_seed02xxxxxxxxxx', 'insufficient_fund', 'The card has insufficient funds.',      NULL,                     '2026-06-01 00:01:00+00');  -- id=2

-- ── Wire confirmed_payment_id back to SEED01 ─────────────────────────────────
-- payments(id=1) is the SUCCEEDED charge that confirmed SEED01.
-- This UPDATE must come after both INSERTs due to the FK constraint.
UPDATE bookings SET confirmed_payment_id = 1 WHERE booking_ref = 'SEED01';
