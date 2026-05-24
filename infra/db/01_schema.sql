-- Qoomlee Airline — Database Schema
-- Single PostgreSQL database shared across all services (challenge setup)
--
-- Key conventions:
--   • Monetary amounts in the `payments` table are stored in SATANG (int8).
--     1 THB = 100 satang.  3,500 THB → 350000.
--     All other price columns (flights.base_price, bookings.total_amount)
--     are stored in THB as NUMERIC(10,2).
--   • flights.available_seats is a denormalised counter.
--     Services must decrement it inside the same transaction as INSERT INTO bookings.
--   • bookings.updated_at has no trigger — services must set it explicitly
--     on every UPDATE.

-- ─────────────────────────────────────────
-- FLIGHT SERVICE domain
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
    flight_number     VARCHAR(10)    NOT NULL UNIQUE,
    route_id          INT            REFERENCES routes(id),
    aircraft_type_id  INT            REFERENCES aircraft_types(id),
    departure_time    TIMESTAMPTZ    NOT NULL,
    arrival_time      TIMESTAMPTZ    NOT NULL,
    status            VARCHAR(20)    NOT NULL DEFAULT 'SCHEDULED',
    base_price        NUMERIC(10,2)  NOT NULL,           -- THB
    currency          CHAR(3)        NOT NULL DEFAULT 'THB',
    available_seats   INT            NOT NULL            -- denormalised; decrement on booking
);

CREATE TABLE seats (
    id           SERIAL PRIMARY KEY,
    flight_id    INT         REFERENCES flights(id),
    seat_number  VARCHAR(5)  NOT NULL,
    class        VARCHAR(10) NOT NULL DEFAULT 'ECONOMY', -- ECONOMY | BUSINESS | FIRST
    status       VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    UNIQUE (flight_id, seat_number)
);

-- ─────────────────────────────────────────
-- BOOKING SERVICE domain
-- ─────────────────────────────────────────

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
    id            SERIAL PRIMARY KEY,
    booking_ref   VARCHAR(6)     NOT NULL UNIQUE,        -- 6-char PNR, e.g. QM7X2K
    flight_id     INT            REFERENCES flights(id),
    passenger_id  INT            REFERENCES passengers(id),
    seat_id       INT            REFERENCES seats(id),   -- NULL — seat picker out of scope
    status        VARCHAR(20)    NOT NULL DEFAULT 'PENDING', -- PENDING | CONFIRMED
    total_amount  NUMERIC(10,2)  NOT NULL,               -- THB
    currency      CHAR(3)        NOT NULL DEFAULT 'THB',
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()  -- set explicitly on UPDATE
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
-- PAYMENT SERVICE domain
-- ─────────────────────────────────────────

CREATE TABLE payments (
    id               SERIAL PRIMARY KEY,
    booking_ref      VARCHAR(6)     NOT NULL,
    booking_id       INT            REFERENCES bookings(id),
    amount           BIGINT         NOT NULL,            -- SATANG (1 THB = 100 satang)
    currency         CHAR(3)        NOT NULL DEFAULT 'THB',
    status           VARCHAR(20)    NOT NULL DEFAULT 'PENDING', -- PENDING | SUCCEEDED | FAILED
    omise_charge_id  VARCHAR(100),
    failure_code     VARCHAR(100),
    failure_message  TEXT,
    paid_at          TIMESTAMPTZ,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

CREATE INDEX idx_flights_departure     ON flights(departure_time);
CREATE INDEX idx_flights_route         ON flights(route_id);
CREATE INDEX idx_flights_status        ON flights(status);
CREATE INDEX idx_seats_flight          ON seats(flight_id, status);
CREATE INDEX idx_bookings_booking_ref  ON bookings(booking_ref);
CREATE INDEX idx_bookings_passenger    ON bookings(passenger_id);
CREATE INDEX idx_checkins_booking_ref  ON checkins(booking_ref);
CREATE INDEX idx_payments_booking_ref  ON payments(booking_ref);
CREATE INDEX idx_payments_status       ON payments(status);
CREATE INDEX idx_payments_omise_charge ON payments(omise_charge_id);
