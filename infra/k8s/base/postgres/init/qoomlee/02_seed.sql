-- Qoomlee Airline — Booking DB Seed Data
--
-- ── Deterministic IDs ─────────────────────────────────────────────────────────
--   aircraft_types  : A320=1, B777=2, A330=3, B737=4
--   routes          : BKK→SIN=1, BKK→HKG=2, BKK→NRT=3, BKK→KUL=4, BKK→CGK=5, BKK→MNL=6
--   routes (return) : SIN→BKK=7, HKG→BKK=8, NRT→BKK=9, KUL→BKK=10, CGK→BKK=11, MNL→BKK=12
--
--   flights (+0d,  ×1.5 last-minute):  ids 1–5, 39–48  (15 flights, spread 06:15–23:00)
--     QM101=1(SIN 08:00), QM201=2(HKG 07:30), QM401=3(KUL 06:15), QM501=4(CGK 08:00), QM601=5(MNL 07:00)
--     QM102=39(SIN 10:00), QM202=40(HKG 12:00), SC201=41(SIN 14:00), QM402=42(KUL 13:30),
--     QM301=43(NRT 16:00), QM502=44(CGK 17:00), QM602=45(MNL 19:00),
--     QM103=46(SIN 21:00), QM203=47(HKG 22:30), QM403=48(KUL 23:00)
--   flights (+1d,  ×1.4 tomorrow):     ids 84–88  (5 flights, same routes as +0d morning departures)
--     QM101=84(SIN 08:00), QM201=85(HKG 07:30), QM401=86(KUL 06:15), QM501=87(CGK 08:00), QM601=88(MNL 07:00)
--   flights (+2d,  ×1.3 day-after):   ids 89–93  (5 flights, same routes)
--     QM101=89(SIN 08:00), QM201=90(HKG 07:30), QM401=91(KUL 06:15), QM501=92(CGK 08:00), QM601=93(MNL 07:00)
--   flights (+3d,  ×1.2 this-week):    ids 94–98
--     QM101=94(SIN), QM201=95(HKG), QM401=96(KUL), QM501=97(CGK), QM601=98(MNL)
--   flights (+7d to +13d, ×1.1 next-week): ids 49–83  (5 flights/day × 7 days)
--     each day: QM101(SIN 08:00), QM201(HKG 07:30), QM401(KUL 06:15), QM501(CGK 08:00), QM601(MNL 07:00)
--   flights (+14d, ×1.0 standard):     ids 11–22  ← booking-test flights
--     QM101=11, QM102=12, SC201=13, QM201=14, QM301=15, QM999=16(SOLD OUT),
--     QM401=17, QM402=18(nearly full), QM501=19, QM601=20,
--     QM103=21(+15d), QM202=22(+15d)
--   flights (+35d, ×0.85 next-month):  ids 23–28
--     QM101=23, QM102=24, QM201=25, QM301=26, QM401=27, QM501=28
--   flights (+65d, ×0.75 2-months):    ids 29–33
--     QM101=29, QM201=30, QM401=31, QM501=32, QM601=33
--   flights (+95d, ×0.65 3-months):    ids 34–38
--     QM101=34, QM201=35, QM301=36, QM401=37, QM601=38
--
--   ── Return flights (X→BKK, mirrors outbound tiers) ──
--   flights (+0d,  ×1.5 today):        ids 84–89
--   flights (+1d,  ×1.4 tomorrow):     ids 90–95
--   flights (+3d,  ×1.2 this-week):    ids 96–101
--   flights (+7d,  ×1.1 next-week):    ids 102–107
--   flights (+14d, ×1.0 next-2-weeks): ids 108–113
--   flights (+35d, ×0.85 next-month):  ids 114–119
--   flights (+95d, ×0.65 next-3-months): ids 120–125
--   each tier: QM110(SIN→BKK), QM210(HKG→BKK), QM310(NRT→BKK),
--              QM410(KUL→BKK), QM510(CGK→BKK), QM610(MNL→BKK)
--
--   passengers      : Seed=1, Wanchai=2, Narumon=3, Akira=4, Ahmad=5
--   bookings        : SEED01=1 (CONFIRMED), SEED02=2 (PENDING),
--                     MNKP23=3 (CONFIRMED), AKVWQ4=4 (CONFIRMED),
--                     NRPQ56=5 (PENDING+FAILED), FMXB89=6 (PENDING)
--
-- ── Flights by route (standard +14d window) ──────────────────────────────────
--   BKK → SIN  :  QM101 (id=11), QM102 (id=12), SC201 (id=13), QM999 (id=16, SOLD OUT), QM103 (id=21, +15d)
--   BKK → HKG  :  QM201 (id=14), QM202 (id=22, +15d)
--   BKK → NRT  :  QM301 (id=15, overnight)
--   BKK → KUL  :  QM401 (id=17), QM402 (id=18, nearly full 12 seats)
--   BKK → CGK  :  QM501 (id=19)
--   BKK → MNL  :  QM601 (id=20)
--
-- ── Pre-seeded test bookings (use in integration / contract tests) ─────────────
--   SEED01  flight=QM101(id=11)  status=CONFIRMED  → use for duplicate-payment guard (409 ALREADY_PAID)
--   SEED02  flight=QM101(id=11)  status=PENDING    → use for GetByRef read tests and payment flow tests
--   MNKP23  flight=QM401(id=17)  status=CONFIRMED  → use for multi-route confirmed booking reads
--   AKVWQ4  flight=QM501(id=19)  status=CONFIRMED  → use for CGK route confirmed booking reads
--   NRPQ56  flight=QM401(id=17)  status=PENDING    → use for payment retry test (has a FAILED attempt)
--   FMXB89  flight=QM601(id=20)  status=PENDING    → use for first-charge flow (no prior payment)
--   QM999(id=16)  available_seats=0  → use for no-seats-available (409 NO_SEATS_AVAILABLE)
--   QM402(id=18)  available_seats=12 → use for low-seats / nearly-full scenario

-- ── Aircraft types ────────────────────────────────────────────────────────────
INSERT INTO aircraft_types (code, name, total_seats) VALUES
    ('A320', 'Airbus A320',        180),
    ('B777', 'Boeing 777-300ER',   396),
    ('A330', 'Airbus A330-300',    295),
    ('B737', 'Boeing 737-800',     162);

-- ── Routes (outbound) ─────────────────────────────────────────────────────────
INSERT INTO routes (origin_iata, destination_iata, distance_km) VALUES
    ('BKK', 'SIN', 1435),   -- id=1
    ('BKK', 'HKG', 1701),   -- id=2
    ('BKK', 'NRT', 4609),   -- id=3
    ('BKK', 'KUL', 1160),   -- id=4
    ('BKK', 'CGK', 2315),   -- id=5  Jakarta
    ('BKK', 'MNL', 2159);   -- id=6  Manila

-- ── Routes (return — for round-trip search: X→BKK) ───────────────────────────
INSERT INTO routes (origin_iata, destination_iata, distance_km) VALUES
    ('SIN', 'BKK', 1435),   -- id=7
    ('HKG', 'BKK', 1701),   -- id=8
    ('NRT', 'BKK', 4609),   -- id=9
    ('KUL', 'BKK', 1160),   -- id=10
    ('CGK', 'BKK', 2315),   -- id=11  Jakarta
    ('MNL', 'BKK', 2159);   -- id=12  Manila

-- ── Flights ───────────────────────────────────────────────────────────────────
-- Departure timezone:  BKK = UTC+7, SIN = UTC+8, HKG = UTC+8, NRT = UTC+9
-- KUL/MNL/HKG = UTC+8, CGK = UTC+7
-- Duration (UTC):
--   QM101 / QM102 / SC201 / QM999 : BKK→SIN  150 min
--   QM201 / QM202                  : BKK→HKG  150 min
--   QM301                          : BKK→NRT  365 min (overnight, arrives next day)
--   BKK→KUL 120 min, BKK→CGK 210 min, BKK→MNL 240 min
--
-- All departure/arrival times are dynamic: CURRENT_DATE + INTERVAL 'N days'
-- Tiers: +0d ×1.5 last-minute | +3d ×1.2 this-week | +14d ×1.0 standard (booking-test)
--        +35d ×0.85 next-month | +65d ×0.75 2-months | +95d ×0.65 3-months
--
-- available_seats is the authoritative counter for flight search.
-- Decrement it (with SELECT FOR UPDATE) inside the same transaction as
-- INSERT INTO bookings to prevent overbooking.
-- Note: QM101(id=11) available_seats=154 — 2 are held by pre-seeded bookings SEED01 and SEED02.
INSERT INTO flights
    (flight_number, route_id, aircraft_type_id, departure_time, arrival_time, base_price_minor, currency, available_seats)
VALUES
-- ── +0d  last-minute  ×1.5 ───────────────────────────────────────────────────
    ('QM101',   1,     1,    (CURRENT_DATE || ' 08:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 11:30:00 +08')::TIMESTAMPTZ,   525000, 'THB',   45),  -- id=1   ×1.5 → 5250.00 THB  BKK→SIN
    ('QM201',   2,     2,    (CURRENT_DATE || ' 07:30:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   675000, 'THB',   89),  -- id=2   ×1.5 → 6750.00 THB  BKK→HKG
    ('QM401',   4,     1,    (CURRENT_DATE || ' 06:15:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 09:15:00 +08')::TIMESTAMPTZ,   193500, 'THB',   32),  -- id=3   ×1.5 → 1935.00 THB  BKK→KUL
    ('QM501',   5,     3,    (CURRENT_DATE || ' 08:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 11:30:00 +07')::TIMESTAMPTZ,   433500, 'THB',   67),  -- id=4   ×1.5 → 4335.00 THB  BKK→CGK
    ('QM601',   6,     2,    (CURRENT_DATE || ' 07:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   480000, 'THB',  120),  -- id=5   ×1.5 → 4800.00 THB  BKK→MNL
-- ── +3d  this-week    ×1.2 ───────────────────────────────────────────────────
    ('QM101',   1,     1,    ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 11:30:00 +08')::TIMESTAMPTZ,   420000, 'THB',   98),  -- id=6   ×1.2 → 4200.00 THB  BKK→SIN
    ('QM201',   2,     2,    ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   540000, 'THB',  145),  -- id=7   ×1.2 → 5400.00 THB  BKK→HKG
    ('QM401',   4,     1,    ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 09:15:00 +08')::TIMESTAMPTZ,   154800, 'THB',   87),  -- id=8   ×1.2 → 1548.00 THB  BKK→KUL
    ('QM501',   5,     3,    ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 11:30:00 +07')::TIMESTAMPTZ,   346800, 'THB',  134),  -- id=9   ×1.2 → 3468.00 THB  BKK→CGK
    ('QM601',   6,     2,    ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '3 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   384000, 'THB',  167),  -- id=10  ×1.2 → 3840.00 THB  BKK→MNL
-- ── +14d standard ×1.0 — booking-test flights ────────────────────────────────
    ('QM101',   1,     1,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 11:30:00 +08')::TIMESTAMPTZ,   350000, 'THB',  154),  -- id=11  3500.00 THB  BKK→SIN  (SEED01, SEED02 pre-booked)
    ('QM102',   1,     1,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 14:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 17:30:00 +08')::TIMESTAMPTZ,   280000, 'THB',   30),  -- id=12  2800.00 THB  BKK→SIN  afternoon
    ('SC201',   1,     1,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 10:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 13:30:00 +08')::TIMESTAMPTZ,   220000, 'THB',   78),  -- id=13  2200.00 THB  BKK→SIN  midday
    ('QM201',   2,     2,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   450000, 'THB',  200),  -- id=14  4500.00 THB  BKK→HKG
    ('QM301',   3,     2,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 23:55:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '15 days')::DATE || ' 08:00:00 +09')::TIMESTAMPTZ,   980000, 'THB',  150),  -- id=15  9800.00 THB  BKK→NRT  overnight
    ('QM999',   1,     1,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 22:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '15 days')::DATE || ' 01:30:00 +08')::TIMESTAMPTZ,   350000, 'THB',    0),  -- id=16  3500.00 THB  BKK→SIN  SOLD OUT
    ('QM401',   4,     1,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 09:15:00 +08')::TIMESTAMPTZ,   129000, 'THB',  138),  -- id=17  1290.00 THB  BKK→KUL  morning  (MNKP23, NRPQ56 pre-booked)
    ('QM402',   4,     4,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 17:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 20:30:00 +08')::TIMESTAMPTZ,   185000, 'THB',   12),  -- id=18  1850.00 THB  BKK→KUL  evening  nearly full
    ('QM501',   5,     3,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 11:30:00 +07')::TIMESTAMPTZ,   289000, 'THB',  179),  -- id=19  2890.00 THB  BKK→CGK  (AKVWQ4 pre-booked)
    ('QM601',   6,     2,    ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '14 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   320000, 'THB',  249),  -- id=20  3200.00 THB  BKK→MNL  (FMXB89 pre-booked)
    ('QM103',   1,     1,    ((CURRENT_DATE + INTERVAL '15 days')::DATE || ' 09:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '15 days')::DATE || ' 12:30:00 +08')::TIMESTAMPTZ,   310000, 'THB',  160),  -- id=21  3100.00 THB  BKK→SIN  +15d
    ('QM202',   2,     2,    ((CURRENT_DATE + INTERVAL '15 days')::DATE || ' 11:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '15 days')::DATE || ' 14:30:00 +08')::TIMESTAMPTZ,   490000, 'THB',  200),  -- id=22  4900.00 THB  BKK→HKG  +15d
-- ── +35d next-month  ×0.85 ───────────────────────────────────────────────────
    ('QM101',   1,     1,    ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 11:30:00 +08')::TIMESTAMPTZ,   297500, 'THB',  168),  -- id=23  ×0.85 → 2975.00 THB  BKK→SIN
    ('QM102',   1,     1,    ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 14:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 17:30:00 +08')::TIMESTAMPTZ,   238000, 'THB',  155),  -- id=24  ×0.85 → 2380.00 THB  BKK→SIN  afternoon
    ('QM201',   2,     2,    ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   382500, 'THB',  220),  -- id=25  ×0.85 → 3825.00 THB  BKK→HKG
    ('QM301',   3,     2,    ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 23:55:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '36 days')::DATE || ' 08:00:00 +09')::TIMESTAMPTZ,   833000, 'THB',  189),  -- id=26  ×0.85 → 8330.00 THB  BKK→NRT  overnight
    ('QM401',   4,     1,    ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 09:15:00 +08')::TIMESTAMPTZ,   109650, 'THB',  158),  -- id=27  ×0.85 → 1096.50 THB  BKK→KUL
    ('QM501',   5,     3,    ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '35 days')::DATE || ' 11:30:00 +07')::TIMESTAMPTZ,   245650, 'THB',  235),  -- id=28  ×0.85 → 2456.50 THB  BKK→CGK
-- ── +65d 2-months    ×0.75 ───────────────────────────────────────────────────
    ('QM101',   1,     1,    ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 11:30:00 +08')::TIMESTAMPTZ,   262500, 'THB',  175),  -- id=29  ×0.75 → 2625.00 THB  BKK→SIN
    ('QM201',   2,     2,    ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   337500, 'THB',  230),  -- id=30  ×0.75 → 3375.00 THB  BKK→HKG
    ('QM401',   4,     1,    ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 09:15:00 +08')::TIMESTAMPTZ,    96750, 'THB',  162),  -- id=31  ×0.75 →  967.50 THB  BKK→KUL
    ('QM501',   5,     3,    ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 11:30:00 +07')::TIMESTAMPTZ,   216750, 'THB',  248),  -- id=32  ×0.75 → 2167.50 THB  BKK→CGK
    ('QM601',   6,     2,    ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '65 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   240000, 'THB',  280),  -- id=33  ×0.75 → 2400.00 THB  BKK→MNL
-- ── +95d 3-months    ×0.65 ───────────────────────────────────────────────────
    ('QM101',   1,     1,    ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 11:30:00 +08')::TIMESTAMPTZ,   227500, 'THB',  178),  -- id=34  ×0.65 → 2275.00 THB  BKK→SIN
    ('QM201',   2,     2,    ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   292500, 'THB',  245),  -- id=35  ×0.65 → 2925.00 THB  BKK→HKG
    ('QM301',   3,     2,    ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 23:55:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '96 days')::DATE || ' 08:00:00 +09')::TIMESTAMPTZ,   637000, 'THB',  210),  -- id=36  ×0.65 → 6370.00 THB  BKK→NRT  overnight
    ('QM401',   4,     1,    ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 09:15:00 +08')::TIMESTAMPTZ,    83850, 'THB',  168),  -- id=37  ×0.65 →  838.50 THB  BKK→KUL
    ('QM601',   6,     2,    ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '95 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   208000, 'THB',  300),  -- id=38  ×0.65 → 2080.00 THB  BKK→MNL
-- ── +0d  last-minute  ×1.5 (additional — spread through the day) ─────────────
    ('QM102',   1,     1,    (CURRENT_DATE || ' 10:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 13:30:00 +08')::TIMESTAMPTZ,   420000, 'THB',  115),  -- id=39  ×1.5 → 4200.00 THB  BKK→SIN  late-morning
    ('QM202',   2,     2,    (CURRENT_DATE || ' 12:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 15:30:00 +08')::TIMESTAMPTZ,   735000, 'THB',  170),  -- id=40  ×1.5 → 7350.00 THB  BKK→HKG  noon
    ('SC201',   1,     1,    (CURRENT_DATE || ' 14:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 17:30:00 +08')::TIMESTAMPTZ,   330000, 'THB',   88),  -- id=41  ×1.5 → 3300.00 THB  BKK→SIN  afternoon
    ('QM402',   4,     4,    (CURRENT_DATE || ' 13:30:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 16:30:00 +08')::TIMESTAMPTZ,   277500, 'THB',   65),  -- id=42  ×1.5 → 2775.00 THB  BKK→KUL  afternoon
    ('QM301',   3,     2,    (CURRENT_DATE || ' 16:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 00:05:00 +09')::TIMESTAMPTZ,  1470000, 'THB',   75),  -- id=43  ×1.5 → 14700.00 THB  BKK→NRT  overnight
    ('QM502',   5,     3,    (CURRENT_DATE || ' 17:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 20:30:00 +07')::TIMESTAMPTZ,   433500, 'THB',   95),  -- id=44  ×1.5 → 4335.00 THB  BKK→CGK  late-afternoon
    ('QM602',   6,     2,    (CURRENT_DATE || ' 19:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 00:00:00 +08')::TIMESTAMPTZ,   480000, 'THB',  130),  -- id=45  ×1.5 → 4800.00 THB  BKK→MNL  evening
    ('QM103',   1,     1,    (CURRENT_DATE || ' 21:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 00:30:00 +08')::TIMESTAMPTZ,   465000, 'THB',   55),  -- id=46  ×1.5 → 4650.00 THB  BKK→SIN  late-night
    ('QM203',   2,     2,    (CURRENT_DATE || ' 22:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 02:00:00 +08')::TIMESTAMPTZ,   735000, 'THB',   40),  -- id=47  ×1.5 → 7350.00 THB  BKK→HKG  late-night
    ('QM403',   4,     1,    (CURRENT_DATE || ' 23:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 02:00:00 +08')::TIMESTAMPTZ,   277500, 'THB',   30),  -- id=48  ×1.5 → 2775.00 THB  BKK→KUL  near-midnight
-- ── +7d to +13d  next-week  ×1.1  (5 flights/day × 7 days) ──────────────────
-- +7d
    ('QM101',  1, 1, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 11:30:00 +08')::TIMESTAMPTZ,  385000,'THB',145),  -- id=49
    ('QM201',  2, 2, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  495000,'THB',185),  -- id=50
    ('QM401',  4, 1, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 09:15:00 +08')::TIMESTAMPTZ,  141900,'THB',152),  -- id=51
    ('QM501',  5, 3, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 11:30:00 +07')::TIMESTAMPTZ,  317900,'THB',190),  -- id=52
    ('QM601',  6, 2, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  352000,'THB',238),  -- id=53
-- +8d
    ('QM101',  1, 1, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 11:30:00 +08')::TIMESTAMPTZ,  385000,'THB',148),  -- id=54
    ('QM201',  2, 2, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  495000,'THB',182),  -- id=55
    ('QM401',  4, 1, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 09:15:00 +08')::TIMESTAMPTZ,  141900,'THB',155),  -- id=56
    ('QM501',  5, 3, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 11:30:00 +07')::TIMESTAMPTZ,  317900,'THB',192),  -- id=57
    ('QM601',  6, 2, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '8 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  352000,'THB',235),  -- id=58
-- +9d
    ('QM101',  1, 1, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 11:30:00 +08')::TIMESTAMPTZ,  385000,'THB',143),  -- id=59
    ('QM201',  2, 2, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  495000,'THB',178),  -- id=60
    ('QM401',  4, 1, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 09:15:00 +08')::TIMESTAMPTZ,  141900,'THB',150),  -- id=61
    ('QM501',  5, 3, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 11:30:00 +07')::TIMESTAMPTZ,  317900,'THB',188),  -- id=62
    ('QM601',  6, 2, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '9 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  352000,'THB',230),  -- id=63
-- +10d
    ('QM101',  1, 1, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 11:30:00 +08')::TIMESTAMPTZ,  385000,'THB',140),  -- id=64
    ('QM201',  2, 2, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  495000,'THB',175),  -- id=65
    ('QM401',  4, 1, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 09:15:00 +08')::TIMESTAMPTZ,  141900,'THB',148),  -- id=66
    ('QM501',  5, 3, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 11:30:00 +07')::TIMESTAMPTZ,  317900,'THB',185),  -- id=67
    ('QM601',  6, 2, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '10 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  352000,'THB',228),  -- id=68
-- +11d
    ('QM101',  1, 1, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 11:30:00 +08')::TIMESTAMPTZ,  385000,'THB',138),  -- id=69
    ('QM201',  2, 2, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  495000,'THB',172),  -- id=70
    ('QM401',  4, 1, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 09:15:00 +08')::TIMESTAMPTZ,  141900,'THB',145),  -- id=71
    ('QM501',  5, 3, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 11:30:00 +07')::TIMESTAMPTZ,  317900,'THB',182),  -- id=72
    ('QM601',  6, 2, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '11 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  352000,'THB',225),  -- id=73
-- +12d
    ('QM101',  1, 1, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 11:30:00 +08')::TIMESTAMPTZ,  385000,'THB',136),  -- id=74
    ('QM201',  2, 2, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  495000,'THB',169),  -- id=75
    ('QM401',  4, 1, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 09:15:00 +08')::TIMESTAMPTZ,  141900,'THB',143),  -- id=76
    ('QM501',  5, 3, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 11:30:00 +07')::TIMESTAMPTZ,  317900,'THB',179),  -- id=77
    ('QM601',  6, 2, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '12 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  352000,'THB',222),  -- id=78
-- +13d
    ('QM101',  1, 1, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 11:30:00 +08')::TIMESTAMPTZ,  385000,'THB',133),  -- id=79
    ('QM201',  2, 2, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  495000,'THB',166),  -- id=80
    ('QM401',  4, 1, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 09:15:00 +08')::TIMESTAMPTZ,  141900,'THB',140),  -- id=81
    ('QM501',  5, 3, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 11:30:00 +07')::TIMESTAMPTZ,  317900,'THB',176),  -- id=82
    ('QM601',  6, 2, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '13 days')::DATE||' 11:00:00 +08')::TIMESTAMPTZ,  352000,'THB',220),  -- id=83
-- ── +1d  tomorrow     ×1.4 ───────────────────────────────────────────────────
    ('QM101',   1,     1,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 11:30:00 +08')::TIMESTAMPTZ,   490000, 'THB',   55),  -- id=84  ×1.4 → 4900.00 THB  BKK→SIN
    ('QM201',   2,     2,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   630000, 'THB',  100),  -- id=85  ×1.4 → 6300.00 THB  BKK→HKG
    ('QM401',   4,     1,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 09:15:00 +08')::TIMESTAMPTZ,   180600, 'THB',   40),  -- id=86  ×1.4 → 1806.00 THB  BKK→KUL
    ('QM501',   5,     3,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 11:30:00 +07')::TIMESTAMPTZ,   404600, 'THB',   75),  -- id=87  ×1.4 → 4046.00 THB  BKK→CGK
    ('QM601',   6,     2,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   448000, 'THB',  130),  -- ×1.4 → 4480.00 THB  BKK→MNL
    ('QM102',   1,     1,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 14:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 17:30:00 +08')::TIMESTAMPTZ,   392000, 'THB',   60),  -- ×1.4 → 3920.00 THB  BKK→SIN  afternoon
    ('QM202',   2,     2,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 12:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 15:30:00 +08')::TIMESTAMPTZ,   686000, 'THB',  110),  -- ×1.4 → 6860.00 THB  BKK→HKG  noon
    ('QM301',   3,     2,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 23:55:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 08:00:00 +09')::TIMESTAMPTZ,  1372000, 'THB',   80),  -- ×1.4 → 13720.00 THB BKK→NRT  overnight
    ('QM402',   4,     4,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 17:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 20:30:00 +08')::TIMESTAMPTZ,   259000, 'THB',   55),  -- ×1.4 → 2590.00 THB  BKK→KUL  evening
    ('SC201',   1,     1,    ((CURRENT_DATE + INTERVAL '1 day')::DATE || ' 21:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 00:30:00 +08')::TIMESTAMPTZ,   308000, 'THB',   70),  -- ×1.4 → 3080.00 THB  BKK→SIN  late-night
-- ── +2d  day-after    ×1.3 ───────────────────────────────────────────────────
    ('QM101',   1,     1,    ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 11:30:00 +08')::TIMESTAMPTZ,   455000, 'THB',   65),  -- id=89  ×1.3 → 4550.00 THB  BKK→SIN
    ('QM201',   2,     2,    ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 07:30:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   585000, 'THB',  120),  -- id=90  ×1.3 → 5850.00 THB  BKK→HKG
    ('QM401',   4,     1,    ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 06:15:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 09:15:00 +08')::TIMESTAMPTZ,   167700, 'THB',   50),  -- id=91  ×1.3 → 1677.00 THB  BKK→KUL
    ('QM501',   5,     3,    ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 08:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 11:30:00 +07')::TIMESTAMPTZ,   375700, 'THB',   85),  -- id=92  ×1.3 → 3757.00 THB  BKK→CGK
    ('QM601',   6,     2,    ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 07:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE + INTERVAL '2 days')::DATE || ' 11:00:00 +08')::TIMESTAMPTZ,   416000, 'THB',  140);  -- id=93  ×1.3 → 4160.00 THB  BKK→MNL

-- ── Return flights (X→BKK) — same tiering pattern as outbound, for round-trip search ──
-- Durations mirror the outbound leg: SIN/HKG 150min, NRT 365min, KUL 120min, CGK 210min, MNL 240min
INSERT INTO flights
    (flight_number, route_id, aircraft_type_id, departure_time, arrival_time, base_price_minor, currency, available_seats)
VALUES
-- ── +0d  today        ×1.5 ───────────────────────────────────────────────────
    ('QM110',   7,     1,    (CURRENT_DATE || ' 13:00:00 +08')::TIMESTAMPTZ, (CURRENT_DATE || ' 15:30:00 +07')::TIMESTAMPTZ,   525000, 'THB',   50),  -- id=84  ×1.5 → 5250.00 THB  SIN→BKK
    ('QM210',   8,     2,    (CURRENT_DATE || ' 13:00:00 +08')::TIMESTAMPTZ, (CURRENT_DATE || ' 14:30:00 +07')::TIMESTAMPTZ,   675000, 'THB',   90),  -- id=85  ×1.5 → 6750.00 THB  HKG→BKK
    ('QM310',   9,     2,    (CURRENT_DATE || ' 10:00:00 +09')::TIMESTAMPTZ, (CURRENT_DATE || ' 14:05:00 +07')::TIMESTAMPTZ,  1470000, 'THB',   75),  -- id=86  ×1.5 → 14700.00 THB NRT→BKK
    ('QM410',  10,     1,    (CURRENT_DATE || ' 14:00:00 +08')::TIMESTAMPTZ, (CURRENT_DATE || ' 15:00:00 +07')::TIMESTAMPTZ,   193500, 'THB',   35),  -- id=87  ×1.5 → 1935.00 THB  KUL→BKK
    ('QM510',  11,     3,    (CURRENT_DATE || ' 13:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 16:30:00 +07')::TIMESTAMPTZ,   433500, 'THB',   70),  -- id=88  ×1.5 → 4335.00 THB  CGK→BKK
    ('QM610',  12,     2,    (CURRENT_DATE || ' 13:00:00 +08')::TIMESTAMPTZ, (CURRENT_DATE || ' 16:00:00 +07')::TIMESTAMPTZ,   480000, 'THB',  120),  -- ×1.5 → 4800.00 THB  MNL→BKK
    ('QM112',   7,     1,    (CURRENT_DATE || ' 19:00:00 +08')::TIMESTAMPTZ, (CURRENT_DATE || ' 21:30:00 +07')::TIMESTAMPTZ,   525000, 'THB',   55),  -- ×1.5 → 5250.00 THB  SIN→BKK  evening
    ('QM212',   8,     2,    (CURRENT_DATE || ' 19:00:00 +08')::TIMESTAMPTZ, (CURRENT_DATE || ' 20:30:00 +07')::TIMESTAMPTZ,   675000, 'THB',   85),  -- ×1.5 → 6750.00 THB  HKG→BKK  evening
    ('QM412',  10,     1,    (CURRENT_DATE || ' 19:00:00 +08')::TIMESTAMPTZ, (CURRENT_DATE || ' 20:00:00 +07')::TIMESTAMPTZ,   193500, 'THB',   40),  -- ×1.5 → 1935.00 THB  KUL→BKK  evening
    ('QM512',  11,     3,    (CURRENT_DATE || ' 18:00:00 +07')::TIMESTAMPTZ, (CURRENT_DATE || ' 21:30:00 +07')::TIMESTAMPTZ,   433500, 'THB',   65),  -- ×1.5 → 4335.00 THB  CGK→BKK  evening
-- ── +1d  tomorrow     ×1.4 ───────────────────────────────────────────────────
    ('QM110',   7,     1,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 15:30:00 +07')::TIMESTAMPTZ,   490000, 'THB',   60),  -- ×1.4 → 4900.00 THB  SIN→BKK
    ('QM210',   8,     2,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 14:30:00 +07')::TIMESTAMPTZ,   630000, 'THB',  110),  -- id=91  ×1.4 → 6300.00 THB  HKG→BKK
    ('QM310',   9,     2,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 10:00:00 +09')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 14:05:00 +07')::TIMESTAMPTZ,  1372000, 'THB',   90),  -- id=92  ×1.4 → 13720.00 THB NRT→BKK
    ('QM410',  10,     1,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 14:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 15:00:00 +07')::TIMESTAMPTZ,   180600, 'THB',   45),  -- id=93  ×1.4 → 1806.00 THB  KUL→BKK
    ('QM510',  11,     3,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 13:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 16:30:00 +07')::TIMESTAMPTZ,   404600, 'THB',   85),  -- id=94  ×1.4 → 4046.00 THB  CGK→BKK
    ('QM610',  12,     2,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 16:00:00 +07')::TIMESTAMPTZ,   448000, 'THB',  135),  -- ×1.4 → 4480.00 THB  MNL→BKK
    ('QM112',   7,     1,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 19:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 21:30:00 +07')::TIMESTAMPTZ,   490000, 'THB',   60),  -- ×1.4 → 4900.00 THB  SIN→BKK  evening
    ('QM212',   8,     2,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 19:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 20:30:00 +07')::TIMESTAMPTZ,   630000, 'THB',  105),  -- ×1.4 → 6300.00 THB  HKG→BKK  evening
    ('QM412',  10,     1,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 19:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 20:00:00 +07')::TIMESTAMPTZ,   180600, 'THB',   50),  -- ×1.4 → 1806.00 THB  KUL→BKK  evening
    ('QM512',  11,     3,    ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 18:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '1 day')::DATE||' 21:30:00 +07')::TIMESTAMPTZ,   404600, 'THB',   80),  -- ×1.4 → 4046.00 THB  CGK→BKK  evening
-- ── +3d  this-week    ×1.2 ───────────────────────────────────────────────────
    ('QM110',   7,     1,    ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 15:30:00 +07')::TIMESTAMPTZ,   420000, 'THB',   95),  -- id=96  ×1.2 → 4200.00 THB  SIN→BKK
    ('QM210',   8,     2,    ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 14:30:00 +07')::TIMESTAMPTZ,   540000, 'THB',  145),  -- id=97  ×1.2 → 5400.00 THB  HKG→BKK
    ('QM310',   9,     2,    ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 10:00:00 +09')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 14:05:00 +07')::TIMESTAMPTZ,  1176000, 'THB',  130),  -- id=98  ×1.2 → 11760.00 THB NRT→BKK
    ('QM410',  10,     1,    ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 14:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 15:00:00 +07')::TIMESTAMPTZ,   154800, 'THB',   85),  -- id=99  ×1.2 → 1548.00 THB  KUL→BKK
    ('QM510',  11,     3,    ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 13:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 16:30:00 +07')::TIMESTAMPTZ,   346800, 'THB',  130),  -- id=100 ×1.2 → 3468.00 THB  CGK→BKK
    ('QM610',  12,     2,    ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '3 days')::DATE||' 16:00:00 +07')::TIMESTAMPTZ,   384000, 'THB',  165),  -- id=101 ×1.2 → 3840.00 THB  MNL→BKK
-- ── +7d  next-week    ×1.1 ───────────────────────────────────────────────────
    ('QM110',   7,     1,    ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 15:30:00 +07')::TIMESTAMPTZ,   385000, 'THB',  140),  -- id=102 ×1.1 → 3850.00 THB  SIN→BKK
    ('QM210',   8,     2,    ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 14:30:00 +07')::TIMESTAMPTZ,   495000, 'THB',  180),  -- id=103 ×1.1 → 4950.00 THB  HKG→BKK
    ('QM310',   9,     2,    ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 10:00:00 +09')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 14:05:00 +07')::TIMESTAMPTZ,  1078000, 'THB',  160),  -- id=104 ×1.1 → 10780.00 THB NRT→BKK
    ('QM410',  10,     1,    ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 14:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 15:00:00 +07')::TIMESTAMPTZ,   141900, 'THB',  145),  -- id=105 ×1.1 → 1419.00 THB  KUL→BKK
    ('QM510',  11,     3,    ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 13:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 16:30:00 +07')::TIMESTAMPTZ,   317900, 'THB',  185),  -- id=106 ×1.1 → 3179.00 THB  CGK→BKK
    ('QM610',  12,     2,    ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '7 days')::DATE||' 16:00:00 +07')::TIMESTAMPTZ,   352000, 'THB',  230),  -- id=107 ×1.1 → 3520.00 THB  MNL→BKK
-- ── +14d next-2-weeks ×1.0 ───────────────────────────────────────────────────
    ('QM110',   7,     1,    ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 15:30:00 +07')::TIMESTAMPTZ,   350000, 'THB',  150),  -- id=108 3500.00 THB  SIN→BKK
    ('QM210',   8,     2,    ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 14:30:00 +07')::TIMESTAMPTZ,   450000, 'THB',  195),  -- id=109 4500.00 THB  HKG→BKK
    ('QM310',   9,     2,    ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 10:00:00 +09')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 14:05:00 +07')::TIMESTAMPTZ,   980000, 'THB',  145),  -- id=110 9800.00 THB  NRT→BKK
    ('QM410',  10,     1,    ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 14:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 15:00:00 +07')::TIMESTAMPTZ,   129000, 'THB',  135),  -- id=111 1290.00 THB  KUL→BKK
    ('QM510',  11,     3,    ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 13:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 16:30:00 +07')::TIMESTAMPTZ,   289000, 'THB',  175),  -- id=112 2890.00 THB  CGK→BKK
    ('QM610',  12,     2,    ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '14 days')::DATE||' 16:00:00 +07')::TIMESTAMPTZ,   320000, 'THB',  245),  -- id=113 3200.00 THB  MNL→BKK
-- ── +35d next-month   ×0.85 ──────────────────────────────────────────────────
    ('QM110',   7,     1,    ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 15:30:00 +07')::TIMESTAMPTZ,   297500, 'THB',  165),  -- id=114 ×0.85 → 2975.00 THB  SIN→BKK
    ('QM210',   8,     2,    ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 14:30:00 +07')::TIMESTAMPTZ,   382500, 'THB',  215),  -- id=115 ×0.85 → 3825.00 THB  HKG→BKK
    ('QM310',   9,     2,    ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 10:00:00 +09')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 14:05:00 +07')::TIMESTAMPTZ,   833000, 'THB',  185),  -- id=116 ×0.85 → 8330.00 THB  NRT→BKK
    ('QM410',  10,     1,    ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 14:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 15:00:00 +07')::TIMESTAMPTZ,   109650, 'THB',  155),  -- id=117 ×0.85 → 1096.50 THB  KUL→BKK
    ('QM510',  11,     3,    ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 13:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 16:30:00 +07')::TIMESTAMPTZ,   245650, 'THB',  230),  -- id=118 ×0.85 → 2456.50 THB  CGK→BKK
    ('QM610',  12,     2,    ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '35 days')::DATE||' 16:00:00 +07')::TIMESTAMPTZ,   272000, 'THB',  275),  -- id=119 ×0.85 → 2720.00 THB  MNL→BKK
-- ── +95d next-3-months ×0.65 ─────────────────────────────────────────────────
    ('QM110',   7,     1,    ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 15:30:00 +07')::TIMESTAMPTZ,   227500, 'THB',  175),  -- id=120 ×0.65 → 2275.00 THB  SIN→BKK
    ('QM210',   8,     2,    ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 14:30:00 +07')::TIMESTAMPTZ,   292500, 'THB',  240),  -- id=121 ×0.65 → 2925.00 THB  HKG→BKK
    ('QM310',   9,     2,    ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 10:00:00 +09')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 14:05:00 +07')::TIMESTAMPTZ,   637000, 'THB',  205),  -- id=122 ×0.65 → 6370.00 THB  NRT→BKK
    ('QM410',  10,     1,    ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 14:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 15:00:00 +07')::TIMESTAMPTZ,    83850, 'THB',  165),  -- id=123 ×0.65 →  838.50 THB  KUL→BKK
    ('QM510',  11,     3,    ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 13:00:00 +07')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 16:30:00 +07')::TIMESTAMPTZ,   187850, 'THB',  245),  -- id=124 ×0.65 → 1878.50 THB  CGK→BKK
    ('QM610',  12,     2,    ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 13:00:00 +08')::TIMESTAMPTZ, ((CURRENT_DATE+INTERVAL '95 days')::DATE||' 16:00:00 +07')::TIMESTAMPTZ,   208000, 'THB',  295);  -- id=125 ×0.65 → 2080.00 THB  MNL→BKK

-- ── Fill +0d, +1d, +2d to 10 flights per route (outbound + return) ───────────
-- Generates flights at 10 departure times spread across the day.
-- ON CONFLICT DO NOTHING preserves manually-seeded flights above.
DO $$
DECLARE
    v_route   RECORD;
    v_day     INT;
    v_idx     INT;
    v_mult    NUMERIC;
    v_dep     TIMESTAMPTZ;
    v_arr     TIMESTAMPTZ;
    v_fn      TEXT;
    v_price   BIGINT;
    v_seats   INT;
    v_hours   INT[] := ARRAY[6, 7, 9, 10, 12, 14, 16, 18, 20, 22];
    v_mins    INT[] := ARRAY[0, 30, 0, 30, 0, 0, 0, 0, 0, 0];
    v_rdigit  INT;
BEGIN
    FOR v_route IN
        SELECT * FROM (VALUES
            ( 1, 1, 7, 150, 350000),
            ( 2, 2, 7, 150, 450000),
            ( 3, 2, 7, 365, 980000),
            ( 4, 1, 7, 120, 129000),
            ( 5, 3, 7, 210, 289000),
            ( 6, 2, 7, 240, 320000),
            ( 7, 1, 8, 150, 350000),
            ( 8, 2, 8, 150, 450000),
            ( 9, 2, 9, 365, 980000),
            (10, 1, 8, 120, 129000),
            (11, 3, 7, 210, 289000),
            (12, 2, 8, 240, 320000)
        ) AS t(route_id, acft, dep_tz, dur_min, base_price)
    LOOP
        v_rdigit := ((v_route.route_id - 1) % 6) + 1;

        FOR v_day IN 0..2 LOOP
            v_mult := CASE v_day WHEN 0 THEN 1.5 WHEN 1 THEN 1.4 ELSE 1.3 END;

            FOR v_idx IN 1..10 LOOP
                IF v_route.route_id <= 6 THEN
                    v_fn := 'QM' || v_rdigit || LPAD(v_idx::TEXT, 2, '0');
                ELSE
                    v_fn := 'QM' || v_rdigit || LPAD((v_idx + 10)::TEXT, 2, '0');
                END IF;

                v_dep := ((CURRENT_DATE + v_day * INTERVAL '1 day')::DATE
                          || ' ' || LPAD(v_hours[v_idx]::TEXT, 2, '0')
                          || ':' || LPAD(v_mins[v_idx]::TEXT, 2, '0')
                          || ':00 +' || LPAD(v_route.dep_tz::TEXT, 2, '0'))::TIMESTAMPTZ;
                v_arr := v_dep + (v_route.dur_min * INTERVAL '1 minute');

                v_price := (v_route.base_price * v_mult)::BIGINT
                           + ((v_idx - 5) * (v_route.base_price / 100))::BIGINT;
                v_seats := 40 + (v_idx * 12) + (2 - v_day) * 10;

                INSERT INTO flights
                    (flight_number, route_id, aircraft_type_id,
                     departure_time, arrival_time,
                     base_price_minor, currency, available_seats)
                VALUES
                    (v_fn, v_route.route_id, v_route.acft,
                     v_dep, v_arr,
                     v_price, 'THB', v_seats)
                ON CONFLICT (flight_number, departure_time) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ── Seats for QM101 (flight id=11) ────────────────────────────────────────────
-- Rows 1–4   → BUSINESS  (4 rows × 6 cols = 24 seats)
-- Rows 5–30  → ECONOMY   (26 rows × 6 cols = 156 seats)
-- Seats for all other flights are not seeded — seat picker is out of scope.
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
            VALUES (11, r::TEXT || col, cls);
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
-- MNKP23: Wanchai / QM401(id=17) (BKK→KUL) / CONFIRMED
-- AKVWQ4: Akira   / QM501(id=19) (BKK→CGK) / CONFIRMED
-- NRPQ56: Narumon / QM401(id=17) (BKK→KUL) / PENDING — has a FAILED payment → use for retry-payment test
-- FMXB89: Ahmad   / QM601(id=20) (BKK→MNL) / PENDING — no payment yet → use for first-charge flow test
-- confirmed_payment_id is a logical cross-DB reference (no FK); wired via UPDATE below.
-- PENDING seed bookings get expires_at 1 hour in the future so the lazy-expiry
-- check (QML-042) does not immediately flip them to EXPIRED.
INSERT INTO bookings (booking_ref, flight_id, passenger_id, status, total_amount_minor, currency, expires_at, user_sub, created_at, updated_at)
VALUES
    ('SEED01', 11, 1, 'CONFIRMED', 350000, 'THB', NOW() - INTERVAL '10 days' + INTERVAL '15 minutes', 'seed-user-01', NOW() - INTERVAL '10 days',                          NOW() - INTERVAL '10 days' + INTERVAL '5 minutes'),  -- id=1  "3500.00" THB
    ('SEED02', 11, 1, 'PENDING',   350000, 'THB', NOW() + INTERVAL '1 hour',                          'seed-user-01', NOW() - INTERVAL '10 days',                          NOW() - INTERVAL '10 days'),                           -- id=2  "3500.00" THB
    ('MNKP23', 17, 2, 'CONFIRMED', 129000, 'THB', NOW() - INTERVAL '8 days'  + INTERVAL '15 minutes', 'seed-user-02', NOW() - INTERVAL '8 days',                           NOW() - INTERVAL '8 days'  + INTERVAL '5 minutes'),  -- id=3  "1290.00" THB
    ('AKVWQ4', 19, 4, 'CONFIRMED', 289000, 'THB', NOW() - INTERVAL '7 days'  + INTERVAL '15 minutes', 'seed-user-04', NOW() - INTERVAL '7 days',                           NOW() - INTERVAL '7 days'  + INTERVAL '5 minutes'),  -- id=4  "2890.00" THB
    ('NRPQ56', 17, 3, 'PENDING',   129000, 'THB', NOW() + INTERVAL '1 hour',                          'seed-user-03', NOW() - INTERVAL '6 days',                          NOW() - INTERVAL '6 days'),                            -- id=5  "1290.00" THB
    ('FMXB89', 20, 5, 'PENDING',   320000, 'THB', NOW() + INTERVAL '1 hour',                          'seed-user-05', NOW() - INTERVAL '5 days',                          NOW() - INTERVAL '5 days');                            -- id=6  "3200.00" THB

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
