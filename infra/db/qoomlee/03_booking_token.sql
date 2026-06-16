-- Migration: add booking_token to bookings
-- A client-generated UUID sent as ?bookingToken= on POST /api/bookings.
-- Prevents duplicate bookings when a user navigates back from the payment page
-- and clicks "Continue to Payment" again.
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS booking_token VARCHAR(36) UNIQUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_booking_token
    ON bookings(booking_token)
    WHERE booking_token IS NOT NULL;
