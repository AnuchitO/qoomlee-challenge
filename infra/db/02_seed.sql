-- Qoomlee Airline — Seed Data
--
-- All departures are on 2026-06-15 (UTC+7 Bangkok time).
-- Use this date in smoke tests: ?date=2026-06-15
--
-- Flights by route:
--   BKK → SIN  :  QM101, QM102, SC201  (3 options, different prices & seats)
--   BKK → HKG  :  QM201
--   BKK → NRT  :  QM301  (overnight)
--
-- Seed IDs are deterministic (SERIAL starts at 1):
--   aircraft_types  : A320=1, B777=2, A330=3
--   routes          : BKK→SIN=1, BKK→HKG=2, BKK→NRT=3
--   flights         : QM101=1, QM102=2, SC201=3, QM201=4, QM301=5

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
-- Departure timezone offsets:  BKK = UTC+7, SIN = UTC+8, HKG = UTC+8, NRT = UTC+9
-- Duration (UTC):
--   QM101 / QM102 / SC201 : 08:00→11:30 BKK→SIN  =  01:00→03:30 UTC  = 150 min
--   QM201                  : 07:30→11:00 BKK→HKG  =  00:30→03:00 UTC  = 150 min
--   QM301                  : 23:55→08:00 BKK→NRT  =  16:55→23:00 UTC  = 365 min
--
-- available_seats is the authoritative counter for flight search.
-- Decrement it (with SELECT FOR UPDATE) inside the same transaction as
-- INSERT INTO bookings to prevent overbooking.
INSERT INTO flights
    (flight_number, route_id, aircraft_type_id, departure_time, arrival_time, base_price, available_seats)
VALUES
--   number   route  aircraft  departure (local+tz)         arrival (local+tz)           price    seats
    ('QM101',   1,     1,    '2026-06-15 08:00:00+07', '2026-06-15 11:30:00+08',  3500.00,  156),
    ('QM102',   1,     1,    '2026-06-15 14:00:00+07', '2026-06-15 17:30:00+08',  2800.00,   30),
    ('SC201',   1,     1,    '2026-06-15 10:00:00+07', '2026-06-15 13:30:00+08',  2200.00,   78),
    ('QM201',   2,     2,    '2026-06-15 07:30:00+07', '2026-06-15 11:00:00+08',  4500.00,  200),
    ('QM301',   3,     2,    '2026-06-15 23:55:00+07', '2026-06-16 08:00:00+09',  9800.00,  150);

-- ── Seats for QM101 (flight id=1) ─────────────────────────────────────────────
-- Rows 1–4   → BUSINESS  (4 rows × 6 cols = 24 seats)
-- Rows 5–30  → ECONOMY   (26 rows × 6 cols = 156 seats)
-- Total = 180 seats, 156 ECONOMY available (matches available_seats above)
-- Seats for flights 2–5 are not seeded — seat picker is out of scope.
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
