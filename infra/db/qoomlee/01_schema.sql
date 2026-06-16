-- Qoomlee Airline — Booking DB Schema  (qoomlee-service owns this database)
-- Database: postgres-qoomlee  (port 5433 on host)
--
-- Key conventions:
--   • ALL monetary amounts use a single canonical representation: BIGINT minor units (satang).
--     1 THB = 100 satang.  3,500 THB → 350000.
--     Column names use the _minor suffix: base_price_minor, total_amount_minor.
--     Conversion to/from major units (THB) happens ONLY at the API boundary (handler layer).
--     No NUMERIC/DECIMAL is used for any business-logic monetary column.
--   • Currency is stored as ISO 4217 CHAR(3) on every table that holds money.
--   • flights.available_seats is a denormalised counter.
--     Services must lock the row (SELECT … FOR UPDATE) and decrement inside the same
--     transaction as INSERT INTO bookings to prevent overbooking.
--   • bookings.updated_at has no trigger — services must set it explicitly
--     on every UPDATE.
--   • bookings.confirmed_payment_id is a logical cross-DB reference to payments.id
--     in the payment database.  There is NO foreign key constraint — enforcement
--     is at the application layer (payment-service calls PUT /api/bookings/:ref/status
--     with the payment id after a successful charge).

-- ─────────────────────────────────────────
-- FLIGHT + BOOKING domain  (same service, same ACID transaction boundary)
-- ─────────────────────────────────────────

CREATE TABLE aircraft_types (
    id           SERIAL PRIMARY KEY,
    code         VARCHAR(10)  NOT NULL UNIQUE,
    name         VARCHAR(100) NOT NULL,
    total_seats  INT          NOT NULL
);

CREATE TABLE routes (
    id                 SERIAL PRIMARY KEY,
    origin_iata        CHAR(3) NOT NULL,
    destination_iata   CHAR(3) NOT NULL,
    distance_km        INT,
    UNIQUE (origin_iata, destination_iata)
);

CREATE TABLE flights (
    id                SERIAL PRIMARY KEY,
    flight_number     VARCHAR(10)    NOT NULL,
    route_id          INT            REFERENCES routes(id),
    aircraft_type_id  INT            REFERENCES aircraft_types(id),
    departure_time    TIMESTAMPTZ    NOT NULL,
    arrival_time      TIMESTAMPTZ    NOT NULL,
    status            VARCHAR(20)    NOT NULL DEFAULT 'SCHEDULED',
    base_price_minor  BIGINT         NOT NULL,           -- minor units (satang); 3500 THB = 350000
    currency          CHAR(3)        NOT NULL DEFAULT 'THB', -- ISO 4217
    available_seats   INT            NOT NULL,           -- denormalised; decrement on booking
    UNIQUE (flight_number, departure_time)               -- same flight number runs on different dates
);

CREATE TABLE seats (
    id           SERIAL PRIMARY KEY,
    flight_id    INT         REFERENCES flights(id),
    seat_number  VARCHAR(5)  NOT NULL,
    class        VARCHAR(10) NOT NULL DEFAULT 'ECONOMY', -- ECONOMY | BUSINESS | FIRST
    status       VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    UNIQUE (flight_id, seat_number)
);

CREATE TABLE passengers (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    passport_number VARCHAR(30),
    date_of_birth   DATE,
    nationality     CHAR(2),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
    id                   SERIAL PRIMARY KEY,
    booking_ref          VARCHAR(6)     NOT NULL UNIQUE,        -- 6-char PNR, e.g. QM7X2K
    flight_id            INT            REFERENCES flights(id),
    passenger_id         INT            REFERENCES passengers(id),
    seat_id              INT            REFERENCES seats(id),   -- NULL — seat picker out of scope
    status               VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                             CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED')),
    confirmed_payment_id INT,                                   -- logical ref to payment DB; NO FK constraint
    payment_provider     VARCHAR(50),                           -- set when status→CONFIRMED (e.g. 'OMISE')
    provider_charge_id   VARCHAR(100),                          -- set when status→CONFIRMED (Omise charge ID)
    total_amount_minor   BIGINT         NOT NULL,               -- minor units (satang); must match payment.amount_minor
    currency             CHAR(3)        NOT NULL DEFAULT 'THB', -- ISO 4217
    expires_at           TIMESTAMPTZ    NOT NULL,               -- seat-hold deadline; PENDING past this is lazily EXPIRED on read
    user_sub             VARCHAR(255)   NOT NULL,               -- JWT sub of the passenger who created the booking
    booking_token        VARCHAR(36)    UNIQUE,                 -- client-supplied UUID; prevents duplicate bookings on back-navigation
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()  -- set explicitly on UPDATE
);

-- ─────────────────────────────────────────
-- CHECK-IN SERVICE domain  (out of scope for this challenge)
-- ─────────────────────────────────────────

CREATE TABLE checkins (
    id            SERIAL PRIMARY KEY,
    booking_id    INT         REFERENCES bookings(id) UNIQUE,
    booking_ref   VARCHAR(6)  NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    baggage_count INT         NOT NULL DEFAULT 0,
    checked_in_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE boarding_passes (
    id              SERIAL PRIMARY KEY,
    checkin_id      INT          REFERENCES checkins(id) UNIQUE,
    booking_ref     VARCHAR(6)   NOT NULL,
    flight_number   VARCHAR(10)  NOT NULL,
    passenger_name  VARCHAR(200) NOT NULL,
    seat_number     VARCHAR(5)   NOT NULL,
    gate            VARCHAR(10),
    boarding_time   TIMESTAMPTZ,
    barcode         VARCHAR(100) NOT NULL UNIQUE,
    issued_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

CREATE INDEX idx_flights_departure      ON flights(departure_time);
CREATE INDEX idx_flights_route          ON flights(route_id);
CREATE INDEX idx_flights_status         ON flights(status);
CREATE INDEX idx_seats_flight           ON seats(flight_id, status);
CREATE INDEX idx_bookings_booking_ref   ON bookings(booking_ref);
CREATE INDEX idx_bookings_passenger     ON bookings(passenger_id);
CREATE INDEX idx_checkins_booking_ref   ON checkins(booking_ref);
