-- Migration: add return_flight_id to bookings
-- Stores the optional return leg for round-trip bookings on the same PNR.
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS return_flight_id INT REFERENCES flights(id);
