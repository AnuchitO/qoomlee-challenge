#!/usr/bin/env bash
# Pillar 1 — Working Software smoke tests
# Requires: docker compose up --build
# Usage:    ./scripts/smoke/check-smoke.sh

set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"

header "Pillar 1 — Working Software Smoke Tests"
require_stack

DATE="2026-06-15"
BOOKINGS_API="$QOOMLEE_SERVICE_URL"
PAYMENTS_API="$PAYMENT_SERVICE_URL"

# ─── Flight Endpoints (served by qoomlee-service) ─────────────────────────────
section "Flight Endpoints (:8082)"

FLIGHTS=$(curl -s "$BOOKINGS_API/api/flights/search?origin=BKK&destination=SIN&date=$DATE&passengers=1")
assert_jq "GET /api/flights/search returns flights array"         "$FLIGHTS" '.flights'
assert_jq "GET /api/flights/search returns at least 1 result"    "$FLIGHTS" '.flights | length > 0'
assert_jq "Flight has required fields (id, flightNumber, basePriceMinor)" "$FLIGHTS" '.flights[0] | .id and .flightNumber and .basePriceMinor'

FLIGHT_ID=$(echo "$FLIGHTS" | jq -r '.flights[0].id')
AMOUNT_MINOR=$(echo "$FLIGHTS" | jq -r '.flights[0].basePriceMinor')

FLIGHT_DETAIL=$(curl -s "$BOOKINGS_API/api/flights/$FLIGHT_ID")
code=$(http_status GET "$BOOKINGS_API/api/flights/$FLIGHT_ID")
assert_http "GET /api/flights/:id returns 200"                   "$code" "200"
assert_jq  "GET /api/flights/:id has durationMinutes"           "$FLIGHT_DETAIL" '.durationMinutes'
assert_jq  "GET /api/flights/:id has origin and destination"    "$FLIGHT_DETAIL" '.origin and .destination'

code=$(http_status GET "$BOOKINGS_API/api/flights/99999")
assert_http "GET /api/flights/99999 returns 404"                 "$code" "404"

# ─── Booking Service ───────────────────────────────────────────────────────────
section "Booking Service"

BOOKING=$(curl -s -X POST "$BOOKINGS_API/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{
    \"flightId\": $FLIGHT_ID,
    \"passenger\": {
      \"firstName\": \"Smoke\",
      \"lastName\":  \"Test\",
      \"email\":     \"smoke@test.com\",
      \"passportNumber\": \"ST000001\"
    },
    \"totalAmountMinor\": $AMOUNT_MINOR,
    \"currency\": \"THB\"
  }")

assert_jq "POST /api/bookings returns bookingRef"  "$BOOKING" '.bookingRef'
assert_jq "POST /api/bookings returns bookingId"   "$BOOKING" '.bookingId'
assert_jq "POST /api/bookings status is PENDING"   "$BOOKING" '.status == "PENDING"'

PNR=$(echo "$BOOKING" | jq -r '.bookingRef')
BOOKING_ID=$(echo "$BOOKING" | jq -r '.bookingId')
assert_match "PNR is 6 uppercase alphanumeric chars" "$PNR" '^[A-Z0-9]{6}$'

code=$(http_status GET "$BOOKINGS_API/api/bookings/ZZZZZZ")
assert_http "GET /api/bookings/ZZZZZZ returns 404"  "$code" "404"

# ─── Payment Service ───────────────────────────────────────────────────────────
section "Payment Service"

# Note: tokn_test_4xs9408a642a1htto8z is Omise's public test success token
PAYMENT=$(curl -s -X POST "$PAYMENTS_API/api/payments/charge" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingRef\":   \"$PNR\",
    \"amountMinor\":  $AMOUNT_MINOR,
    \"currency\":     \"THB\",
    \"omiseToken\":   \"tokn_test_4xs9408a642a1htto8z\"
  }")

assert_jq "POST /api/payments/charge returns omiseChargeId"  "$PAYMENT" '.omiseChargeId'
assert_jq "POST /api/payments/charge status is SUCCEEDED"    "$PAYMENT" '.status == "SUCCEEDED"'

code=$(http_status GET "$PAYMENTS_API/api/payments/$PNR")
assert_http "GET /api/payments/:pnr returns 200"              "$code" "200"

code=$(http_status GET "$PAYMENTS_API/api/payments/ZZZZZZ")
assert_http "GET /api/payments/ZZZZZZ returns 404"            "$code" "404"

# ─── Booking confirmed after payment ──────────────────────────────────────────
section "Booking Status Update (payment-service → qoomlee-service)"

CONFIRMED=$(curl -s "$BOOKINGS_API/api/bookings/$PNR")
assert_jq "GET /api/bookings/:pnr after payment: status is CONFIRMED" \
  "$CONFIRMED" '.status == "CONFIRMED"'
assert_jq "GET /api/bookings/:pnr has flight object"    "$CONFIRMED" '.flight'
assert_jq "GET /api/bookings/:pnr has passenger object" "$CONFIRMED" '.passenger'

# ─── Summary ───────────────────────────────────────────────────────────────────
summary
