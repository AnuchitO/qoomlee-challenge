# Qoomlee Airline — API Specifications

Services run on their own ports. Call them directly:
- qoomlee-service: `http://localhost:8082` (flight + booking endpoints)
- payment-service: `http://localhost:8084`

Internal service-to-service calls use the Docker Compose service name (e.g. `http://qoomlee-service:8082`).

> **Monetary convention:** All money is stored as BIGINT minor units (satang) in the database (`_minor` column suffix).
> 1 THB = 100 satang. 3,500 THB → stored as `350000`.
> Every monetary field in API requests and responses appears as a **triple**: `*Minor` (integer satang), `currency`, and `*` (string display value, e.g. `"3500.00"`).
> Example: `"basePriceMinor": 350000, "currency": "THB", "basePrice": "3500.00"`.
> Handlers compute `int64 ÷ 100` to produce the display string. Never return or accept a JSON float for a monetary amount.
> **Validation:** `request.amountMinor` must equal `booking.total_amount_minor` before charging Omise. Mismatch → 400 `AMOUNT_MISMATCH`.

---

## Authentication

All API endpoints (except `/health/*`) require a **JWT RS256** bearer token.

```
Authorization: Bearer <token>
```

- Tokens are signed with an **RSA private key** and verified by all services using the **RSA public key** from the `JWT_PUBLIC_KEY` environment variable.
- Algorithm: `RS256` (asymmetric — no shared secret between services).
- Required claims: `sub` (subject), `exp` (expiry).
- Missing or invalid token → **`401 Unauthorized`**

```json
{ "error": "UNAUTHORIZED", "message": "missing or invalid token" }
```

> For testing, generate a token with: `make jwt-token` — this uses `JWT_PRIVATE_KEY` from `.env` and prints a valid Bearer token.

### Internal endpoint guard

`PUT /api/bookings/:bookingRef/status` is called **only by payment-service**. It is **exempt from JWT** — there is no user to authenticate. Instead it uses a shared secret:

```
X-Internal-Token: <value of INTERNAL_TOKEN env var>
```

Missing or wrong token → **`403 Forbidden`**

```json
{ "error": "FORBIDDEN", "message": "internal token required" }
```

> **Why not JWT?** JWT carries user identity. A service-to-service call has no user — forcing payment-service to sign a JWT would require distributing the private key to a running container, which weakens the asymmetric key model. A shared secret is the right tool here.

---

## Booking Service `:8082`

### `GET /api/flights/search`

Search available flights by route and date.

**Query parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `origin` | string | Yes | IATA airport code, e.g. `BKK` |
| `destination` | string | Yes | IATA airport code, e.g. `SIN` |
| `date` | string | Yes | `YYYY-MM-DD` — use `2026-06-15` for all tests |
| `passengers` | integer | No | Minimum seats required. Default `1` |

**Request example**
```bash
TOKEN=$(make jwt-token -s)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8082/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"
```

**Response `200 OK`**
```json
{
  "flights": [
    {
      "id": 1,
      "flightNumber": "QM101",
      "origin": "BKK",
      "destination": "SIN",
      "departureTime": "2026-06-15T01:00:00Z",
      "arrivalTime": "2026-06-15T03:30:00Z",
      "durationMinutes": 150,
      "availableSeats": 156,
      "basePriceMinor": 350000,
      "currency": "THB",
      "basePrice": "3500.00",
      "status": "SCHEDULED"
    },
    {
      "id": 3,
      "flightNumber": "SC201",
      "origin": "BKK",
      "destination": "SIN",
      "departureTime": "2026-06-15T03:00:00Z",
      "arrivalTime": "2026-06-15T05:30:00Z",
      "durationMinutes": 150,
      "availableSeats": 78,
      "basePriceMinor": 220000,
      "currency": "THB",
      "basePrice": "2200.00",
      "status": "SCHEDULED"
    }
  ]
}
```

> All times are UTC. Bangkok (UTC+7): 08:00 local = 01:00 UTC.
> An empty `flights` array (not 404) is returned when no flights match.

**Response `400 Bad Request`** — missing required parameter
```json
{ "error": "MISSING_REQUIRED_FIELD", "message": "origin, destination, and date are required" }
```

**Response `400 Bad Request`** — invalid date format
```json
{ "error": "INVALID_DATE_FORMAT", "message": "date must be in YYYY-MM-DD format" }
```

**Response `401 Unauthorized`** — missing or invalid JWT
```json
{ "error": "UNAUTHORIZED", "message": "missing or invalid token" }
```

---

### `GET /api/flights/:id`

Get full detail for one flight by its database ID.

**Path parameter:** `id` — integer, from search results.

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8082/api/flights/1"
```

**Response `200 OK`**
```json
{
  "id": 1,
  "flightNumber": "QM101",
  "origin": "BKK",
  "destination": "SIN",
  "departureTime": "2026-06-15T01:00:00Z",
  "arrivalTime": "2026-06-15T03:30:00Z",
  "durationMinutes": 150,
  "availableSeats": 156,
  "basePriceMinor": 350000,
  "currency": "THB",
  "basePrice": "3500.00",
  "status": "SCHEDULED"
}
```

**Response `400 Bad Request`** — id is not an integer
```json
{ "error": "INVALID_FIELD", "message": "id must be an integer" }
```

**Response `401 Unauthorized`** — missing or invalid JWT
```json
{ "error": "UNAUTHORIZED", "message": "missing or invalid token" }
```

**Response `404 Not Found`**
```json
{ "error": "FLIGHT_NOT_FOUND", "message": "Flight 999 not found" }
```

---

### `POST /api/bookings`

Create a booking for one passenger on one flight. Returns a 6-char PNR (`bookingRef`) and a numeric `bookingId`. Booking starts with `status: "PENDING"` until payment succeeds.

> `totalAmountMinor` is in satang (e.g. `350000` for 3,500 THB). `totalAmount` is the formatted display string (e.g. `"3500.00"`). Set both to match the flight's price.
> One passenger per booking.

**Request body**
```json
{
  "flightId": 1,
  "passenger": {
    "firstName": "Somchai",
    "lastName": "Jaidee",
    "email": "somchai@example.com",
    "phone": "+66812345678",
    "passportNumber": "AA123456",
    "dateOfBirth": "1990-05-15",
    "nationality": "TH"
  },
  "totalAmountMinor": 350000,
  "currency": "THB",
  "totalAmount": "3500.00"
}
```

**Required fields:** `flightId`, `totalAmountMinor`, `passenger.firstName`, `passenger.lastName`, `passenger.email`
**Optional fields:** `currency` (default `"THB"`), `passenger.phone`, `passenger.passportNumber`, `passenger.dateOfBirth`, `passenger.nationality`

```bash
curl -X POST http://localhost:8082/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": 1,
    "passenger": {
      "firstName": "Somchai", "lastName": "Jaidee",
      "email": "somchai@example.com", "phone": "+66812345678",
      "passportNumber": "AA123456", "dateOfBirth": "1990-05-15", "nationality": "TH"
    },
    "totalAmountMinor": 350000, "currency": "THB", "totalAmount": "3500.00"
  }'
```

**Response `201 Created`**
```json
{
  "bookingRef": "QM7X2K",
  "bookingId": 42,
  "status": "PENDING",
  "message": "Booking created. Proceed to payment."
}
```

> `bookingRef` — 6-char PNR, always uppercase alphanumeric (no I, O, 0, 1 to avoid confusion).
> `bookingId` — numeric DB row id. **Save both — you need both for the payment call.**

**Response `400 Bad Request`** — missing required field
```json
{ "error": "MISSING_REQUIRED_FIELD", "message": "passenger.email is required" }
```

**Response `401 Unauthorized`** — missing or invalid JWT
```json
{ "error": "UNAUTHORIZED", "message": "missing or invalid token" }
```

**Response `409 Conflict`** — no available seats
```json
{ "error": "NO_SEATS_AVAILABLE", "message": "No seats available on this flight." }
```

---

### `GET /api/bookings/:bookingRef`

Get full booking detail including passenger and flight information.

**Path parameter:** `bookingRef` — 6-char PNR, case-insensitive (normalise to uppercase internally).

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8082/api/bookings/QM7X2K"
```

**Response `200 OK`** — before payment (`status: "PENDING"`)
```json
{
  "bookingRef": "QM7X2K",
  "status": "PENDING",
  "paymentProvider": null,
  "providerChargeId": null,
  "flight": {
    "id": 1,
    "flightNumber": "QM101",
    "origin": "BKK",
    "destination": "SIN",
    "departureTime": "2026-06-15T01:00:00Z",
    "arrivalTime": "2026-06-15T03:30:00Z"
  },
  "passenger": {
    "firstName": "Somchai",
    "lastName": "Jaidee",
    "email": "somchai@example.com",
    "phone": "+66812345678",
    "passportNumber": "AA123456",
    "nationality": "TH"
  },
  "totalAmountMinor": 350000,
  "currency": "THB",
  "totalAmount": "3500.00",
  "createdAt": "2026-05-22T10:00:00Z"
}
```

**Response `200 OK`** — after successful payment (`status: "CONFIRMED"`)
```json
{
  "bookingRef": "QM7X2K",
  "status": "CONFIRMED",
  "paymentProvider": "OMISE",
  "providerChargeId": "chrg_test_5fzddg8p5j3qhp1w5jg",
  "flight": {
    "id": 1,
    "flightNumber": "QM101",
    "origin": "BKK",
    "destination": "SIN",
    "departureTime": "2026-06-15T01:00:00Z",
    "arrivalTime": "2026-06-15T03:30:00Z"
  },
  "passenger": {
    "firstName": "Somchai",
    "lastName": "Jaidee",
    "email": "somchai@example.com",
    "phone": "+66812345678",
    "passportNumber": "AA123456",
    "nationality": "TH"
  },
  "totalAmountMinor": 350000,
  "currency": "THB",
  "totalAmount": "3500.00",
  "createdAt": "2026-05-22T10:00:00Z"
}
```

> `paymentProvider` — which payment gateway processed the charge (`"OMISE"`, `"2C2P"`, etc.). `null` when `PENDING`.
> `providerChargeId` — the gateway's own transaction reference (Omise: `chrg_test_…`, 2C2P: order reference, etc.). `null` when `PENDING`.
> qoomlee-service retrieves both fields by LEFT JOINing `payments` on `bookings.confirmed_payment_id`. No cross-service HTTP call required — both tables share the same database.

**Response `401 Unauthorized`** — missing or invalid JWT
```json
{ "error": "UNAUTHORIZED", "message": "missing or invalid token" }
```

**Response `404 Not Found`**
```json
{ "error": "BOOKING_NOT_FOUND", "message": "Booking QM9999 not found" }
```

---

### `PUT /api/bookings/:bookingRef/status` — internal only

Called by **payment-service** after a successful Omise charge. Not called by end users.

**Called via:** `PUT http://qoomlee-service:8082/api/bookings/{bookingRef}/status`

**Required header** — no JWT; authenticated by shared secret only:
```
X-Internal-Token: <INTERNAL_TOKEN value>
```

**Request body**
```json
{
  "status":           "CONFIRMED",
  "paymentId":        42,
  "paymentProvider":  "OMISE",
  "providerChargeId": "chrg_test_xxxxxxxxxxxxxxxx"
}
```

> `paymentId` — the `id` of the `payments` row that just succeeded. Stored in `bookings.confirmed_payment_id`.
> `paymentProvider` and `providerChargeId` — stored directly in the bookings row so that `GET /api/bookings/:ref` can return them without accessing the payment database (which qoomlee-service cannot reach).

**Response `200 OK`**
```json
{ "bookingRef": "QM7X2K", "status": "CONFIRMED" }
```

**Response `400 Bad Request`** — value other than `CONFIRMED`
```json
{ "error": "INVALID_STATUS", "message": "Only CONFIRMED is accepted" }
```

**Response `403 Forbidden`** — missing or wrong `X-Internal-Token`
```json
{ "error": "FORBIDDEN", "message": "internal token required" }
```

**Response `404 Not Found`**
```json
{ "error": "BOOKING_NOT_FOUND", "message": "Booking QM9999 not found" }
```

---

## Payment Service `:8084`

### `POST /api/payments/charge`

Charge a credit card via Omise. On success, the service also calls qoomlee-service to set status `CONFIRMED`.

> **Amount is in satang.** `3,500 THB` → send `350000`.
> The charge is **synchronous** — Omise returns success/failure immediately. No webhook needed.

#### Step A — Get a single-use Omise token

```bash
curl https://vault.omise.co/tokens \
  -u YOUR_OMISE_PUBLIC_KEY: \
  -d "card[number]=4242424242424242" \
  -d "card[expiration_month]=12" \
  -d "card[expiration_year]=2028" \
  -d "card[security_code]=123" \
  -d "card[name]=SOMCHAI JAIDEE"
# Response: { "id": "tokn_test_xxxx", ... }  ← use the "id" field
```

> Each token is **single-use**. Get a new one for every charge attempt.

#### Step B — Charge

**Request body**
```json
{
  "bookingRef": "QM7X2K",
  "omiseToken": "tokn_test_xxxx",
  "amountMinor": 350000,
  "currency": "THB",
  "amount": "3500.00"
}
```

**Required fields:** `bookingRef`, `omiseToken`, `amountMinor`

> payment-service calls `GET /api/bookings/:ref` to fetch booking details and validate `amountMinor` + `currency` before calling Omise. `bookingId` is no longer required in the charge request — it is obtained from the booking API response.

```bash
curl -X POST http://localhost:8084/api/payments/charge \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingRef":"QM7X2K","omiseToken":"tokn_test_xxxx","amountMinor":350000,"currency":"THB","amount":"3500.00"}'
```

**Response `201 Created`** — charge succeeded
```json
{
  "paymentId": 1,
  "paymentProvider": "OMISE",
  "providerChargeId": "chrg_test_5fzddg8p5j3qhp1w5jg",
  "status": "SUCCEEDED",
  "amountMinor": 350000,
  "currency": "THB",
  "amount": "3500.00",
  "paidAt": "2026-05-22T10:05:00Z"
}
```

**Response `402 Payment Required`** — card declined
```json
{
  "error": "payment_failed",
  "failureCode": "insufficient_fund",
  "failureMessage": "The card has insufficient funds."
}
```

> On decline: payment is recorded as `FAILED`, booking stays `PENDING`. Client can retry with a new token.

**Response `401 Unauthorized`** — missing or invalid JWT
```json
{ "error": "UNAUTHORIZED", "message": "missing or invalid token" }
```

**Response `409 Conflict`** — booking already paid
```json
{ "error": "ALREADY_PAID", "message": "Booking QM7X2K has already been paid" }
```

---

### `GET /api/payments/:bookingRef`

Get the most recent payment record for a booking.

**Path parameter:** `bookingRef` — 6-char PNR.

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8084/api/payments/QM7X2K"
```

**Response `200 OK`** — successful payment
```json
{
  "bookingRef": "QM7X2K",
  "paymentProvider": "OMISE",
  "providerChargeId": "chrg_test_5fzddg8p5j3qhp1w5jg",
  "status": "SUCCEEDED",
  "amountMinor": 350000,
  "currency": "THB",
  "amount": "3500.00",
  "paidAt": "2026-05-22T10:05:00Z"
}
```

**Response `200 OK`** — failed payment attempt
```json
{
  "bookingRef": "QM7X2K",
  "paymentProvider": "OMISE",
  "providerChargeId": "chrg_test_declined_example",
  "status": "FAILED",
  "failureCode": "insufficient_fund",
  "failureMessage": "The card has insufficient funds.",
  "amountMinor": 350000,
  "currency": "THB",
  "amount": "3500.00",
  "paidAt": null
}
```

**Response `401 Unauthorized`** — missing or invalid JWT
```json
{ "error": "UNAUTHORIZED", "message": "missing or invalid token" }
```

**Response `404 Not Found`** — no payment attempt yet
```json
{ "error": "PAYMENT_NOT_FOUND", "message": "No payment found for booking QM9999" }
```

---

## Health Endpoints (all services)

| Endpoint | Returns | When |
|---|---|---|
| `GET /health/live` | `{"status":"ok","service":"..."}` 200 | Always — proves the process is running |
| `GET /health/ready` | `{"status":"ok","service":"..."}` 200 | DB is reachable |
| `GET /health/ready` | `{"status":"degraded","service":"...","error":"database ping failed"}` 503 | DB is unreachable |

---

## Test Cards

| Card number | Expiry | CVV | Result | failureCode |
|---|---|---|---|---|
| `4242 4242 4242 4242` | any future | any 3-digit | Success | — |
| `4111 1111 1111 1111` | any future | any 3-digit | Decline | `insufficient_fund` |

---

## Booking Status Lifecycle

```
                         payment-service calls PUT /api/bookings/:ref/status
PENDING ──── charge succeeds ────────────────────────────► CONFIRMED
PENDING ──── charge fails ──────────────────────────────► PENDING (can retry)
```

---

## Error Response Format

All `4xx` and `5xx` responses:
```json
{ "error": "ERROR_CODE", "message": "Human-readable description." }
```

| Status | When |
|---|---|
| `400 Bad Request` | Missing or invalid request fields |
| `401 Unauthorized` | Missing or invalid JWT (public API endpoints only) |
| `402 Payment Required` | Omise card declined |
| `403 Forbidden` | Wrong or missing `X-Internal-Token` (`PUT /api/bookings/:ref/status` only — no JWT on this route) |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Business rule violation (already paid, no seats) |
| `429 Too Many Requests` | Per-IP rate limit exceeded |
| `500 Internal Server Error` | Unexpected server error |
| `503 Service Unavailable` | Health check — DB unreachable |
