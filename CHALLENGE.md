# Qoomlee Airline — Agent Skills Challenge

> **Scope (final, locked):** REST API only. No frontend. No check-in. No boarding pass. No seat picker.
> **Stack:** Go + Gin for all services. PostgreSQL. Omise for payments. K6 for load testing.

---

## Use Case & Sequence Diagrams

Before coding, read the diagrams — they show exactly which endpoints exist, what each one does, and why.

| File | What it shows |
|---|---|
| `diagrams/use-case.d2` | All 7 use cases mapped to endpoints; which are public vs internal |
| `diagrams/sequence-happy-path.d2` | Full 7-step happy path with exact SQL and JSON |
| `diagrams/sequence-payment-failure.d2` | Decline → retry flow + the ALREADY_PAID guard |

Render with [D2](https://d2lang.com): `d2 diagrams/sequence-happy-path.d2 happy-path.svg`

---

## What You Are Building

```
[1] Search Flights      GET  /api/flights/search          ✅ working
[2] View Flight Detail  GET  /api/flights/:id              🔨 build
[3] Create Booking      POST /api/bookings                 ✅ working
[4] Pay for Booking     POST /api/payments/charge          ✅ working
[5] View Booking + PNR  GET  /api/bookings/:bookingRef     🔨 build
[6] View Payment        GET  /api/payments/:bookingRef     🔨 build
[7] Update Status       PUT  /api/bookings/:ref/status     🔨 build (internal — called by payment-service after step 4)
```

**4 endpoints to build.** 3 are public GET endpoints. 1 is an internal PUT used only by the payment service to flip booking status from `PENDING` → `CONFIRMED` after a successful charge.

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
# 1. Get Omise test API keys (free, instant)
#    → https://dashboard.omise.co  → sign up → Dashboard → API Keys → Test keys
#    Copy pkey_test_... and skey_test_...

# 2. Set up environment
cp .env.example .env
# Edit .env — put your Omise test keys in OMISE_PUBLIC_KEY and OMISE_SECRET_KEY

# 3. Start all services
docker compose up --build

# 4. Wait ~15 seconds, then verify:
curl "http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"
# Expected: JSON with a "flights" array containing results
```

---

## Technology Stack

| Service | Language | Framework | Port |
|---|---|---|---|
| API Gateway | Go | Gin | 8080 |
| flight-service | Go | Gin | 8081 |
| booking-service | Go | Gin | 8082 |
| payment-service | Go | Gin | 8084 |
| checkin-service | Go | Gin | 8083 (ignore — out of scope) |
| Database | — | PostgreSQL 16 | 5432 |

**All tests:** `go test ./...` with `testify` assertions and `testify/mock` for unit tests.
**Load tests:** K6 (`brew install k6` or `apt install k6`).

**Important:** All requests go through the **API Gateway on port 8080**. Never call services directly in tests or demos.

---

## Service Map

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  API Gateway :8080                  │
                    └────────┬─────────────┬─────────────┬───────────────┘
                             │             │             │
                    ┌────────▼──┐  ┌───────▼──┐  ┌──────▼─────────┐
                    │ flight    │  │ booking  │  │ payment        │
                    │ service   │  │ service  │  │ service        │
                    │ :8081     │  │ :8082    │  │ :8084          │
                    └────────┬──┘  └───────┬──┘  └──────┬─────────┘
                             │             │  ◄──────────┘ (PUT /status)
                             └─────────────┴──────────────────────────────►  PostgreSQL :5432
                                                                    ◄──►  Omise API (external)
```

---

## The Database

One shared PostgreSQL database. **Do not modify the schema.**

### Seed flights

| DB id | Flight | Route | Departure (local BKK, UTC+7) | Base price | Available seats |
|---|---|---|---|---|---|
| 1 | QM101 | BKK → SIN | 2026-06-15 08:00 | 3,500 THB | 156 |
| 2 | QM102 | BKK → SIN | 2026-06-15 14:00 | 2,800 THB | 30 |
| 3 | SC201 | BKK → SIN | 2026-06-15 10:00 | 2,200 THB | 78 |
| 4 | QM201 | BKK → HKG | 2026-06-15 07:30 | 4,500 THB | 200 |
| 5 | QM301 | BKK → NRT | 2026-06-15 23:55 | 9,800 THB | 150 |

> Times stored as `TIMESTAMPTZ`. The DB stores them in UTC: 08:00 BKK = 01:00 UTC.

### Key tables

```
flights    — id, flight_number, route_id, departure_time, arrival_time, base_price, available_seats, status
routes     — id, origin_iata, destination_iata
bookings   — id, booking_ref (CHAR 6), flight_id, passenger_id, status, total_amount, currency
passengers — id, first_name, last_name, email, phone, passport_number, date_of_birth, nationality
payments   — id, booking_ref, booking_id, amount (satang), status, omise_charge_id, failure_code, paid_at
```

Full schema: `infra/db/01_schema.sql` — Seed data: `infra/db/02_seed.sql`

---

## What Is Already Working

### `GET /api/flights/search`

```bash
curl "http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"
```

Response `200 OK`:
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
    }
  ]
}
```

---

### `POST /api/bookings`

One passenger per booking. Set `totalAmount` to the flight's `basePrice`.

```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": 1,
    "passenger": {
      "firstName": "Somchai",
      "lastName":  "Jaidee",
      "email":     "somchai@example.com",
      "phone":     "+66812345678",
      "passportNumber": "AA123456",
      "dateOfBirth":    "1990-05-15",
      "nationality":    "TH"
    },
    "totalAmount": 3500.00,
    "currency": "THB"
  }'
```

Response `201 Created`:
```json
{
  "bookingRef": "QM7X2K",
  "bookingId":  42,
  "status":     "PENDING",
  "message":    "Booking created. Proceed to payment."
}
```

> **Save both `bookingRef` and `bookingId`** — you need both when calling the payment endpoint.

---

### `POST /api/payments/charge`

> **Omise amounts are in satang** (1 THB = 100 satang). Always multiply THB by 100.
> 3,500 THB → send `350000`.

> **Why is this synchronous? Why credit card only?**
>
> Omise credit card charges return the final result **immediately** in the same API call.
> You call `CreateCharge(...)` → Omise responds in ~300 ms with `charge.Status = "successful"` or `"failed"`.
> No webhook. No callback URL. No public endpoint needed on your side.
>
> Other Omise payment methods (PromptPay, internet banking, instalments) are **async** — Omise calls
> _your_ server via webhook when the customer completes payment on their end. That requires a publicly
> reachable URL and a separate webhook handler. Those methods are out of scope for this challenge.
> **Credit card = synchronous = no webhook needed.**

**Step A — Get a single-use Omise token first:**

```bash
# Replace pkey_test_xxx with your actual OMISE_PUBLIC_KEY from .env
curl https://vault.omise.co/tokens \
  -u pkey_test_xxx: \
  -d "card[number]=4242424242424242" \
  -d "card[expiration_month]=12" \
  -d "card[expiration_year]=2028" \
  -d "card[security_code]=123" \
  -d "card[name]=SOMCHAI JAIDEE"
# → copy the "id" field: "tokn_test_xxxx"
```

**Step B — Charge:**

```bash
curl -X POST http://localhost:8080/api/payments/charge \
  -H "Content-Type: application/json" \
  -d '{
    "bookingRef":  "QM7X2K",
    "bookingId":   42,
    "omiseToken":  "tokn_test_xxxx",
    "amount":      350000,
    "currency":    "THB"
  }'
```

Response `201 Created` (success):
```json
{
  "paymentId":     1,
  "omiseChargeId": "chrg_test_5fzddg8p5j3qhp1w5jg",
  "status":        "SUCCEEDED",
  "amount":        350000,
  "currency":      "THB",
  "paidAt":        "2026-05-22T10:05:00Z"
}
```

Response `402 Payment Required` (card declined):
```json
{
  "error":          "payment_failed",
  "failureCode":    "insufficient_fund",
  "failureMessage": "The card has insufficient funds."
}
```

---

## What You Must Build

### 1. `GET /api/flights/:id` — Flight Detail

**File:** `services/flight-service/handler/flight.go`

The `GetByID` stub returns 501. Replace it.

- Query: `SELECT f.*, r.origin_iata, r.destination_iata FROM flights f JOIN routes r ON f.route_id = r.id WHERE f.id = $1`
- Compute `durationMinutes` from `arrival_time - departure_time`

Response `200 OK`:
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

Response `404 Not Found`:
```json
{ "error": "FLIGHT_NOT_FOUND", "message": "Flight 999 not found" }
```

---

### 2. `GET /api/bookings/:bookingRef` — Booking Detail

**File:** `services/booking-service/handler/booking.go`

The `GetByRef` stub returns 501. Replace it.

Join `bookings` → `passengers` and `bookings` → `flights` → `routes`. The booking repository already has `FindByRef` — add `FindByRefWithDetails` or run the join query directly.

Response `200 OK`:
```json
{
  "bookingRef": "QM7X2K",
  "status": "CONFIRMED",
  "flight": {
    "id": 1,
    "flightNumber": "QM101",
    "origin": "BKK",
    "destination": "SIN",
    "departureTime": "2026-06-15T01:00:00Z",
    "arrivalTime":   "2026-06-15T03:30:00Z"
  },
  "passenger": {
    "firstName":      "Somchai",
    "lastName":       "Jaidee",
    "email":          "somchai@example.com",
    "phone":          "+66812345678",
    "passportNumber": "AA123456",
    "nationality":    "TH"
  },
  "totalAmount": 3500.00,
  "currency":    "THB",
  "createdAt":   "2026-05-22T10:00:00Z"
}
```

Response `404 Not Found`:
```json
{ "error": "BOOKING_NOT_FOUND", "message": "Booking QM9999 not found" }
```

---

### 3. `PUT /api/bookings/:bookingRef/status` — Update Booking Status (internal)

**File:** `services/booking-service/handler/booking.go`

This endpoint is **not called by end users** — it is called only by the payment-service after a successful Omise charge. The payment-service has `BOOKING_SERVICE_URL=http://booking-service:8082` already injected.

Request body:
```json
{ "status": "CONFIRMED" }
```

Response `200 OK`:
```json
{ "bookingRef": "QM7X2K", "status": "CONFIRMED" }
```

Response `404 Not Found`:
```json
{ "error": "BOOKING_NOT_FOUND", "message": "Booking QM9999 not found" }
```

> Only `CONFIRMED` is a valid status update in this challenge. You may reject any other value with 400.

---

### 4. `GET /api/payments/:bookingRef` — Payment Status

**File:** `services/payment-service/handler/payment.go`

The `GetByBookingRef` stub is already at line 110 — returns 501. Replace it.

Add `FindByBookingRef(bookingRef string) (*model.Payment, error)` to `repository/payment.go`, then call it from the handler.

Response `200 OK`:
```json
{
  "bookingRef":    "QM7X2K",
  "status":        "SUCCEEDED",
  "omiseChargeId": "chrg_test_5fzddg8p5j3qhp1w5jg",
  "amount":        350000,
  "currency":      "THB",
  "paidAt":        "2026-05-22T10:05:00Z"
}
```

Response `404 Not Found`:
```json
{ "error": "PAYMENT_NOT_FOUND", "message": "No payment found for booking QM9999" }
```

> `amount` is in satang everywhere in this service (matches what was sent to Omise and stored in DB).

---

### 5. Guard: reject duplicate payment in `POST /api/payments/charge`

Before calling Omise, check whether the booking is already `CONFIRMED`. If yes, return 409. This is needed so a retry after failure works correctly without double-charging.

```
GET http://booking-service:8082/api/bookings/{bookingRef}
→ if status == "CONFIRMED" → return 409 {"error":"ALREADY_PAID", ...}
→ if status == "PENDING"   → proceed with charge
```

Or query the `payments` table directly for an existing `SUCCEEDED` row.

---

## Infrastructure Requirements

These are production-readiness requirements scored under **Pillar 4**.

---

### 6. Health Check Endpoints

Every service must expose **two** health endpoints — one for liveness, one for readiness. Using a single endpoint for both is an anti-pattern: if the DB goes down, a liveness check failure causes Kubernetes to **restart the pod**, which doesn't fix the DB and creates a crash-loop. Keep them separate.

| Endpoint | Purpose | Checks | Used by |
|---|---|---|---|
| `GET /health/live` | Is the process itself alive? | None — just returns 200 | K8s `livenessProbe`, api-gateway Docker healthcheck |
| `GET /health/ready` | Is the service ready to serve traffic? | DB `PingContext` (2 s timeout) | K8s `readinessProbe`, all service Docker healthchecks |

**`GET /health/live` — Response `200 OK` (always, unless process is frozen):**
```json
{ "status": "ok", "service": "flight-service" }
```

**`GET /health/ready` — Response `200 OK` (DB reachable):**
```json
{ "status": "ok", "service": "flight-service" }
```

**`GET /health/ready` — Response `503 Service Unavailable` (DB unreachable):**
```json
{ "status": "degraded", "service": "flight-service", "error": "database ping failed" }
```

```go
func (h *FlightHandler) RegisterRoutes(r *gin.Engine) {
    r.GET("/health/live",  h.HealthLive)
    r.GET("/health/ready", h.HealthReady)
    // ... other routes
}

func (h *FlightHandler) HealthLive(c *gin.Context) {
    // Lightweight — just proves the process is running
    c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "flight-service"})
}

func (h *FlightHandler) HealthReady(c *gin.Context) {
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

> The api-gateway has no DB, so both `/health/live` and `/health/ready` return 200 unconditionally.

---

### 7. Rate Limiting

Apply per-IP rate limiting using `golang.org/x/time/rate` or any Gin middleware. Add it as a middleware registered before the route handlers.

| Endpoint | Limit | Burst |
|---|---|---|
| `GET /api/flights/search` | 100 req/min | 20 |
| `POST /api/bookings` | 30 req/min | 5 |
| `POST /api/payments/charge` | 10 req/min | 3 |

When the limit is exceeded return **429 Too Many Requests**:
```json
{ "error": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please try again later." }
```

> You may use a simple in-memory store (map of IP → `rate.Limiter`). Production would use Redis — out of scope here.

---

### 8. Graceful Shutdown

Replace the bare `r.Run(":PORT")` call in every service `main.go` with a proper shutdown sequence. The service must:

1. Listen for `SIGTERM` or `SIGINT`
2. Stop accepting new connections
3. Allow in-flight requests up to **10 seconds** to finish
4. Close the database connection cleanly

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
log.Println("shutting down...")

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
if err := srv.Shutdown(ctx); err != nil {
    log.Fatalf("forced shutdown: %v", err)
}
```

---

### 9. Structured Logging (JSON)

Replace all `log.Printf(...)` with JSON-structured logs using Go's stdlib `log/slog` (available since Go 1.21). Kubernetes log aggregators (Loki, ELK) expect JSON.

Every log entry must include: `time`, `level`, `service`, `msg`.

```go
// main.go — initialise once at startup
logger := slog.New(slog.NewJSONHandler(os.Stderr, nil))
slog.SetDefault(logger)

// In handlers
slog.Error("GetFlightByID failed", "id", id, "err", err)
slog.Info("charge succeeded", "bookingRef", req.BookingRef, "chargeId", charge.ID)
```

Add a Gin logging middleware that emits one JSON log line per request:
```json
{"time":"2026-05-24T10:00:00Z","level":"INFO","service":"flight-service","msg":"request",
 "method":"GET","path":"/api/flights/1","status":200,"latency_ms":4}
```

---

### 10. Kubernetes Manifests

Complete the skeleton manifests in `infra/k8s/`. When applied to a cluster with `kubectl apply -f infra/k8s/`, all services must start and be reachable through the `api-gateway` Service.

```bash
# Verify (minikube / kind / any cluster)
kubectl apply -f infra/k8s/
kubectl get pods -n qoomlee
# All pods → Running
kubectl get svc -n qoomlee
# api-gateway exposed as NodePort or LoadBalancer
```

**Each service manifest must have:**
- Docker image reference (fill in your registry path)
- All env vars wired from the `ConfigMap` and `Secret`
- CPU and memory `requests` + `limits`
- `livenessProbe` and `readinessProbe` pointing to `GET /health`

**api-gateway must have:**
- `replicas: 2`
- A `HorizontalPodAutoscaler` targeting 70% CPU → max 5 replicas

Skeleton files are in `infra/k8s/`. Lines marked `# TODO` must be filled in.

---

## Testing Requirements

### Layer 1 — Unit Tests (`go test ./...` in each service)

All dependencies mocked with `testify/mock`. No database, no HTTP calls.

| Service | What to test | Cases |
|---|---|---|
| flight-service | `SearchFlights()` | returns flights for valid params; returns empty slice for no match; returns error for blank origin |
| flight-service | `GetFlightByID()` | returns flight struct; returns `ErrNotFound` for unknown id |
| booking-service | `CreateBooking()` | PNR is 6 chars uppercase alphanumeric; passenger insert called; booking insert called with correct flightId |
| booking-service | `GetBookingByRef()` | returns booking with nested flight + passenger; returns `ErrNotFound` for unknown ref |
| booking-service | `UpdateBookingStatus()` | updates status in DB; returns error for unknown ref |
| payment-service | `Charge()` — success | mock Omise returns successful charge; DB insert called with `status="SUCCEEDED"`; calls booking-service /status; returns 201 |
| payment-service | `Charge()` — decline | mock Omise returns failure; DB insert called with `status="FAILED"`; does NOT call booking-service; returns 402 with `failureCode` |
| payment-service | `Charge()` — already paid | mock booking returns `CONFIRMED`; returns 409 before touching Omise |
| payment-service | `GetByBookingRef()` | returns 200 with payment; returns 404 for unknown ref |

### Layer 2 — Integration Tests (real DB via `testcontainers-go`)

Start a real PostgreSQL container, run the migration SQL, insert seed data, then test.

| Service | What to test |
|---|---|
| flight-service | Search returns seed flights for BKK→SIN 2026-06-15; GetByID returns correct flight; 0 results for unknown route |
| booking-service | `CreateBooking` writes rows to `passengers` and `bookings`; PNR in DB is 6 chars unique; `GetByRef` returns full join result |
| payment-service | `Insert` writes to `payments` table with correct `booking_ref`; `FindByBookingRef` returns the row; `FindByBookingRef` returns `ErrNotFound` for unknown ref |

### Layer 3 — API Contract Tests (live `docker compose` stack)

Use `curl`, `httpie`, or Go's `net/http` test client. Test against `http://localhost:8080`.

| Endpoint | Must verify |
|---|---|
| `GET /api/flights/search` | 400 when `origin` missing; 200 with `flights` array |
| `GET /api/flights/1` | 200 with `id`, `flightNumber`, `durationMinutes` keys |
| `GET /api/flights/99999` | 404 |
| `POST /api/bookings` | 201 with exactly-6-char `bookingRef`; 400 when `passenger.email` missing |
| `GET /api/bookings/XXXXXX` | 404 |
| `GET /api/bookings/{validRef}` | 200 with `bookingRef`, `status`, `flight`, `passenger` keys |
| `POST /api/payments/charge` (success card) | 201 with `omiseChargeId`; booking status becomes `CONFIRMED` |
| `POST /api/payments/charge` (decline card `4111…`) | 402 with `failureCode`; booking stays `PENDING` |
| `POST /api/payments/charge` (already paid) | 409 with `ALREADY_PAID` |
| `GET /api/payments/{validRef}` | 200 with `status`, `omiseChargeId` |
| `GET /api/payments/XXXXXX` | 404 |

### Layer 4 — Load Tests (K6)

Scripts live in `tests/k6/`. Run against live stack.

**Install K6:**
```bash
brew install k6        # macOS
# or: apt install k6   # Ubuntu
```

**Run:**
```bash
k6 run tests/k6/search.js
k6 run tests/k6/booking-flow.js
```

| Script | Scenario | Threshold |
|---|---|---|
| `search.js` | 50 virtual users × 30 s hitting `GET /api/flights/search` | p95 < 500 ms, error rate < 1% |
| `booking-flow.js` | 20 virtual users × 60 s doing full flow: search → book → pay | p95 < 3000 ms, error rate < 2% |

---

## Full Happy-Path Walkthrough

Run these in order to verify everything works end-to-end.

```bash
# 1. Search
curl "http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"
# → note id (e.g. 1) and basePrice (e.g. 3500.00)

# 2. Flight detail
curl "http://localhost:8080/api/flights/1"
# → durationMinutes present

# 3. Book (use basePrice as totalAmount)
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"flightId":1,"passenger":{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+66800000000","passportNumber":"AA000000","dateOfBirth":"1990-01-01","nationality":"TH"},"totalAmount":3500.00,"currency":"THB"}'
# → note bookingRef and bookingId

# 4a. Get Omise token (replace pkey_test_xxx)
curl https://vault.omise.co/tokens \
  -u pkey_test_xxx: \
  -d "card[number]=4242424242424242" -d "card[expiration_month]=12" \
  -d "card[expiration_year]=2028" -d "card[security_code]=123" -d "card[name]=TEST USER"
# → note "id": "tokn_test_xxxx"

# 4b. Pay (3500 THB × 100 = 350000 satang)
curl -X POST http://localhost:8080/api/payments/charge \
  -H "Content-Type: application/json" \
  -d '{"bookingRef":"QM7X2K","bookingId":42,"omiseToken":"tokn_test_xxxx","amount":350000,"currency":"THB"}'
# → status SUCCEEDED, omiseChargeId present

# 5. Booking confirmation
curl "http://localhost:8080/api/bookings/QM7X2K"
# → status must be "CONFIRMED" (requires PUT /status wired)

# 6. Payment receipt
curl "http://localhost:8080/api/payments/QM7X2K"
# → status SUCCEEDED
```

---

## Test Cards (Omise test mode)

| Card number | Result | failureCode |
|---|---|---|
| `4242 4242 4242 4242` | Success | — |
| `4111 1111 1111 1111` | Decline | `insufficient_fund` |

Use any future expiry (e.g. `12/2028`), any 3-digit CVV, any name.

---

## Error Handling Requirements

Every service must handle errors properly. Sloppy error handling is scored as a code quality failure.

### Rule 1 — Always return JSON, never raw text

Every response, including errors, must have `Content-Type: application/json`.
Never let Go's default error text, a panic, or a framework default reach the client.

```go
// ✅ correct
c.JSON(http.StatusNotFound, gin.H{
    "error":   "FLIGHT_NOT_FOUND",
    "message": "Flight 999 not found",
})

// ❌ wrong — raw string, wrong content-type
http.Error(w, "flight not found", 404)

// ❌ wrong — exposes internal detail
c.JSON(500, gin.H{"error": err.Error()})
```

### Rule 2 — Error response format

All `4xx` and `5xx` responses must follow this exact shape:

```json
{
  "error":   "ERROR_CODE",
  "message": "Human-readable explanation of what went wrong."
}
```

- `error` — `UPPER_SNAKE_CASE` machine-readable code (used by tests and clients)
- `message` — plain English sentence a human can read; never a raw Go error or SQL message

### Rule 3 — Correct HTTP status codes

| Situation | Status |
|---|---|
| Successful retrieval | `200 OK` |
| Successful creation (booking, payment) | `201 Created` |
| Missing or invalid request field | `400 Bad Request` |
| Omise card declined | `402 Payment Required` |
| Resource not found | `404 Not Found` |
| Business rule conflict (already paid, no seats) | `409 Conflict` |
| Unexpected server error | `500 Internal Server Error` |

Never return `200` with an error body. Never return `500` for a user mistake.

### Rule 4 — Log internally, hide externally

Log the full error (with context) to `stderr` using `log.Printf`. Return only a safe, generic message to the client.

```go
// ✅ correct
row, err := db.QueryRow(...)
if err != nil {
    log.Printf("ERROR GetFlightByID id=%d: %v", id, err)
    c.JSON(500, gin.H{"error": "INTERNAL_ERROR", "message": "An unexpected error occurred."})
    return
}

// ❌ wrong — SQL detail leaks to client
c.JSON(500, gin.H{"error": err.Error()})
```

### Rule 5 — Never swallow errors

Every `error` return value must be checked. Ignoring an error and continuing is a bug.

```go
// ❌ wrong
row.Scan(&flight)         // ignoring scan error

// ✅ correct
if err := row.Scan(&flight); err != nil { ... }
```

### Rule 6 — payment→booking status update failure

After a successful Omise charge, the payment service calls `PUT /api/bookings/:ref/status` on the booking service. If that call fails (booking service down, network error):

- **Do not** return 500 to the client — the charge already succeeded
- **Do** log the failure with the charge ID so it can be retried manually
- **Do** still return `201` with the charge result

---

### Complete Error Code Reference

#### flight-service

| Scenario | Status | `error` code |
|---|---|---|
| `origin`, `destination`, or `date` missing from query | 400 | `MISSING_REQUIRED_FIELD` |
| `date` is not a valid `YYYY-MM-DD` date | 400 | `INVALID_DATE_FORMAT` |
| `passengers` is not a positive integer | 400 | `INVALID_FIELD` |
| Flight `:id` does not exist | 404 | `FLIGHT_NOT_FOUND` |
| Database or unexpected error | 500 | `INTERNAL_ERROR` |

#### booking-service

| Scenario | Status | `error` code |
|---|---|---|
| `flightId`, `totalAmount`, or any of `passenger.firstName`, `passenger.lastName`, `passenger.email` missing | 400 | `MISSING_REQUIRED_FIELD` |
| `passenger.email` is not a valid email format | 400 | `INVALID_FIELD` |
| `totalAmount` is zero or negative | 400 | `INVALID_FIELD` |
| Flight `flightId` does not exist | 404 | `FLIGHT_NOT_FOUND` |
| `available_seats` is 0 on the requested flight | 409 | `NO_SEATS_AVAILABLE` |
| Booking `:bookingRef` does not exist | 404 | `BOOKING_NOT_FOUND` |
| `PUT /status` receives a value other than `CONFIRMED` | 400 | `INVALID_STATUS` |
| Database or unexpected error | 500 | `INTERNAL_ERROR` |

#### payment-service

| Scenario | Status | `error` code |
|---|---|---|
| `bookingRef`, `bookingId`, `omiseToken`, or `amount` missing | 400 | `MISSING_REQUIRED_FIELD` |
| `amount` is zero or negative | 400 | `INVALID_FIELD` |
| Booking `:bookingRef` / `bookingId` does not exist | 404 | `BOOKING_NOT_FOUND` |
| Booking is already `CONFIRMED` (duplicate payment attempt) | 409 | `ALREADY_PAID` |
| Omise declines the card | 402 | `payment_failed` |
| No payment record found for `:bookingRef` | 404 | `PAYMENT_NOT_FOUND` |
| Database or unexpected error | 500 | `INTERNAL_ERROR` |

> The `payment_failed` code (lowercase) is what the existing skeleton uses to stay consistent with the Omise error vocabulary. Keep it as-is.

---

## Constraints

- Do not modify `infra/db/01_schema.sql` or `infra/db/02_seed.sql`
- Do not change service ports or `docker-compose.yml`
- Omise must be in **test mode only** — never use live keys
- `bookingRef` must be exactly 6 uppercase alphanumeric characters
- The `.env` file must not be committed (it is in `.gitignore`)
- Rate limiting must use per-IP limiting (not global)
- K8s manifests must use the `qoomlee` namespace
- Omise is **credit card / synchronous only** — do not add webhook handlers

---

## Scoring

See `SCORECARD.md` for the full rubric.

| Pillar | Points |
|---|---|
| Working Software — all 7 endpoints return correct responses end-to-end | 25 |
| Testing — unit (Layer 1) + integration (Layer 2) + contract (Layer 3) + K6 load (Layer 4) | 35 |
| Code Quality — layered arch, error handling, no hardcoded secrets | 20 |
| Infrastructure & Shippable — health checks, rate limiting, graceful shutdown, structured logs, K8s | 20 |

---

## FAQ — Read Before Asking

**Q: Why are there 4 endpoints to build, not 3?**
The sequence diagrams reveal a hidden 4th requirement: `PUT /api/bookings/:ref/status`. The payment service calls this after a successful Omise charge to flip the booking from `PENDING` to `CONFIRMED`. Without it, `GET /api/bookings/:ref` will always show `PENDING` even after payment.

**Q: What is satang and why is the payment amount huge?**
Omise requires amounts in the smallest currency unit (like Stripe with cents). 1 THB = 100 satang. So 3,500 THB = `350000` satang. The `payments` table stores the same unit.

**Q: Where does `bookingId` (the number) come from?**
From the `POST /api/bookings` response: `{"bookingRef":"QM7X2K","bookingId":42,...}`. You need both — `bookingRef` is the PNR, `bookingId` is the numeric DB row id.

**Q: My payment succeeded but GET /api/bookings still shows PENDING — why?**
The payment service must call `PUT /api/bookings/{ref}/status` internally after a successful charge. If you haven't implemented that PUT endpoint on booking-service, or haven't wired the HTTP call in payment-service, the booking status will not update.

**Q: How does payment-service call booking-service?**
Via HTTP. The env var `BOOKING_SERVICE_URL=http://booking-service:8082` is already injected by docker-compose. Make an HTTP PUT call in the `Charge` handler after writing the `SUCCEEDED` payment record.

**Q: Can I change the existing working endpoints?**
Yes, but their response shape must stay compatible with `API_SPECS.md` — both teams are scored against the same contracts.

**Q: What Go router is used?**
All services use **Gin** (`github.com/gin-gonic/gin`). The existing pattern is in `services/checkin-service/main.go`.

**Q: How do I add a new Gin endpoint?**
In the handler file, add a method `func (h *MyHandler) MyEndpoint(c *gin.Context)`. Register it in `main.go` with `r.GET("/api/path/:param", h.MyEndpoint)`.

**Q: How do I mock dependencies in Go unit tests?**
Define an interface for your repository (e.g. `FlightRepository`), implement it in production code, and create a mock struct in the test using `testify/mock`. See [testify mock docs](https://pkg.go.dev/github.com/stretchr/testify/mock).

**Q: How do I run unit tests?**
```bash
cd services/flight-service  && go test ./...
cd services/booking-service && go test ./...
cd services/payment-service && go test ./...
```

**Q: How do I run K6 load tests?**
```bash
k6 run tests/k6/search.js
```
K6 must be installed. See https://k6.io/docs/get-started/installation/.

**Q: Do I need authentication or login?**
No. All endpoints are unauthenticated for this challenge.

**Q: Do I need round-trip booking support?**
No. One-way, single passenger only.

**Q: The checkin-service and boarding_passes table exist — should I touch them?**
No. Ignore `services/checkin-service/` entirely.

**Q: What does booking `status` mean?**
`PENDING` = booked, not paid. `CONFIRMED` = paid successfully. Payment-service is responsible for calling booking-service to set `CONFIRMED`.
