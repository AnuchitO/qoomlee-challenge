#!/usr/bin/env bash
# Layer 3 — API Contract checks
# Verifies status codes, response shapes, and cross-service consistency
# Requires: docker compose up --build
# Usage:    ./scripts/contract/check-contracts.sh

set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"

header "Layer 3 — API Contract Checks"
require_stack

BOOKINGS_API="$QOOMLEE_SERVICE_URL"
PAYMENTS_API="$PAYMENT_SERVICE_URL"
DATE="2026-06-15"

# ─── 1. Error response envelope ───────────────────────────────────────────────
section "1. Error envelope — all 4xx responses must have { \"error\": \"...\" }"

resp=$(curl -s "$BOOKINGS_API/api/flights/search")
assert_jq "qoomlee-service: missing params returns 'error' key"    "$resp" '.error'

resp=$(curl -s -X POST "$BOOKINGS_API/api/bookings" -H "Content-Type: application/json" -d '{}')
assert_jq "qoomlee-service: empty body returns 'error' key"        "$resp" '.error'

resp=$(curl -s "$BOOKINGS_API/api/bookings/ZZZZZZ")
assert_jq "qoomlee-service: unknown PNR returns 'error' key"       "$resp" '.error'

resp=$(curl -s "$BOOKINGS_API/api/flights/99999")
assert_jq "qoomlee-service: unknown flight returns 'error' key"    "$resp" '.error'

resp=$(curl -s "$PAYMENTS_API/api/payments/ZZZZZZ")
assert_jq "payment-service: unknown PNR returns 'error' key"       "$resp" '.error'

# ─── 2. Status fields — UPPER_SNAKE_CASE ──────────────────────────────────────
section "2. Status values — must be UPPER_SNAKE_CASE (PENDING, CONFIRMED, SUCCEEDED, FAILED)"

FLIGHTS=$(curl -s "$BOOKINGS_API/api/flights/search?origin=BKK&destination=SIN&date=$DATE&passengers=1")
FLIGHT_STATUS=$(echo "$FLIGHTS" | jq -r '.flights[0].status // empty')
[[ "$FLIGHT_STATUS" =~ ^[A-Z][A-Z_]*$ ]] && \
  pass "flight status '$FLIGHT_STATUS' is UPPER_SNAKE_CASE" || \
  fail "flight status '$FLIGHT_STATUS' is NOT UPPER_SNAKE_CASE"

FLIGHT_ID=$(echo "$FLIGHTS" | jq -r '.flights[0].id')
AMOUNT_MINOR=$(echo "$FLIGHTS" | jq -r '.flights[0].basePriceMinor')

BOOKING=$(curl -s -X POST "$BOOKINGS_API/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{\"flightId\":$FLIGHT_ID,\"passenger\":{\"firstName\":\"Contract\",\"lastName\":\"Check\",\"email\":\"contract@test.com\"},\"totalAmountMinor\":$AMOUNT_MINOR,\"currency\":\"THB\"}")
BOOKING_STATUS=$(echo "$BOOKING" | jq -r '.status // empty')
[[ "$BOOKING_STATUS" =~ ^[A-Z][A-Z_]*$ ]] && \
  pass "booking status '$BOOKING_STATUS' is UPPER_SNAKE_CASE" || \
  fail "booking status '$BOOKING_STATUS' is NOT UPPER_SNAKE_CASE"

# ─── 3. Timestamp format — ISO 8601 ───────────────────────────────────────────
section "3. Timestamps — must be ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)"

DEP_TIME=$(echo "$FLIGHTS" | jq -r '.flights[0].departureTime // empty')
[[ "$DEP_TIME" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T ]] && \
  pass "flight departureTime '$DEP_TIME' is ISO 8601" || \
  fail "flight departureTime '$DEP_TIME' is NOT ISO 8601"

PNR=$(echo "$BOOKING" | jq -r '.bookingRef')
BOOKING_DETAIL=$(curl -s "$BOOKINGS_API/api/bookings/$PNR")
CREATED_AT=$(echo "$BOOKING_DETAIL" | jq -r '.createdAt // empty')
if [ -n "$CREATED_AT" ]; then
  [[ "$CREATED_AT" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T ]] && \
    pass "booking createdAt '$CREATED_AT' is ISO 8601" || \
    fail "booking createdAt '$CREATED_AT' is NOT ISO 8601"
else
  fail "qoomlee-service: createdAt field missing from GET /api/bookings/:pnr response"
fi

# ─── 4. Field naming — camelCase only ─────────────────────────────────────────
section "4. JSON field names — camelCase only (no snake_case keys)"

check_camelcase() {
  local service=$1 json=$2
  local snake_keys
  snake_keys=$(echo "$json" | jq -r '[.. | objects | keys[]] | unique | .[] | select(contains("_"))' 2>/dev/null | head -5)
  if [ -z "$snake_keys" ]; then
    pass "$service: all response keys are camelCase"
  else
    fail "$service: snake_case keys found — $(echo "$snake_keys" | tr '\n' ' ')"
  fi
}

check_camelcase "qoomlee-service search"  "$FLIGHTS"
check_camelcase "qoomlee-service detail"  "$(curl -s "$BOOKINGS_API/api/flights/$FLIGHT_ID")"
check_camelcase "qoomlee-service"         "$BOOKING_DETAIL"

# ─── 5. HTTP status codes ─────────────────────────────────────────────────────
section "5. HTTP status codes — semantically correct"

code=$(http_status POST "$BOOKINGS_API/api/bookings" \
  "{\"flightId\":$FLIGHT_ID,\"passenger\":{\"firstName\":\"SC\",\"lastName\":\"T\",\"email\":\"sc@t.com\"},\"totalAmountMinor\":$AMOUNT_MINOR,\"currency\":\"THB\"}")
assert_http "POST /api/bookings → 201 Created"                    "$code" "201"

code=$(http_status GET "$BOOKINGS_API/api/bookings/ZZZZZZ")
assert_http "GET /api/bookings/ZZZZZZ → 404"                     "$code" "404"

code=$(http_status GET "$BOOKINGS_API/api/flights/99999")
assert_http "GET /api/flights/99999 → 404"                       "$code" "404"

code=$(http_status GET "$BOOKINGS_API/api/flights/search")
assert_http "GET /api/flights/search (no params) → 400"          "$code" "400"

code=$(http_status POST "$BOOKINGS_API/api/bookings" '{"flightId":1}')
[ "$code" = "400" ] && \
  pass "POST /api/bookings missing passenger → 400" || \
  fail "POST /api/bookings missing passenger → $code (expected 400)"

# ─── 6. PNR format ────────────────────────────────────────────────────────────
section "6. PNR format — exactly 6 uppercase alphanumeric characters"

NEW_BOOKING=$(curl -s -X POST "$BOOKINGS_API/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{\"flightId\":$FLIGHT_ID,\"passenger\":{\"firstName\":\"PNR\",\"lastName\":\"Test\",\"email\":\"pnr@test.com\"},\"totalAmountMinor\":$AMOUNT_MINOR,\"currency\":\"THB\"}")
NEW_PNR=$(echo "$NEW_BOOKING" | jq -r '.bookingRef // empty')

[[ "$NEW_PNR" =~ ^[A-Z0-9]{6}$ ]] && \
  pass "PNR '$NEW_PNR' matches [A-Z0-9]{6}" || \
  fail "PNR '$NEW_PNR' does NOT match [A-Z0-9]{6}"

# ─── 7. Monetary triple — all money fields must include Minor + currency + display ──
section "7. Monetary fields — must include *Minor (int), currency (string), * (display string)"

FLIGHT_DETAIL=$(curl -s "$BOOKINGS_API/api/flights/$FLIGHT_ID")
assert_jq "Flight: basePriceMinor is an integer"  "$FLIGHT_DETAIL" '.basePriceMinor | type == "number"'
assert_jq "Flight: currency is a string"          "$FLIGHT_DETAIL" '.currency | type == "string"'
assert_jq "Flight: basePrice is a string"         "$FLIGHT_DETAIL" '.basePrice | type == "string"'

assert_jq "Booking: totalAmountMinor is an integer"  "$BOOKING_DETAIL" '.totalAmountMinor | type == "number"'
assert_jq "Booking: currency is a string"            "$BOOKING_DETAIL" '.currency | type == "string"'
assert_jq "Booking: totalAmount is a string"         "$BOOKING_DETAIL" '.totalAmount | type == "string"'

# ─── 8. Payment contracts ─────────────────────────────────────────────────────
section "8. Payment — success card, decline card, already-paid guard"

NEW_PNR2=$(echo "$NEW_BOOKING" | jq -r '.bookingRef')

# Success charge
CHARGE=$(curl -s -X POST "$PAYMENTS_API/api/payments/charge" \
  -H "Content-Type: application/json" \
  -d "{\"bookingRef\":\"$NEW_PNR2\",\"amountMinor\":$AMOUNT_MINOR,\"currency\":\"THB\",\"omiseToken\":\"tokn_test_4xs9408a642a1htto8z\"}")
assert_jq "Success charge: has omiseChargeId"    "$CHARGE" '.omiseChargeId'
assert_jq "Success charge: status is SUCCEEDED"  "$CHARGE" '.status == "SUCCEEDED"'
assert_jq "Success charge: amountMinor is integer" "$CHARGE" '.amountMinor | type == "number"'
assert_jq "Success charge: amount is string"     "$CHARGE" '.amount | type == "string"'

# Booking is CONFIRMED after successful payment
CONFIRMED=$(curl -s "$BOOKINGS_API/api/bookings/$NEW_PNR2")
assert_jq "Booking status is CONFIRMED after payment"  "$CONFIRMED" '.status == "CONFIRMED"'

# Duplicate charge → 409
code=$(http_status POST "$PAYMENTS_API/api/payments/charge" \
  "{\"bookingRef\":\"$NEW_PNR2\",\"amountMinor\":$AMOUNT_MINOR,\"currency\":\"THB\",\"omiseToken\":\"tokn_test_4xs9408a642a1htto8z\"}")
assert_http "Second charge on same booking → 409 ALREADY_PAID"  "$code" "409"

# Booking stays PENDING after failed charge (use PNR from earlier that was never paid)
AMOUNT_PNR=$(echo "$BOOKING" | jq -r '.bookingRef')
DECLINE_CODE=$(http_status POST "$PAYMENTS_API/api/payments/charge" \
  "{\"bookingRef\":\"$AMOUNT_PNR\",\"amountMinor\":$AMOUNT_MINOR,\"currency\":\"THB\",\"omiseToken\":\"tokn_test_declined_invalid\"}")
[ "$DECLINE_CODE" = "402" ] && \
  pass "Declined card returns 402"  || \
  fail "Declined card returned $DECLINE_CODE (expected 402)"

STILL_PENDING=$(curl -s "$BOOKINGS_API/api/bookings/$AMOUNT_PNR")
assert_jq "Booking stays PENDING after decline"  "$STILL_PENDING" '.status == "PENDING"'

# ─── Summary ──────────────────────────────────────────────────────────────────
summary
