# Qoomlee Airline — Agent Skills Challenge

---

## What You're Building

You're building the backend for a simple airline booking system called **Qoomlee**.
It's a REST API only — no frontend, no UI.

Here's the journey a passenger takes:

```
Search flights  →  Pick a flight  →  Book a seat  →  Pay  →  Get confirmation
```

Your job is to make that entire journey work — from searching available flights
all the way to a confirmed, paid booking.

---

## What's Provided

You are given:

| Provided | Location | Purpose |
|---|---|---|
| Database schema | `infra/db/01_schema.sql` | Table definitions — **do not modify** |
| Seed data | `infra/db/02_seed.sql` | 5 real flights in the DB on 2026-06-15 — **do not modify** |
| API specifications | `API_SPECS.md` | Exact request/response shape for every endpoint |
| Docker Compose | `docker-compose.yml` | Spins up postgres + all 3 services |
| Test scripts | `scripts/`, `tests/k6/` | Smoke, contract, and load tests |

You are **not** given any working business logic. Build everything from scratch.

---

## What You Build

### API Endpoints (all 7)

```
flight-service   :8081
  GET  /api/flights/search              Search flights by route + date
  GET  /api/flights/:id                 View a single flight's details

booking-service  :8082
  POST /api/bookings                    Create a booking, receive a 6-char PNR
  GET  /api/bookings/:bookingRef        View booking + passenger + flight info
  PUT  /api/bookings/:bookingRef/status Internal: flip status PENDING→CONFIRMED

payment-service  :8084
  POST /api/payments/charge             Charge a card via Omise
  GET  /api/payments/:bookingRef        View payment receipt
```

### Infrastructure & Security (all 6)

```
All services     GET /health/live              Liveness probe  — always 200 (no auth)
All services     GET /health/ready             Readiness probe — 503 when DB is down (no auth)
All services     Rate limiting                 Per-IP limits on sensitive endpoints
All services     Graceful shutdown             Drain connections on SIGTERM (10 s)
All services     Structured logging            JSON logs via slog
All services     JWT RS256 (public API)        Authorization: Bearer on every /api/* endpoint
booking-service  X-Internal-Token (`PUT /api/bookings/:ref/status`) 256-bit shared secret, no JWT on this route
```

---

## Team Setup

| | Team A | Team B |
|---|---|---|
| Approach | May create and use any `.md` skill files | Single code agent only — no skill files |
| Starting point | This skeleton (identical) | This skeleton (identical) |
| Time limit | 2 hours | 2 hours |

---

## Start Here

```bash
# 1. Get free Omise test keys
#    → https://dashboard.omise.co → sign up → API Keys → Test keys
#    Copy:  pkey_test_...   and   skey_test_...

# 2. Copy the environment template and fill in your keys
cp .env.example .env
# Edit .env:
#   - Set OMISE_PUBLIC_KEY and OMISE_SECRET_KEY
#   - Set INTERNAL_TOKEN to a random secret (e.g. openssl rand -hex 16)
#   - JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are pre-filled with test keys — leave as-is for testing

# 3. Start the stack
docker compose up --build

# 4. Get a JWT and verify the stack is up
make jwt-token     # prints a Bearer token — save it as TOKEN=...
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8081/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"
# Expected before implementation: HTTP 501
# Expected after implementation:  HTTP 200 with flights array
```

---

## Technology Stack

| Service | Language | Framework | Port |
|---|---|---|---|
| flight-service | Go | Gin | 8081 |
| booking-service | Go | Gin | 8082 |
| payment-service | Go | Gin | 8084 |
| Database | — | PostgreSQL 16 | 5432 |

**Unit tests:** `go test ./...` with `testify` + `testify/mock`
**Integration tests:** `testcontainers-go` (real PostgreSQL container)
**Load tests:** K6

---

## Service Architecture

Each Go service follows the same three-layer pattern:

```
Handler  (HTTP)      — parse request, validate input, call service, write response
Service  (Business)  — orchestration logic, calls repository
Repository (SQL)     — all database queries; defined as an interface for testability
```

No SQL in handlers. No HTTP logic in repositories.

---

## The Database

One shared PostgreSQL database. **Do not modify the schema or seed data.**

### Seed flights

**2026-06-15 — primary test date (use for all booking and payment tests)**

| DB id | Flight | Route | Departure (BKK local, UTC+7) | `basePriceMinor` (satang) | `basePrice` (string) | Seats | Notes |
|---|---|---|---|---|---|---|---|
| 1 | QM101 | BKK → SIN | 08:00 | 350000 | "3500.00" | 154 | 2 seats held by pre-seeded bookings |
| 2 | QM102 | BKK → SIN | 14:00 | 280000 | "2800.00" | 30 | |
| 3 | SC201 | BKK → SIN | 10:00 | 220000 | "2200.00" | 78 | |
| 4 | QM201 | BKK → HKG | 07:30 | 450000 | "4500.00" | 200 | |
| 5 | QM301 | BKK → NRT | 23:55 | 980000 | "9800.00" | 150 | Overnight — arrives 2026-06-16 |
| 6 | QM999 | BKK → SIN | 22:00 | 350000 | "3500.00" | **0** | **SOLD OUT** — trigger `NO_SEATS_AVAILABLE` |
| 7 | QM401 | BKK → KUL | 06:15 | 129000 | "1290.00" | 138 | 2 seats held by pre-seeded bookings |
| 8 | QM402 | BKK → KUL | 17:30 | 185000 | "1850.00" | **12** | **Nearly full** — use for low-seats concurrent test |
| 9 | QM501 | BKK → CGK | 08:00 | 289000 | "2890.00" | 179 | 1 seat held by pre-seeded booking |
| 10 | QM601 | BKK → MNL | 07:00 | 320000 | "3200.00" | 249 | 1 seat held by pre-seeded booking |

**2026-06-16 — next-day flights (use to verify date filtering)**

| DB id | Flight | Route | Departure (BKK local, UTC+7) | `basePriceMinor` (satang) | `basePrice` (string) | Seats | Notes |
|---|---|---|---|---|---|---|---|
| 11 | QM103 | BKK → SIN | 09:00 | 310000 | "3100.00" | 160 | Must appear in `date=2026-06-16` search; must **not** appear in `date=2026-06-15` search |
| 12 | QM202 | BKK → HKG | 11:00 | 490000 | "4900.00" | 200 | Must appear in `date=2026-06-16` search; must **not** appear in `date=2026-06-15` search |

**QM999 will not appear in search results** (`available_seats=0` is filtered out) but can be targeted by `POST /api/bookings` to trigger a 409.

> Departure times are stored as `TIMESTAMPTZ` in UTC: 08:00 BKK (UTC+7) = 01:00 UTC.

### Pre-seeded test bookings and payments

These records are ready-made in the DB from `02_seed.sql`. Use them in integration and contract tests to avoid building state from scratch.

| booking_ref | Flight | Passenger | Status | Use for |
|---|---|---|---|---|
| `SEED01` | QM101 | Seed User | `CONFIRMED` | Duplicate-payment guard — `POST /api/payments/charge` must return **409 `ALREADY_PAID`** |
| `SEED02` | QM101 | Seed User | `PENDING` | Read tests — `GET /api/bookings/SEED02` returns 200 with nested flight + passenger |
| `MNKP23` | QM401 (BKK→KUL) | Wanchai Srisuk | `CONFIRMED` | Multi-route confirmed booking reads; traceability check |
| `AKVWQ4` | QM501 (BKK→CGK) | Akira Tanaka | `CONFIRMED` | Foreign-passenger confirmed booking reads |
| `NRPQ56` | QM401 (BKK→KUL) | Narumon Pattanakit | `PENDING` | **Retry-payment test** — has a prior `FAILED` payment; charge again with success card |
| `FMXB89` | QM601 (BKK→MNL) | Ahmad Fauzi | `PENDING` | **First-charge flow** — no prior payment attempt |

| booking_ref | Payment status | paymentProvider | providerChargeId | Use for |
|---|---|---|---|---|
| `SEED01` | `SUCCEEDED` | `OMISE` | `chrg_test_seed01xxxxxxxxxx` | `GET /api/payments/SEED01` returns `status: "SUCCEEDED"` |
| `SEED02` | `FAILED` | `OMISE` | `chrg_test_seed02xxxxxxxxxx` | `GET /api/payments/SEED02` returns `status: "FAILED"`, `failureCode: "insufficient_fund"` |
| `MNKP23` | `SUCCEEDED` | `OMISE` | `chrg_test_mnkp23xxxxxxxxxx` | Read test for KUL route confirmed payment |
| `AKVWQ4` | `SUCCEEDED` | `OMISE` | `chrg_test_akvwq4xxxxxxxxxx` | Read test for CGK route confirmed payment |
| `NRPQ56` | `FAILED` | `OMISE` | `chrg_test_nrpq56xxxxxxxxxx` | Booking stays `PENDING`; use `NRPQ56` to retry with success card |

> **For unknown-ref tests** use any ref that doesn't exist, e.g. `XXXXXX` → must return 404.

### Key tables

```
flights    — id, flight_number, route_id, departure_time, arrival_time,
             base_price_minor (BIGINT, satang), available_seats, status, currency
routes     — id, origin_iata, destination_iata
bookings   — id, booking_ref (6-char PNR), flight_id, passenger_id,
             status (PENDING|CONFIRMED), confirmed_payment_id (FK→payments),
             total_amount_minor (BIGINT, satang), currency
passengers — id, first_name, last_name, email, phone,
             passport_number, date_of_birth, nationality
payments   — id, booking_ref, booking_id, payment_provider (OMISE|2C2P|…),
             provider_charge_id, amount_minor (BIGINT, satang), currency, status,
             failure_code, failure_message, paid_at

> **Monetary convention:** ALL money columns are BIGINT minor units (satang).
> 3,500 THB → stored as 350000. No NUMERIC/DECIMAL anywhere.
> Every monetary field in API requests and responses is a triple: `*Minor` (int64 satang), `currency`, and `*` (formatted display string, e.g. `"3500.00"`).
> Handlers compute `int64 ÷ 100` to produce the display string. Never use floats for money.
```

Full schema: `infra/db/01_schema.sql` — Seed: `infra/db/02_seed.sql`

---

## How the Endpoints Connect

The 7 endpoints form a single flow. Implement them in this order:

```
Step 1 ── GET  /api/flights/search
           Search by origin, destination, date, passengers.
           Returns a list of matching flights.

Step 2 ── GET  /api/flights/:id
           Fetch one flight by its DB id.
           Client uses this to confirm details before booking.

Step 3 ── POST /api/bookings
           Create a booking for one passenger on one flight.
           Decrements available_seats inside a transaction.
           Returns a 6-char PNR (e.g. "QM7X2K") and a numeric bookingId.

Step 4 ── POST /api/payments/charge          ← needs an Omise token first (see below)
           Charge the card via Omise.
           On success: records SUCCEEDED payment, then calls Step 5 internally.
           On decline: records FAILED payment, returns 402. Booking stays PENDING.

Step 5 ── PUT  /api/bookings/:bookingRef/status    ← called by payment-service, not client
           Flip booking status from PENDING → CONFIRMED.
           Only called after a successful Omise charge.

Step 6 ── GET  /api/bookings/:bookingRef
           Returns the full booking with nested flight + passenger objects.
           Status should be CONFIRMED after a successful payment.

Step 7 ── GET  /api/payments/:bookingRef
           Returns the payment receipt with paymentProvider, providerChargeId, amount, paidAt.
```

---

## Endpoint Specifications

See `API_SPECS.md` for the complete request/response reference for every endpoint.
Below are the key implementation notes for each.

---

### 1. `GET /api/flights/search`

**File:** `services/flight/handler/flight.go` → `Search`
**Repo:** `services/flight/repository/flight.go` → `Search`

Query parameters: `origin`, `destination`, `date` (YYYY-MM-DD), `passengers` (default 1).

SQL to implement:
```sql
SELECT f.id, f.flight_number,
       r.origin_iata, r.destination_iata,
       f.departure_time, f.arrival_time,
       f.status, f.base_price_minor, f.currency, f.available_seats
FROM flights f
JOIN routes r ON r.id = f.route_id
WHERE r.origin_iata      = $1
  AND r.destination_iata = $2
  AND f.departure_time  >= $3        -- start of date (UTC)
  AND f.departure_time   < $4        -- end of date (UTC)
  AND f.available_seats >= $5
  AND f.status           = 'SCHEDULED'
ORDER BY f.departure_time
```

Compute `durationMinutes` from `arrival_time - departure_time` in Go.

---

### 2. `GET /api/flights/:id`

**File:** `services/flight/handler/flight.go` → `GetByID`
**Repo:** `services/flight/repository/flight.go` → `GetByID`

Same columns as search. If no row found, return 404 `FLIGHT_NOT_FOUND`.

---

### 3. `POST /api/bookings`

**File:** `services/booking/handler/booking.go` → `Create`
**Repo:** `services/booking/repository/booking.go` → `InsertPassenger`, `InsertBooking`

Three steps in **one transaction** — use `SELECT … FOR UPDATE` to prevent overbooking under concurrent load:

```sql
BEGIN;

-- Step 1: lock the flight row and read current seat count
SELECT available_seats FROM flights WHERE id = $1 FOR UPDATE;
-- If available_seats = 0 → ROLLBACK and return 409 NO_SEATS_AVAILABLE

-- Step 2: insert passenger
INSERT INTO passengers (first_name, last_name, email, ...) RETURNING id;

-- Step 3: insert booking with total_amount_minor (copy from flights.base_price_minor)
INSERT INTO bookings (booking_ref, flight_id, passenger_id, total_amount_minor, currency, ...)
VALUES ($1, $2, $3, $4, $5, ...);

-- Step 4: decrement seat counter
UPDATE flights SET available_seats = available_seats - 1 WHERE id = $1;

COMMIT;
```

> `total_amount_minor` must be copied from `flights.base_price_minor` at booking time — it's the price the passenger agreed to pay. Storing it on the booking prevents price-change issues later.

Generate the 6-char PNR in Go before the transaction:
```go
const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
// Pick 6 random characters from chars
```

---

### 4. `POST /api/payments/charge`

**File:** `services/payment/handler/payment.go` → `Charge`
**Repo:** `services/payment/repository/payment.go` → `Insert`

#### How Omise works (credit card, synchronous)

Omise credit card charges return the **final result immediately** — no webhook, no callback URL needed. This is why we scope to credit card only.

```
Client                         Your server                    Omise
  │                                │                             │
  │── POST /api/payments/charge ──►│                             │
  │   { omiseToken, amount, ... }  │── CreateCharge ────────────►│
  │                                │◄── charge.Status (sync) ───│
  │                                │   "successful" or "failed"  │
  │◄── 201 or 402 ─────────────────│                             │
```

#### Getting an Omise token

The client must first call Omise's vault to tokenise the card. The token is single-use.

```bash
curl https://vault.omise.co/tokens \
  -u YOUR_OMISE_PUBLIC_KEY: \
  -d "card[number]=4242424242424242" \
  -d "card[expiration_month]=12" \
  -d "card[expiration_year]=2028" \
  -d "card[security_code]=123" \
  -d "card[name]=SOMCHAI JAIDEE"
# Response: { "id": "tokn_test_xxxx", ... }
```

#### Using the Omise Go SDK

```go
import (
    omise "github.com/omise/omise-go"
    "github.com/omise/omise-go/operations"
)

client, _ := omise.NewClient(
    os.Getenv("OMISE_PUBLIC_KEY"),
    os.Getenv("OMISE_SECRET_KEY"),
)

charge := &omise.Charge{}
err := client.Do(charge, &operations.CreateCharge{
    Amount:   req.Amount,   // in satang — see note below
    Currency: "THB",
    Card:     req.OmiseToken,
})

// err != nil            → network/auth error → status = "FAILED"
// charge.Status == "successful" → status = "SUCCEEDED", paidAt = now
// charge.Status == "failed"     → status = "FAILED", check charge.FailureCode
```

#### Amount validation — guard against mismatch

Before calling Omise, payment-service must fetch the booking and validate:
```go
if req.AmountMinor != booking.TotalAmountMinor || req.Currency != booking.Currency {
    c.JSON(400, gin.H{"error": "AMOUNT_MISMATCH",
        "message": "amount or currency does not match the booking"})
    return
}
```

This prevents a client from submitting a lower amount than the booking price.
`request.amount_minor` and `payments.amount_minor` are satang (BIGINT). `3,500 THB → 350000`.
**Do not accept NUMERIC/float for amounts anywhere in the codebase.**

#### After a successful charge

Call `PUT http://booking-service:8082/api/bookings/{bookingRef}/status` with:
```json
{ "status": "CONFIRMED", "paymentId": <id of the payments row just inserted> }
```
- Use `BOOKING_SERVICE_URL` env var (already set in docker-compose).
- Include the `X-Internal-Token: <INTERNAL_TOKEN>` header (booking-service will reject the call without it).
- Do **not** send a JWT — this is a service-to-service call, not a user request.
- `paymentId` is stored in `bookings.confirmed_payment_id`; booking-service JOINs `payments` on this FK to return `paymentProvider` and `providerChargeId` in `GET /api/bookings/:ref`.
- If this call fails: **do not return 500**. Log it and return 201 anyway — the charge already succeeded.

#### Guard: reject duplicate payment

Before calling Omise, check if the booking is already `CONFIRMED`. If yes, return 409 `ALREADY_PAID`.
Query the booking status via the `bookings` table or call the booking service.

#### Test cards

| Card number | Result | failureCode |
|---|---|---|
| `4242 4242 4242 4242` | Success | — |
| `4111 1111 1111 1111` | Decline | `insufficient_fund` |

Use any future expiry (e.g. `12/2028`), any 3-digit CVV, any cardholder name.

---

### 5. `PUT /api/bookings/:bookingRef/status`

**File:** `services/booking/handler/booking.go` → `UpdateStatus`
**Repo:** `services/booking/repository/booking.go` → `UpdateStatus`

Called **only by payment-service** after a successful charge. Not a public endpoint.

This route is **excluded from the JWT middleware** — there is no user to authenticate. Guard it with the `X-Internal-Token` middleware only:

```
X-Internal-Token: <INTERNAL_TOKEN env var>
```

Return 403 if the header is missing or wrong. No 401 on this route.

```sql
UPDATE bookings
SET status = $1, confirmed_payment_id = $2, updated_at = NOW()
WHERE booking_ref = $3
```

Only `CONFIRMED` is a valid value in this challenge. Return 400 `INVALID_STATUS` for anything else.
If the booking_ref doesn't exist, return 404 `BOOKING_NOT_FOUND`.

> `confirmed_payment_id` is the `paymentId` from the request body. Storing it here is the traceability link — it lets `GET /api/bookings/:ref` return the Omise charge ID by JOINing `payments`.

---

### 6. `GET /api/bookings/:bookingRef`

**File:** `services/booking/handler/booking.go` → `GetByRef`
**Repo:** `services/booking/repository/booking.go` → `GetByRef`

Join bookings → passengers, flights → routes, and payments (LEFT JOIN for traceability):

```sql
SELECT b.id, b.booking_ref, b.status, b.total_amount_minor, b.currency, b.created_at,
       p.first_name, p.last_name, p.email, p.phone, p.passport_number, p.nationality,
       f.flight_number, r.origin_iata, r.destination_iata,
       f.departure_time, f.arrival_time,
       pay.payment_provider, pay.provider_charge_id
FROM bookings b
JOIN passengers p ON p.id = b.passenger_id
JOIN flights f    ON f.id = b.flight_id
JOIN routes r     ON r.id = f.route_id
LEFT JOIN payments pay ON pay.id = b.confirmed_payment_id
WHERE b.booking_ref = $1
```

> The LEFT JOIN means `payment_provider` and `provider_charge_id` are `NULL` for PENDING bookings, and populated for CONFIRMED bookings. Return them as `paymentProvider` and `providerChargeId` in the JSON response.

---

### 7. `GET /api/payments/:bookingRef`

**File:** `services/payment/handler/payment.go` → `GetByBookingRef`
**Repo:** `services/payment/repository/payment.go` → `GetByBookingRef`

```sql
SELECT id, booking_ref, booking_id, payment_provider, provider_charge_id,
       amount, currency, status, failure_code, failure_message, paid_at, created_at
FROM payments
WHERE booking_ref = $1
ORDER BY created_at DESC
LIMIT 1
```

Return the most recent payment for the booking (there may be multiple attempts).

---

## Infrastructure Requirements

### Health Check Endpoints

Two endpoints per service — **do not use a single `/health` for both**. They serve different purposes:

| Endpoint | Checks | Returns | Used by |
|---|---|---|---|
| `GET /health/live` | Nothing — just proves the process is running | Always `200` | Docker healthcheck |
| `GET /health/ready` | `db.PingContext` with 2 s timeout | `200` OK / `503` degraded | Docker healthcheck |

```go
r.GET("/health/live",  h.HealthLive)
r.GET("/health/ready", h.HealthReady)

func (h *Handler) HealthLive(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "flight-service"})
}

func (h *Handler) HealthReady(c *gin.Context) {
    ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
    defer cancel()
    if err := h.db.PingContext(ctx); err != nil {
        slog.Error("readiness check failed", "err", err)
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "status": "degraded", "service": "flight-service", "error": "database ping failed",
        })
        return
    }
    c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "flight-service"})
}
```

---

### Rate Limiting

Apply per-IP rate limiting using `golang.org/x/time/rate`. Use an in-memory store (map of IP → `rate.Limiter`).

| Endpoint | Requests per minute | Burst | Reason |
|---|---|---|---|
| `GET /api/flights/search` | 100 | 20 | High-volume read |
| `POST /api/bookings` | 30 | 5 | Write operation |
| `POST /api/payments/charge` | 10 | 3 | Sensitive financial endpoint |
| `GET /health/live` | 30 | 10 | Unauthenticated — DDoS protection |
| `GET /health/ready` | 30 | 10 | Unauthenticated — DDoS protection |

> Health endpoints are unauthenticated by design, which makes them reachable without a token — and therefore a potential DDoS vector. Rate limiting them prevents an attacker from flooding the service with health requests to exhaust resources.

On limit exceeded return **429 Too Many Requests**:
```json
{ "error": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please try again later." }
```

---

### Graceful Shutdown

Replace the bare `r.Run()` call in every service with a proper shutdown sequence:

```go
srv := &http.Server{Addr: ":" + port, Handler: r}

go func() {
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatalf("listen: %v", err)
    }
}()

quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
if err := srv.Shutdown(ctx); err != nil {
    log.Fatalf("forced shutdown: %v", err)
}
db.Close()
```

---

### Authentication (JWT RS256)

All API endpoints (except `/health/*`) require a valid **JWT RS256** bearer token.

```
Authorization: Bearer <token>
```

**How it works:**
- Tokens are signed with an RSA **private key** (`JWT_PRIVATE_KEY` — **test tooling only**, never loaded by any service at runtime).
- All three services verify incoming tokens using the RSA **public key** (`JWT_PUBLIC_KEY`).
- Algorithm: `RS256`. Required claims: `sub`, `exp`.
- Missing or invalid token → 401 `UNAUTHORIZED`

> **`PUT /api/bookings/:ref/status` is excluded from JWT** — it's a service-to-service call with no user. See the `X-Internal-Token` section below.

```go
import "github.com/golang-jwt/jwt/v5"

// Middleware — parse and verify token
func JWTMiddleware(publicKeyPEM string) gin.HandlerFunc {
    key, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(publicKeyPEM))
    return func(c *gin.Context) {
        tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
        token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
                return nil, fmt.Errorf("unexpected signing method")
            }
            return key, nil
        })
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "UNAUTHORIZED", "message": "missing or invalid token",
            })
            return
        }
        c.Next()
    }
}
```

Apply it globally in `main.go`:
```go
r.Use(middleware.JWTMiddleware(os.Getenv("JWT_PUBLIC_KEY")))
r.GET("/health/live", ...)   // health endpoints registered BEFORE the middleware
r.GET("/health/ready", ...)
```

> **Tip:** Use router groups to separate JWT-protected routes from unprotected ones:
> ```go
> // No JWT — health probes + internal service endpoint
> open := r.Group("/")
> open.GET("/health/live", ...)
> open.GET("/health/ready", ...)
> open.PUT("/api/bookings/:ref/status", middleware.InternalToken(...), h.UpdateStatus)
>
> // JWT required — all public API endpoints
> api := r.Group("/")
> api.Use(middleware.JWTMiddleware(os.Getenv("JWT_PUBLIC_KEY")))
> api.GET("/api/flights/search", ...)
> api.POST("/api/bookings", ...)
> // etc.
> ```

**For testing** — generate a token: `make jwt-token` (prints a Bearer token valid for 1 h, signed with `JWT_PRIVATE_KEY` from `.env`).

**For the internal `PUT /api/bookings/:ref/status` call** — this endpoint sits **outside** the JWT middleware. booking-service guards it with `InternalTokenMiddleware` only. payment-service sends `X-Internal-Token: <INTERNAL_TOKEN>`, no JWT.

```go
import "crypto/subtle"

// Internal-token middleware (booking-service only, on PUT /api/bookings/:ref/status route)
// Uses constant-time comparison to prevent timing attacks.
func InternalTokenMiddleware(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        got := c.GetHeader("X-Internal-Token")
        if subtle.ConstantTimeCompare([]byte(got), []byte(secret)) != 1 {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
                "error": "FORBIDDEN", "message": "internal token required",
            })
            return
        }
        c.Next()
    }
}
```

> **Security model:** `X-Internal-Token` proves the caller *knows the secret* — not that it is specifically payment-service. This is sufficient here because `booking-service:8082` is only reachable within the Docker Compose internal network (no `ports:` mapping for external access). The network boundary is the primary isolation; the token is a guard against accidental miscalls from other containers.
>
> **Token strength matters.** Generate it with `openssl rand -hex 32` (256 bits of entropy). A weak or default value makes the guard worthless. booking-service should refuse to start if `INTERNAL_TOKEN` is empty:
> ```go
> secret := os.Getenv("INTERNAL_TOKEN")
> if secret == "" {
>     slog.Error("INTERNAL_TOKEN is required")
>     os.Exit(1)
> }
> ```

---

### Structured Logging (JSON)

Replace all `log.Printf` with `slog` (Go stdlib since 1.21). JSON output is required.

```go
// main.go — set once at startup
slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))

// In handlers
slog.Error("GetFlightByID failed", "id", id, "err", err)
slog.Info("charge succeeded", "bookingRef", req.BookingRef, "chargeId", charge.ID)
```

Add a Gin middleware that logs one JSON line per request with `method`, `path`, `status`, `latency_ms`.

---

## Implementation Requirements

### Requirement 1 — Always return JSON

Every response (including errors) must have `Content-Type: application/json`. Never return raw text.

### Requirement 2 — Error response shape

```json
{ "error": "ERROR_CODE", "message": "Human-readable explanation." }
```

`error` — `UPPER_SNAKE_CASE` machine-readable code
`message` — plain English; never a raw Go error or SQL message

### Requirement 3 — Correct HTTP status codes

| Situation | Status |
|---|---|
| Successful retrieval | `200 OK` |
| Successful creation | `201 Created` |
| Missing or invalid field | `400 Bad Request` |
| Missing or invalid JWT | `401 Unauthorized` |
| Card declined | `402 Payment Required` |
| Wrong `X-Internal-Token` | `403 Forbidden` |
| Resource not found | `404 Not Found` |
| Business rule conflict (already paid, no seats) | `409 Conflict` |
| Rate limit exceeded | `429 Too Many Requests` |
| Unexpected server error | `500 Internal Server Error` |

### Requirement 4 — Log internally, hide externally

```go
if err != nil {
    slog.Error("GetFlightByID failed", "id", id, "err", err)   // full detail in logs
    c.JSON(500, gin.H{"error": "INTERNAL_ERROR", "message": "An unexpected error occurred."})
    return
}
```

### Requirement 5 — Never swallow errors

Every `err` return value must be checked. Ignoring an error and continuing is a bug.

### Requirement 6 — Payment-service must never write to the bookings table directly

Payment-service owns the `payments` table only. It must **never** `UPDATE bookings` directly via SQL.
Booking status changes go exclusively through `PUT http://booking-service:8082/api/bookings/:ref/status`.

This is enforced in unit tests: the booking-service is a **mock interface** injected into payment-service. If payment-service issues a direct DB write to `bookings`, the test will not catch it via the mock — treat any direct `bookings` SQL in payment-service as a failing criterion.

### Requirement 7 — Payment→booking failure

After a successful Omise charge, if `PUT /api/bookings/:ref/status` call fails:
- **Do not** return 500
- **Do** log the failure with the charge ID and `bookingRef`
- **Do** return 201 with the charge result — the money was taken, the client must know

### Requirement 8 — All money is minor units (satang); no floats in business logic

- Every monetary column in the DB is `BIGINT` (`_minor` suffix): `base_price_minor`, `total_amount_minor`, `amount_minor`
- Every monetary variable in Go is `int64`
- Conversion to/from THB (`÷100` / `×100`) happens **only in handlers** when reading request bodies or writing JSON responses
- Never pass `float64` for an amount through a service or repository function
- Every monetary field in API requests and responses is a triple: `*Minor` (int64 satang), `currency`, and `*` (formatted display string, e.g. `"3500.00"`); never return or accept a JSON float for a monetary amount
- `booking.total_amount_minor` must equal `payment.amount_minor` — payment-service validates this before calling Omise (400 `AMOUNT_MISMATCH` if they differ)

### Requirement 9 — Concurrent booking must use SELECT FOR UPDATE

`CreateBooking` must lock the flights row before checking and decrementing `available_seats`:
```sql
SELECT available_seats FROM flights WHERE id = $1 FOR UPDATE
```
Without this lock, two concurrent requests on a 1-seat flight can both read `available_seats = 1`, both pass the check, and both insert — resulting in overbooking. The integration test for concurrent booking validates this.

### Requirement 10 — `PUT /api/bookings/:ref/status` happy path must be contract-tested

The internal status endpoint must be verified end-to-end (not just the 403 rejection):
- A valid `X-Internal-Token` + `{status: CONFIRMED, paymentId: N}` → 200, booking flips to CONFIRMED
- This is required in Layer 3 contract tests running against the live stack

### Error code reference

**All services (applied by JWT middleware)**

| Scenario | Status | `error` |
|---|---|---|
| Missing or invalid `Authorization` header / expired JWT | 401 | `UNAUTHORIZED` |

**booking-service only — `PUT /api/bookings/:ref/status` (no JWT, internal-token middleware only)**

| Scenario | Status | `error` |
|---|---|---|
| Missing or wrong `X-Internal-Token` | 403 | `FORBIDDEN` |

**flight-service**

| Scenario | Status | `error` |
|---|---|---|
| `origin`, `destination`, or `date` missing | 400 | `MISSING_REQUIRED_FIELD` |
| `date` not valid YYYY-MM-DD | 400 | `INVALID_DATE_FORMAT` |
| `passengers` not a positive integer | 400 | `INVALID_FIELD` |
| Flight `:id` not found | 404 | `FLIGHT_NOT_FOUND` |
| DB error | 500 | `INTERNAL_ERROR` |

**booking-service**

| Scenario | Status | `error` |
|---|---|---|
| `flightId`, `passenger.firstName/lastName/email` missing | 400 | `MISSING_REQUIRED_FIELD` |
| `available_seats` is 0 | 409 | `NO_SEATS_AVAILABLE` |
| Booking `:bookingRef` not found | 404 | `BOOKING_NOT_FOUND` |
| PUT status value not `CONFIRMED` | 400 | `INVALID_STATUS` |
| DB error | 500 | `INTERNAL_ERROR` |

**payment-service**

| Scenario | Status | `error` |
|---|---|---|
| `bookingRef`, `bookingId`, `omiseToken`, `amountMinor` missing | 400 | `MISSING_REQUIRED_FIELD` |
| `amountMinor` ≤ 0 | 400 | `INVALID_FIELD` |
| `amountMinor` or `currency` does not match booking | 400 | `AMOUNT_MISMATCH` |
| Booking already `CONFIRMED` | 409 | `ALREADY_PAID` |
| Card declined by Omise | 402 | `payment_failed` (lowercase — matches Omise vocabulary) |
| No payment found for `:bookingRef` | 404 | `PAYMENT_NOT_FOUND` |
| DB error | 500 | `INTERNAL_ERROR` |

---

## Testing Requirements

### Layer 1 — Unit Tests

`go test ./...` in each service. All DB and HTTP calls mocked with `testify/mock`.
Define a repository **interface**, implement it in production, mock it in tests.

| Service | Method | Cases to cover |
|---|---|---|
| flight-service | `SearchFlights` | valid params → flights; no match → empty slice; blank origin → error |
| flight-service | `GetFlightByID` | valid id → flight; unknown id → ErrNotFound |
| booking-service | `CreateBooking` | PNR is 6 chars; passenger insert called; booking insert called with correct `flightId` and `total_amount_minor` copied from flight; repo mock verifies `SELECT FOR UPDATE` called before decrement |
| booking-service | `GetBookingByRef` | returns nested flight+passenger+paymentProvider+providerChargeId (non-nil when CONFIRMED); unknown ref → ErrNotFound |
| booking-service | `UpdateBookingStatus` | updates status; unknown ref → ErrNotFound |
| payment-service | `Charge` — amount mismatch | `req.amountMinor != booking.total_amount_minor`; Omise **never called**; returns 400 `AMOUNT_MISMATCH` |
| payment-service | `Charge` — success | Omise mock returns successful; DB insert with `status=SUCCEEDED`, `amount_minor` matching booking; booking-service mock `PUT /api/bookings/:ref/status` called once with `{status:CONFIRMED, paymentId:X}`; returns 201 |
| payment-service | `Charge` — decline | Omise mock returns failed; DB insert with `status=FAILED`; booking-service `PUT /api/bookings/:ref/status` **never called**; returns 402 with `failureCode` |
| payment-service | `Charge` — already paid | booking-service mock returns `CONFIRMED`; Omise **never called**; booking-service `PUT /api/bookings/:ref/status` **never called**; returns 409 `ALREADY_PAID` |
| payment-service | `Charge` — PUT /api/bookings/:ref/status fails | Omise mock returns successful; DB insert with SUCCEEDED; booking-service mock returns error on `PUT /api/bookings/:ref/status`; **still returns 201** (charge succeeded); error logged |
| payment-service | `GetByBookingRef` | returns 200 with `paymentProvider` + `providerChargeId`; unknown ref → 404 |
| middleware | `JWTMiddleware` | valid token → passes through; missing token → 401; expired token → 401; wrong algorithm → 401 |
| middleware | `InternalTokenMiddleware` | correct token → passes through; missing header → 403; wrong value → 403 |

### Layer 2 — Integration Tests

`go test ./... -tags=integration`. Use `testcontainers-go` — start a real PostgreSQL container, apply the schema and seed SQL, then run tests against it.

| Service | What to test |
|---|---|
| flight-service | Search returns ≥1 flight for BKK→SIN `date=2026-06-15`; empty slice for unknown route; `GetByID(1)` correct; `GetByID(99999)` ErrNotFound |
| booking-service | `CreateBooking()` writes to `passengers` + `bookings`; PNR is unique; `total_amount_minor` equals `flights.base_price_minor`; `GetByRef("SEED02")` returns full join (uses pre-seeded PENDING booking) |
| booking-service | Concurrent `CreateBooking()` — run 2 goroutines simultaneously on a flight with 1 seat; exactly 1 succeeds (201) and 1 returns 409 `NO_SEATS_AVAILABLE`; `available_seats` ends at 0 |
| payment-service | `Insert()` writes to `payments` with correct `amount_minor`; `FindByBookingRef("SEED01")` returns SUCCEEDED record with matching `amount_minor`; unknown ref → ErrNotFound |

### Layer 3 — Contract Tests

Run against live `docker compose` stack. All requests must include `Authorization: Bearer $TOKEN` (see `make jwt-token`).

| Test | Pass condition |
|---|---|
| `GET /api/flights/search` — missing origin | 400 `MISSING_REQUIRED_FIELD` |
| `GET /api/flights/1` | 200 with `id`, `flightNumber`, `origin`, `destination`, `durationMinutes` |
| `GET /api/flights/99999` | 404 `FLIGHT_NOT_FOUND` |
| `POST /api/bookings` — valid body, `flightId=1` | 201; `bookingRef` exactly 6 chars; `bookingId` integer |
| `POST /api/bookings` — `flightId=6` (QM999 SOLD OUT) | 409 `NO_SEATS_AVAILABLE` |
| `GET /api/bookings/SEED01` | 200; `status=CONFIRMED`; `paymentProvider=OMISE`; `providerChargeId=chrg_test_seed01xxxxxxxxxx` (traceability check) |
| `GET /api/bookings/SEED02` | 200; `bookingRef`, `status`, `flight`, `passenger` all present; `paymentProvider=null`, `providerChargeId=null` (PENDING) |
| `GET /api/bookings/XXXXXX` | 404 `BOOKING_NOT_FOUND` |
| `POST /api/payments/charge` — `bookingRef=SEED01` (CONFIRMED) | 409 `ALREADY_PAID` (no Omise call — pure DB guard) |
| `POST /api/payments/charge` — success card `4242…` | 201; `providerChargeId` present; `paymentProvider=OMISE`; subsequent `GET /api/bookings/:ref` returns `status=CONFIRMED` and matching `providerChargeId` |
| `POST /api/payments/charge` — decline card `4111…` | 402; `failureCode` present; booking stays `PENDING` |
| `GET /api/payments/SEED01` | 200; `status=SUCCEEDED`; `paymentProvider=OMISE`; `providerChargeId` non-empty |
| `GET /api/payments/SEED02` | 200; `status=FAILED`; `failureCode=insufficient_fund` |
| `GET /api/flights/search` — no `Authorization` header | 401 `UNAUTHORIZED` |
| `PUT /api/bookings/SEED02/status` — valid `X-Internal-Token`, body `{status:CONFIRMED, paymentId:1}` | 200; subsequent `GET /api/bookings/SEED02` returns `status=CONFIRMED` |
| `PUT /api/bookings/SEED01/status` — no `X-Internal-Token` | 403 `FORBIDDEN` (no JWT required on this route) |
| `POST /api/payments/charge` — `amountMinor` differs from booking | 400 `AMOUNT_MISMATCH`; Omise not called |
| `GET /health/live` + `GET /health/ready` — no `Authorization` header | 200 on all 3 services (health endpoints are unprotected) |

### Layer 4 — Load Tests (K6)

```bash
k6 run tests/k6/search.js         # 50 VUs × 30 s
k6 run tests/k6/booking-flow.js   # 20 VUs × 60 s
```

| Script | Threshold |
|---|---|
| `search.js` | p95 < 500 ms, error rate < 1% |
| `booking-flow.js` | p95 < 3000 ms, error rate < 2% |

---

## Constraints

- Do not modify `infra/db/01_schema.sql` or `infra/db/02_seed.sql`
- Do not change service ports or the core `docker-compose.yml` structure
- Omise must be in **test mode only** — never use live keys
- `bookingRef` must be exactly 6 uppercase alphanumeric characters
- `.env` must not be committed (it is in `.gitignore`)
- Rate limiting must be per-IP (not global)
- Payment is **credit card only** — do not add webhook handlers
- `INTERNAL_TOKEN` must be a high-entropy random value (`openssl rand -hex 32`); booking-service must refuse to start if it is empty
- `JWT_PRIVATE_KEY` must never be loaded by any running service — test tooling only
- Use `crypto/subtle.ConstantTimeCompare` for all secret comparisons (never `==`)
- No hardcoded secrets in `.go` files (`go vet` and `grep` checks will catch `skey_test` / `pkey_test`)

---

## Scoring

See `SCORECARD.md` for the full rubric.

| Pillar | Points |
|---|---|
| Working Software — all 7 endpoints return correct responses end-to-end | 25 |
| Testing — unit + integration + contract + K6 | 35 |
| Code Quality — layered arch, error handling, clean Go | 20 |
| Infrastructure & Security — health probes, rate limiting, graceful shutdown, logs, JWT auth, internal token | 20 |

---

## FAQ

**Q: Where do I start?**
Implement the endpoints in order: Search → GetFlight → CreateBooking → Charge → UpdateStatus → GetBooking → GetPayment. Each one builds on the previous.

**Q: What is satang?**
Omise requires amounts in the smallest currency unit (like Stripe's cents). 1 THB = 100 satang. 3,500 THB = `350000`. The `payments.amount_minor` column stores satang. Pass satang when creating a charge. `request.amountMinor` must equal `booking.total_amount_minor` — validate before calling Omise.

**Q: Why do I need both `bookingRef` and `bookingId` for payment?**
`bookingRef` is the 6-char PNR used as a human-readable identifier. `bookingId` is the numeric DB row id. Omise doesn't know about either — you just need them to link the payment record back to the booking.

**Q: My payment succeeded but GET /api/bookings still shows PENDING.**
The payment service must call `PUT /api/bookings/{ref}/status` internally after a successful charge. If you haven't implemented that PUT handler yet, or haven't wired the HTTP call in payment-service, the status won't update.

**Q: How does payment-service call booking-service?**
Via HTTP using the `BOOKING_SERVICE_URL` env var (already `http://booking-service:8082` in docker-compose). Make an HTTP PUT call in the Charge handler after recording the SUCCEEDED payment.

**Q: Do I need a public URL for Omise callbacks?**
No. Credit card charges are synchronous — Omise returns the result in the same API call. No webhook, no public URL needed.

**Q: Do I need authentication?**
Yes, but differently per caller type. Client-facing endpoints (`/api/*` except `PUT /api/bookings/:ref/status`) require `Authorization: Bearer <jwt>` (RS256, verified by `JWT_PUBLIC_KEY`). The internal `PUT /api/bookings/:ref/status` endpoint is excluded from JWT — it only accepts `X-Internal-Token`. Use `make jwt-token` to generate a test token for curl.

**Q: Can I add packages to go.mod?**
Yes. The existing `go.mod` already includes Gin, `lib/pq`, and the Omise SDK. Add anything you need.

**Q: What is `PUT /api/bookings/:ref/status`? Users don't call it?**
Correct. It's called internally by payment-service after a successful charge to flip the booking from PENDING to CONFIRMED. It's not exposed to end users but it must exist for the end-to-end flow to work.

**Q: What does booking `status` mean?**
`PENDING` = booked, not yet paid. `CONFIRMED` = paid successfully. Payment-service is responsible for calling booking-service to set CONFIRMED.

**Q: Should I build a checkin-service or touch the `checkins` table?**
No. Ignore them entirely — out of scope.
