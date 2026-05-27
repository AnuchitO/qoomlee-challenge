-- Qoomlee Airline — Booking DB Seed Data
--
-- ── Deterministic IDs ─────────────────────────────────────────────────────────
--   aircraft_types  : A320=1, B777=2, A330=3, B737=4
--   routes          : BKK→SIN=1, BKK→HKG=2, BKK→NRT=3, BKK→KUL=4, BKK→CGK=5, BKK→MNL=6
--   flights (2026-06-15): QM101=1, QM102=2, SC201=3, QM201=4, QM301=5, QM999=6,
--                         QM401=7, QM402=8, QM501=9, QM601=10
--   flights (2026-06-16): QM103=11, QM202=12  ← next-day flights for date-filter tests
--   passengers      : Seed=1, Wanchai=2, Narumon=3, Akira=4, Ahmad=5
--   bookings        : SEED01=1 (CONFIRMED), SEED02=2 (PENDING),
--                     MNKP23=3 (CONFIRMED), AKVWQ4=4 (CONFIRMED),
--                     NRPQ56=5 (PENDING+FAILED), FMXB89=6 (PENDING)
--
-- ── Flights by route ──────────────────────────────────────────────────────────
--   BKK → SIN  :  QM101 (id=1), QM102 (id=2), SC201 (id=3), QM999 (id=6, SOLD OUT), QM103 (id=11, 2026-06-16)
--   BKK → HKG  :  QM201 (id=4), QM202 (id=12, 2026-06-16)
--   BKK → NRT  :  QM301 (id=5, overnight)
--   BKK → KUL  :  QM401 (id=7), QM402 (id=8, nearly full 12 seats)
--   BKK → CGK  :  QM501 (id=9)
--   BKK → MNL  :  QM601 (id=10)
--
-- ── Pre-seeded test bookings (use in integration / contract tests) ─────────────
--   SEED01  flight=QM101  status=CONFIRMED  → use for duplicate-payment guard (409 ALREADY_PAID)
--   SEED02  flight=QM101  status=PENDING    → use for GetByRef read tests and payment flow tests
--   MNKP23  flight=QM401  status=CONFIRMED  → use for multi-route confirmed booking reads
--   AKVWQ4  flight=QM501  status=CONFIRMED  → use for CGK route confirmed booking reads
--   NRPQ56  flight=QM401  status=PENDING    → use for payment retry test (has a FAILED attempt)
--   FMXB89  flight=QM601  status=PENDING    → use for first-charge flow (no prior payment)
--   QM999   available_seats=0              → use for no-seats-available (409 NO_SEATS_AVAILABLE)
--   QM402   available_seats=12             → use for low-seats / nearly-full scenario

-- ── Aircraft types ────────────────────────────────────────────────────────────
INSERT INTO aircraft_types (code, name, total_seats) VALUES
    ('A320', 'Airbus A320',        180),
    ('B777', 'Boeing 777-300ER',   396),
    ('A330', 'Airbus A330-300',    295),
    ('B737', 'Boeing 737-800',     162);

-- ── Routes (outbound only — round-trip out of scope) ─────────────────────────
INSERT INTO routes (origin_iata, destination_iata, distance_km) VALUES
    ('BKK', 'SIN', 1435),   -- id=1
    ('BKK', 'HKG', 1701),   -- id=2
    ('BKK', 'NRT', 4609),   -- id=3
    ('BKK', 'KUL', 1160),   -- id=4
    ('BKK', 'CGK', 2315),   -- id=5  Jakarta
    ('BKK', 'MNL', 2159);   -- id=6  Manila

-- ── Flights ───────────────────────────────────────────────────────────────────
-- Departure timezone:  BKK = UTC+7, SIN = UTC+8, HKG = UTC+8, NRT = UTC+9
-- KUL/MNL/HKG = UTC+8, CGK = UTC+7
-- Duration (UTC):
--   QM101 / QM102 / SC201 / QM999 : BKK→SIN  150 min
--   QM201                          : BKK→HKG  150 min
--   QM301                          : BKK→NRT  365 min (overnight, arrives next day)
--   QM999                          : SOLD OUT — available_seats=0; use for NO_SEATS_AVAILABLE test
--   BKK→KUL 120min, BKK→CGK 210min, BKK→MNL 180min
--
-- available_seats is the authoritative counter for flight search.
-- Decrement it (with SELECT FOR UPDATE) inside the same transaction as
-- INSERT INTO bookings to prevent overbooking.
-- Note: QM101 available_seats=154 — 2 are held by pre-seeded bookings SEED01 and SEED02.
INSERT INTO flights
    (flight_number, route_id, aircraft_type_id, departure_time, arrival_time, base_price_minor, currency, available_seats)
VALUES
--   number   route  aircraft  departure (local+tz)            arrival (local+tz)           satang   cur   seats
    ('QM101',   1,     1,    '2026-06-15 08:00:00+07', '2026-06-15 11:30:00+08',   350000, 'THB',  154),  -- id=1  "3500.00" THB (2 seats pre-booked)
    ('QM102',   1,     1,    '2026-06-15 14:00:00+07', '2026-06-15 17:30:00+08',   280000, 'THB',   30),  -- id=2  "2800.00" THB
    ('SC201',   1,     1,    '2026-06-15 10:00:00+07', '2026-06-15 13:30:00+08',   220000, 'THB',   78),  -- id=3  "2200.00" THB
    ('QM201',   2,     2,    '2026-06-15 07:30:00+07', '2026-06-15 11:00:00+08',   450000, 'THB',  200),  -- id=4  "4500.00" THB
    ('QM301',   3,     2,    '2026-06-15 23:55:00+07', '2026-06-16 08:00:00+09',   980000, 'THB',  150),  -- id=5  "9800.00" THB overnight
    ('QM999',   1,     1,    '2026-06-15 22:00:00+07', '2026-06-16 01:30:00+08',   350000, 'THB',    0),  -- id=6  "3500.00" THB SOLD OUT
    ('QM401',   4,     1,    '2026-06-15 06:15:00+07', '2026-06-15 09:15:00+08',   129000, 'THB',  138),  -- id=7  "1290.00" THB  BKK→KUL morning budget
    ('QM402',   4,     4,    '2026-06-15 17:30:00+07', '2026-06-15 20:30:00+08',   185000, 'THB',   12),  -- id=8  "1850.00" THB  BKK→KUL evening nearly full
    ('QM501',   5,     3,    '2026-06-15 08:00:00+07', '2026-06-15 11:30:00+07',   289000, 'THB',  179),  -- id=9  "2890.00" THB  BKK→CGK
    ('QM601',   6,     2,    '2026-06-15 07:00:00+07', '2026-06-15 11:00:00+08',   320000, 'THB',  249),  -- id=10 "3200.00" THB  BKK→MNL
    ('QM103',   1,     1,    '2026-06-16 09:00:00+07', '2026-06-16 12:30:00+08',   310000, 'THB',  160),  -- id=11 "3100.00" THB  BKK→SIN next day
    ('QM202',   2,     2,    '2026-06-16 11:00:00+07', '2026-06-16 14:30:00+08',   490000, 'THB',  200);  -- id=12 "4900.00" THB  BKK→HKG next day

-- ── Seats for QM101 (flight id=1) ─────────────────────────────────────────────
-- Rows 1–4   → BUSINESS  (4 rows × 6 cols = 24 seats)
-- Rows 5–30  → ECONOMY   (26 rows × 6 cols = 156 seats)
-- Seats for flights 2–12 are not seeded — seat picker is out of scope.
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

-- ── Passengers ────────────────────────────────────────────────────────────────
INSERT INTO passengers (first_name, last_name, email, phone, passport_number, date_of_birth, nationality)
VALUES
    ('Seed',    'User',       'seed@qoomlee.test',         '+66800000001', 'SEED0001', '1990-01-01', 'TH'),  -- id=1
    ('Wanchai', 'Srisuk',     'wanchai@example.com',       '+66812340001', 'TH123456', '1985-03-22', 'TH'),  -- id=2
    ('Narumon', 'Pattanakit', 'narumon@example.com',       '+66812340002', 'TH234567', '1992-07-14', 'TH'),  -- id=3
    ('Akira',   'Tanaka',     'akira.tanaka@example.com',  '+81901234567', 'JP567890', '1988-11-05', 'JP'),  -- id=4
    ('Ahmad',   'Fauzi',      'ahmad.fauzi@example.com',   '+60123456789', 'MY678901', '1995-04-18', 'MY');  -- id=5

-- ── Bookings ──────────────────────────────────────────────────────────────────
-- SEED01: CONFIRMED — use to test duplicate-payment guard (409 ALREADY_PAID)
-- SEED02: PENDING   — use for GetByRef read tests and payment retry flow
-- MNKP23: Wanchai / QM401 (BKK→KUL) / CONFIRMED
-- AKVWQ4: Akira   / QM501 (BKK→CGK) / CONFIRMED
-- NRPQ56: Narumon / QM401 (BKK→KUL) / PENDING — has a FAILED payment → use for retry-payment test
-- FMXB89: Ahmad   / QM601 (BKK→MNL) / PENDING — no payment yet → use for first-charge flow test
-- confirmed_payment_id is a logical cross-DB reference (no FK); wired via UPDATE below.
INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount_minor, currency, created_at, updated_at)
VALUES
    ('SEED01', 1, 1, 'CONFIRMED', 350000, 'THB', '2026-06-01 00:00:00+00', '2026-06-01 00:05:00+00'),  -- id=1  "3500.00" THB
    ('SEED02', 1, 1, 'PENDING',   350000, 'THB', '2026-06-01 00:00:00+00', '2026-06-01 00:00:00+00'),  -- id=2  "3500.00" THB
    ('MNKP23', 7, 2, 'CONFIRMED', 129000, 'THB', '2026-06-02 08:00:00+00', '2026-06-02 08:05:00+00'),  -- id=3  "1290.00" THB
    ('AKVWQ4', 9, 4, 'CONFIRMED', 289000, 'THB', '2026-06-03 03:00:00+00', '2026-06-03 03:05:00+00'),  -- id=4  "2890.00" THB
    ('NRPQ56', 7, 3, 'PENDING',   129000, 'THB', '2026-06-04 05:00:00+00', '2026-06-04 05:00:00+00'),  -- id=5  "1290.00" THB
    ('FMXB89',10, 5, 'PENDING',   320000, 'THB', '2026-06-05 02:00:00+00', '2026-06-05 02:00:00+00');  -- id=6  "3200.00" THB

-- ── Wire payment traceability for CONFIRMED bookings ─────────────────────────
-- confirmed_payment_id: logical cross-DB reference to payment DB payments.id (NO FK)
-- payment_provider + provider_charge_id: copied from Omise response at charge time
--   so GET /api/bookings/:ref can return traceability without joining payment DB.
-- provider_charge_id is the authoritative Omise charge ID (e.g. chrg_test_...).
-- IDs must match provider_charge_id in infra/db/qoomlee-payment/02_seed.sql.
UPDATE bookings SET
    confirmed_payment_id = 1,
    payment_provider     = 'OMISE',
    provider_charge_id   = 'chrg_test_5xkm2r9p8wqv3ntzy7au'
WHERE booking_ref = 'SEED01';

UPDATE bookings SET
    confirmed_payment_id = 3,
    payment_provider     = 'OMISE',
    provider_charge_id   = 'chrg_test_3aw9m6k5xpqr2nvtz8yu'
WHERE booking_ref = 'MNKP23';

UPDATE bookings SET
    confirmed_payment_id = 4,
    payment_provider     = 'OMISE',
    provider_charge_id   = 'chrg_test_7pn4w2m9xkqr6vtzy3au'
WHERE booking_ref = 'AKVWQ4';
