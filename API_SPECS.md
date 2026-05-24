# Qoomlee Airline — API Specifications

All public calls go through the **API Gateway: `http://localhost:8080`**.
Internal service-to-service calls use the service URL directly (e.g. `http://booking-service:8082`).

> **See diagrams/** for use case and sequence diagrams that show how all endpoints connect.

> **Amount convention:** Omise and the payments table store amounts in **satang** (Thai smallest unit).
> 1 THB = 100 satang. Always multiply/divide by 100 when converting.
> Example: 3,500 THB → send `350000`.

---

## Flight Service

### `GET /api/flights/search` — Already implemented

Search available flights.

**Query parameters**

| Param | Type | Required | Notes |
|---|---|---|---|
| `origin` | string | Yes | IATA code, e.g. `BKK` |
| `destination` | string | Yes | IATA code, e.g. `SIN` |
| `date` | string | Yes | ISO date `YYYY-MM-DD` |
| `passengers` | integer | No | Default `1` |

**Request example**
```bash
curl "http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"
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
      "availableSeats": 142,
      "basePrice": 3500.00,
      "currency": "THB",
      "status": "SCHEDULED"
    },
    {
      "id": 2,
      "flightNumber": "QM102",
      "origin": "BKK",
      "destination": "SIN",
      "departureTime": "2026-06-15T07:00:00Z",
      "arrivalTime": "2026-06-15T09:30:00Z",
      "availableSeats": 30,
      "basePrice": 2800.00,
      "currency": "THB",
      "status": "SCHEDULED"
    }
  ]
}
```

> Times are in UTC. Bangkok (UTC+7): 08:00 local = 01:00 UTC.

**Response `400 Bad Request`** — missing `origin`
```json
{
  "error": "MISSING_REQUIRED_FIELD",
  "message": "Required parameter 'origin' is not present."
}
```

---

### `GET /api/flights/:id` — You implement this

Get full detail for one flight.

**Path parameter:** `id` — numeric flight ID from search results.

**Request example**
```bash
curl "http://localhost:8080/api/flights/1"
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
  "availableSeats": 142,
  "basePrice": 3500.00,
  "currency": "THB",
  "status": "SCHEDULED"
}
```

**Response `404 Not Found`**
```json
{
  "error": "FLIGHT_NOT_FOUND",
  "message": "Flight 999 not found"
}
```

---

## Booking Service

### `POST /api/bookings` — Already implemented

Create a booking. Booking is created with `status: "PENDING"` until payment succeeds.

> Only **one passenger per booking** in this challenge.
> Pass `totalAmount` in **THB** (not satang) — set it to the flight's `basePrice`.

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
  "totalAmount": 3500.00,
  "currency": "THB"
}
```

**Required fields in `passenger`:** `firstName`, `lastName`, `email`
**Optional fields in `passenger`:** `phone`, `passportNumber`, `dateOfBirth`, `nationality`

**Request example**
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
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
    "totalAmount": 3500.00,
    "currency": "THB"
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

> `bookingRef` = the 6-character PNR (e.g. `QM7X2K`). Always uppercase alphanumeric, no I/O/0/1 to avoid confusion.
> `bookingId` = numeric DB row ID. **You need both values for the payment call.**

---

### `GET /api/bookings/:bookingRef` — You implement this

Get full booking detail including passenger and flight info.

**Path parameter:** `bookingRef` — 6-character PNR, case-insensitive (normalise to uppercase internally).

**Request example**
```bash
curl "http://localhost:8080/api/bookings/QM7X2K"
```

**Response `200 OK`** (before payment)
```json
{
  "bookingRef": "QM7X2K",
  "status": "PENDING",
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
  "totalAmount": 3500.00,
  "currency": "THB",
  "createdAt": "2026-05-22T10:00:00Z"
}
```

**Response `200 OK`** (after successful payment — `status` changes to `CONFIRMED`)
```json
{
  "bookingRef": "QM7X2K",
  "status": "CONFIRMED",
  "flight": { ... },
  "passenger": { ... },
  "totalAmount": 3500.00,
  "currency": "THB",
  "createdAt": "2026-05-22T10:00:00Z"
}
```

**Response `404 Not Found`**
```json
{
  "error": "BOOKING_NOT_FOUND",
  "message": "Booking QM9999 not found"
}
```

---

### `PUT /api/bookings/:bookingRef/status` — You implement this (internal only)

> **This endpoint is not called by end users.** It is called only by the payment-service after a successful Omise charge. Do not expose it through the API Gateway if you want to be strict — but for this challenge it is acceptable either way.

**Path parameter:** `bookingRef` — 6-character PNR.

**Called by:** `payment-service` → `http://booking-service:8082/api/bookings/{bookingRef}/status`

**Request body**
```json
{ "status": "CONFIRMED" }
```

**Response `200 OK`**
```json
{ "bookingRef": "QM7X2K", "status": "CONFIRMED" }
```

**Response `400 Bad Request`** — invalid status value
```json
{ "error": "INVALID_STATUS", "message": "Only CONFIRMED is accepted" }
```

**Response `404 Not Found`**
```json
{ "error": "BOOKING_NOT_FOUND", "message": "Booking QM9999 not found" }
```

---

## Payment Service

### `POST /api/payments/charge` — Already implemented

Charge via Omise. On success, the service must also update booking status to `CONFIRMED`.

> **Amount is in satang.** Convert: multiply THB by 100.
> Example: 3,500 THB → `350000`

**How to get an Omise test token (required before each charge attempt):**
```bash
# Replace pkey_test_xxx with your actual public key from .env
curl https://vault.omise.co/tokens \
  -u pkey_test_xxx: \
  -d "card[number]=4242424242424242" \
  -d "card[expiration_month]=12" \
  -d "card[expiration_year]=2028" \
  -d "card[security_code]=123" \
  -d "card[name]=SOMCHAI JAIDEE"
```

This returns `{"object":"token","id":"tokn_test_xxxx",...}` — use the `id` field.
> Each token is single-use. Create a new token for each charge attempt.

**Request body**
```json
{
  "bookingRef": "QM7X2K",
  "bookingId": 42,
  "omiseToken": "tokn_test_xxxx",
  "amount": 350000,
  "currency": "THB"
}
```

**Request example**
```bash
curl -X POST http://localhost:8080/api/payments/charge \
  -H "Content-Type: application/json" \
  -d '{
    "bookingRef": "QM7X2K",
    "bookingId": 42,
    "omiseToken": "tokn_test_5fzddg8p5j3qhp1w5jg",
    "amount": 350000,
    "currency": "THB"
  }'
```

**Response `201 Created`** — payment succeeded
```json
{
  "paymentId": 1,
  "omiseChargeId": "chrg_test_5fzddg8p5j3qhp1w5jg",
  "status": "SUCCEEDED",
  "amount": 350000,
  "currency": "THB",
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

> When a charge succeeds, the payment service calls booking-service:
> `PUT http://booking-service:8082/api/bookings/{bookingRef}/status` with `{"status":"CONFIRMED"}`
> You need to implement that PUT endpoint on the booking-service side.

---

### `GET /api/payments/:bookingRef` — You implement this

Get payment status for a booking.

**Path parameter:** `bookingRef` — 6-character PNR.

**Request example**
```bash
curl "http://localhost:8080/api/payments/QM7X2K"
```

**Response `200 OK`**
```json
{
  "bookingRef": "QM7X2K",
  "status": "SUCCEEDED",
  "omiseChargeId": "chrg_test_5fzddg8p5j3qhp1w5jg",
  "amount": 350000,
  "currency": "THB",
  "paidAt": "2026-05-22T10:05:00Z"
}
```

> `amount` is in satang (same unit that was sent to Omise and stored in the DB).

**Response `200 OK`** — failed payment
```json
{
  "bookingRef": "QM7X2K",
  "status": "FAILED",
  "omiseChargeId": "chrg_test_declined_example",
  "failureCode": "insufficient_fund",
  "failureMessage": "The card has insufficient funds.",
  "amount": 350000,
  "currency": "THB",
  "paidAt": null
}
```

**Response `404 Not Found`** — no payment attempt yet
```json
{
  "error": "PAYMENT_NOT_FOUND",
  "message": "No payment found for booking QM9999"
}
```

---

## Test Cards

| Card number | CVV | Expiry | Result |
|---|---|---|---|
| `4242 4242 4242 4242` | any 3 digits | any future date | Success |
| `4111 1111 1111 1111` | any 3 digits | any future date | Decline: `insufficient_fund` |

---

## Booking Status Lifecycle

```
PENDING  →  CONFIRMED   (payment succeeded — payment-service updates booking-service)
PENDING  →  PENDING     (payment failed — booking stays PENDING, can retry payment)
```

---

## Error Response Format

All error responses:
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

| HTTP Status | When |
|---|---|
| `400` | Missing/invalid request fields |
| `402` | Omise card declined |
| `404` | Resource not found |
| `500` | Unexpected server error |
