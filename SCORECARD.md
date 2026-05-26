# Qoomlee Challenge — Scorecard

Team: _____________________
Date: _____________________
Evaluator: _____________________

> **Scope:** REST API only. No frontend. No check-in. No boarding pass.
> **Stack:** Go + Gin for all services. PostgreSQL. Omise (credit card, synchronous). K6 load tests.

---

## Scoring Overview

| Pillar | Points | What it measures |
|--------|--------|-----------------|
| [1] Working Software | 25 | All 7 endpoints work end-to-end |
| [2] Testing | 35 | Unit → Integration → Contract → K6 Load |
| [3] Code Quality | 20 | Architecture, error handling, clean Go |
| [4] Infrastructure & Shippable | 20 | Health checks (4), rate limiting incl. health DDoS (6), graceful shutdown (3), structured logs (3), security/auth (4) |
| **Total** | **100** | |

---

## Pillar 1 — Working Software (25 points)

_Run after `docker compose up --build`. Call each service on its own port (8082 / 8084)._

> **Auth required.** Get a token first:
> ```bash
> TOKEN=$(make jwt-token -s)
> ```
> Add `-H "Authorization: Bearer $TOKEN"` to every curl below. Calls without a token return 401 — that is correct behaviour, not a bug.

### Automated smoke tests — 3 pts each

| # | Command | Pass condition | Pass | Fail |
|---|---------|---------------|------|------|
| 1 | `curl -H "Authorization: Bearer $TOKEN" "http://localhost:8082/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"` | Status 200; body has key `"flights"` with ≥1 item | | |
| 2 | `curl -H "Authorization: Bearer $TOKEN" "http://localhost:8082/api/flights/1"` | Status 200; body has `id`, `flightNumber`, `origin`, `destination`, `durationMinutes` | | |
| 3 | `POST /api/bookings` with valid body + `Authorization` header | Status 201; `bookingRef` is exactly 6 chars; `bookingId` is an integer | | |
| 4 | `POST /api/payments/charge` with success card `4242…` token + `Authorization` header | Status 201; `providerChargeId` non-empty; `paymentProvider` is `"OMISE"`; `status` is `"SUCCEEDED"` | | |
| 5 | `GET /api/bookings/{bookingRef}` (after step 4) + `Authorization` header | Status 200; `status` is `"CONFIRMED"`; `flight` and `passenger` objects present; `providerChargeId` matches the charge ID from step 4 | | |
| 6 | `GET /api/payments/{bookingRef}` (after step 4) + `Authorization` header | Status 200; `status` is `"SUCCEEDED"`; `paymentProvider` is `"OMISE"`; `providerChargeId` non-empty | | |

> For test #4: tokenize test card first with `curl https://vault.omise.co/tokens -u $OMISE_PUBLIC_KEY: -d "card[number]=4242424242424242&card[expiration_month]=12&card[expiration_year]=2028&card[security_code]=123"`

**Automated subtotal: __ / 18**

### Manual scenario walkthrough — 2 pts each (but capped: score 0 if smoke test #4 failed)

| Scenario | Pass condition | Pass | Fail |
|----------|---------------|------|------|
| Payment failure path | `POST /api/payments/charge` with decline card `4111…` returns 402 with `failureCode`; subsequent `GET /api/bookings/:ref` still shows `status: "PENDING"` | | |
| Retry payment | After decline, charge again with success card → 201; booking flips to `CONFIRMED` | | |
| Duplicate payment guard | `POST /api/payments/charge` with `bookingRef=SEED01` (pre-seeded CONFIRMED) → 409 `ALREADY_PAID` | | |
| Rate limit enforced | Exceed the per-IP limit on `POST /api/payments/charge` (>10 req/min) → 429 with `RATE_LIMIT_EXCEEDED` | | |

**Manual subtotal: __ / 8** _(4 scenarios × 2 pts — deduct 1 pt if retry works but duplicate guard is missing)_

> **Note on rounding:** smoke test total is 18 pts. Manual scenarios total is 8 pts but only 7 pts are added here (rounding to 25 total). Evaluator: award 7 pts max from manual section.

**PILLAR 1 TOTAL: __ / 25**

---

## Pillar 2 — Testing (35 points)

### Layer 1 — Unit Tests (12 points)

Run: `go test ./...` in each service directory. All DB and HTTP calls must be mocked via `testify/mock` interfaces.

**qoomlee-service (flight + booking endpoints)**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `SearchFlights()` — ≥3 cases: valid params returns flights; no match returns empty slice; blank origin returns error | | |
| `GetFlightByID()` — returns flight struct for valid id; returns `ErrNotFound` for unknown id | | |
| `CreateBooking()` — PNR generated is 6 chars uppercase alphanumeric; passenger repo Insert called once; booking repo Insert called with correct `flightId` and `total_amount_minor` copied from flight's `base_price_minor` | | |
| `GetBookingByRef()` — returns full struct with nested flight+passenger; returns `ErrNotFound` for unknown ref | | |
| `UpdateBookingStatus()` — updates DB with new status + `paymentProvider` + `providerChargeId`; returns `ErrNotFound` for unknown ref | | |

**payment-service**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `Charge()` — amount mismatch: `req.amountMinor != booking.total_amount_minor`; Omise **never called**; response is 400 `AMOUNT_MISMATCH` | | |
| `Charge()` — success: mock Omise returns `"successful"`; payments repo Insert called with `status="SUCCEEDED"` and `amount_minor` matching booking; qoomlee-service mock `PUT /api/bookings/:ref/status` called once with `{status:CONFIRMED, paymentId:X}`; response is 201 | | |
| `Charge()` — decline: mock Omise returns failure; payments repo Insert called with `status="FAILED"`; qoomlee-service `PUT /api/bookings/:ref/status` **never called**; response is 402 with `failureCode` | | |
| `Charge()` — already paid: qoomlee-service mock returns `CONFIRMED`; Omise **never called**; qoomlee-service `PUT /api/bookings/:ref/status` **never called**; response is 409 `ALREADY_PAID` | | |
| `Charge()` — `PUT /api/bookings/:ref/status` fails: mock Omise succeeds; payments repo Insert called; qoomlee-service mock returns error on `PUT /api/bookings/:ref/status`; response is still **201** (charge succeeded); failure logged | | |
| `GetByBookingRef()` — returns 200 with `paymentProvider` + `providerChargeId`; returns 404 for unknown ref | | |

> **Hard requirement:** payment-service connects only to `postgres-qoomlee-payment`. It physically cannot access the booking database. Any direct DB connection to `postgres-qoomlee` or any `bookings` SQL in payment-service is a failing criterion.

**middleware (any service)**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `JWTMiddleware` — valid RS256 token passes; missing/expired/wrong-algorithm token returns 401 `UNAUTHORIZED` | | |
| `InternalTokenMiddleware` — correct `X-Internal-Token` passes; missing or wrong value returns 403 `FORBIDDEN` | | |

**Layer 1 subtotal: __ / 34** _(2 pts × 17 criteria)_

> Evaluator: score 0/1/2 per criterion, max 12 pts total. Scale: `(raw / 34) × 12`, round down. Deduct 1 pt per criterion that partially passes.

**Layer 1 subtotal: __ / 12**

---

### Layer 2 — Integration Tests (10 points)

Run: `go test ./... -tags=integration`. Use `testcontainers-go` to spin up a real PostgreSQL container and apply `infra/db/qoomlee/01_schema.sql` + `infra/db/qoomlee/02_seed.sql` before qoomlee-service tests; `infra/db/qoomlee-payment/01_schema.sql` + `infra/db/qoomlee-payment/02_seed.sql` for payment-service tests.

**qoomlee-service (flight + booking)**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| Search returns ≥1 flight for BKK→SIN `date=2026-06-15`; returns empty slice for unknown route (e.g. BKK→XXX) | | |
| `GetByID(1)` returns flight with `origin=BKK`, `flightNumber=QM101`; `GetByID(99999)` returns `ErrNotFound` | | |
| `CreateBooking()` inserts rows into `passengers` + `bookings`; `total_amount_minor` matches flight's `base_price_minor`; `booking_ref` is unique 6-char string | | |
| Concurrent `CreateBooking()` — 2 goroutines on a 1-seat flight; exactly 1 succeeds, 1 returns 409; `available_seats` ends at 0 | | |
| `GetByRef("SEED02")` returns full booking with nested passenger + flight (uses pre-seeded PENDING booking) | | |

**payment-service**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `Insert()` writes row to `payments` with correct `booking_ref` and `amount_minor`; returns record with non-zero `id` | | |
| `FindByBookingRef("SEED01")` returns `status=SUCCEEDED` with correct `amount_minor`; `FindByBookingRef("XXXXXX")` returns `ErrNotFound` | | |

**Layer 2 subtotal: __ / 14** _(7 criteria × 2 pts — partial credit: 1 pt if test exists but assertion is incomplete)_

> Evaluator: 7 criteria × 2 = 14 raw; cap at 10. Scale: `(raw / 14) × 10`.

> **Hard requirement:** payment-service integration tests must use `infra/db/qoomlee-payment/` schema, not the booking DB schema. Any test that imports or applies `infra/db/qoomlee/` SQL in payment-service test setup is scored 0 on that criterion.

---

### Layer 3 — API Contract Tests (8 points)

Run against live `docker compose` stack. Use `curl` or Go's `net/http` test client.

| Contract | Criteria | Pass (1 pt) | Fail (0 pts) |
|----------|----------|---|---|
| `GET /api/flights/search` — bad params | 400 when `origin` is missing | | |
| `GET /api/flights/1` | 200; all of `id`, `flightNumber`, `origin`, `destination`, `durationMinutes` present | | |
| `GET /api/flights/99999` | 404 | | |
| `POST /api/bookings` — valid body | 201; `bookingRef` is exactly 6 chars; `bookingId` is integer | | |
| `POST /api/bookings` — flightId=6 (SOLD OUT `QM999`) | 409 `NO_SEATS_AVAILABLE` | | |
| `GET /api/bookings/SEED01` | 200; `status=CONFIRMED`; `paymentProvider=OMISE`; `providerChargeId=chrg_test_seed01xxxxxxxxxx` (traceability) | | |
| `GET /api/bookings/SEED02` | 200; keys `bookingRef`, `status`, `flight`, `passenger` all present; `paymentProvider=null`, `providerChargeId=null` | | |
| `GET /api/bookings/XXXXXX` | 404 `BOOKING_NOT_FOUND` | | |
| `POST /api/payments/charge` — `bookingRef=SEED01` (already CONFIRMED) | 409 `ALREADY_PAID` (no Omise call needed) | | |
| `GET /api/payments/SEED01` | 200; `status=SUCCEEDED`; `paymentProvider=OMISE`; `providerChargeId` non-empty | | |
| `GET /api/payments/SEED02` | 200; `status=FAILED`; `failureCode=insufficient_fund` | | |
| `GET /api/flights/search` — no `Authorization` header | 401 `UNAUTHORIZED` | | |
| `PUT /api/bookings/SEED02/status` — valid `X-Internal-Token`, `{status:CONFIRMED, paymentId:1, paymentProvider:OMISE, providerChargeId:chrg_test_...}` | 200; subsequent `GET /api/bookings/SEED02` returns `status=CONFIRMED` with `paymentProvider` and `providerChargeId` populated | | |
| `PUT /api/bookings/SEED01/status` — no `X-Internal-Token` | 403 `FORBIDDEN` (and no JWT needed) | | |
| `POST /api/payments/charge` — `amountMinor` differs from booking amount | 400 `AMOUNT_MISMATCH` | | |
| `GET /health/live` and `GET /health/ready` — no `Authorization` header | Both services return 200 (health endpoints are unprotected) | | |

**Layer 3 subtotal: __ / 8** _(17 checks × 1 pt, capped at 8. Prioritise the auth, traceability, amount-mismatch, and concurrent-booking checks.)_

---

### Layer 4 — Load Tests / K6 (5 points)

Scripts in `tests/k6/`. Run against live stack.

| Script | Scenario | Threshold | Pass | Fail |
|--------|----------|-----------|---|---|
| `tests/k6/search.js` | 50 VUs × 30 s — `GET /api/flights/search` | p95 < 500 ms, error rate < 1% | 2 pts | 0 pts |
| `tests/k6/booking-flow.js` | 20 VUs × 60 s — search → book → pay | p95 < 3000 ms, error rate < 2% | 2 pts | 0 pts |
| Rate limit validates under load | During `search.js`, at least some 429 responses appear (confirms middleware is active) | 1 pt | 0 pts |

**Layer 4 subtotal: __ / 5**

---

### Summary — Pillar 2

| Layer | Max | Score |
|-------|-----|-------|
| Unit Tests | 12 | |
| Integration Tests | 10 | |
| Contract Tests | 8 | |
| K6 Load Tests | 5 | |
| **Pillar 2 Total** | **35** | |

---

## Pillar 3 — Code Quality (20 points)

### Automated checks (6 points)

| Check | Command | Pass (2 pts) | Fail (0 pts) |
|-------|---------|---|---|
| `go vet` clean | `go vet ./...` in each service — zero issues | | |
| No hardcoded secrets | `grep -rn "skey_test\|pkey_test" .` — zero results in `.go` files | | |
| All services build | `go build ./...` in each service exits 0 | | |

**Automated subtotal: __ / 6**

### Code review — neutral evaluator (14 points)

Score 0–2 per criterion: 0 = absent, 1 = partial, 2 = complete.

| Criterion | Score (0–2) | Notes |
|-----------|---|---|
| **Layered architecture:** handler (HTTP) → service (business logic) → repository (SQL); no SQL in handlers | | |
| **Interface-based repos:** repositories defined as interfaces; allows mocking in unit tests | | |
| **Error propagation:** every `db.Query`, every Omise call, every inter-service HTTP call checks `err != nil`; errors returned, never silently dropped | | |
| **HTTP semantics correct:** 201 on create, 200 on read, 404 for not-found, 400 for bad input, 402 for decline, 409 for already-paid, 429 for rate limit | | |
| **No hardcoded config:** DB DSN, Omise keys, service URLs — all from `os.Getenv()` | | |
| **Payment→Booking coupling handled:** if `PUT /api/bookings/:ref/status` fails after a successful charge, logs and returns 201 anyway | | |
| **Payment traceability:** `PUT /api/bookings/:ref/status` receives `paymentProvider` + `providerChargeId` and stores them in the bookings row; `GET /api/bookings/:ref` returns them directly (both null when PENDING) | | |
| **Readable code:** Go naming conventions; no magic numbers; no debug `fmt.Println`; slog used instead of log.Printf | | |

**Review subtotal: __ / 14** _(8 criteria × 2 pts = 16 raw, capped at 14. Score 0/1/2 per criterion.)_

**PILLAR 3 TOTAL: __ / 20**

---

## Pillar 4 — Infrastructure & Shippable (20 points)

### Health Check Endpoints (4 points)

Two separate endpoints are required. Using one endpoint for both is scored as partial.

| Check | Pass (2 pts) | Partial (1 pt) | Fail (0 pts) |
|-------|---|---|---|
| Both services have `GET /health/live` (always 200) **and** `GET /health/ready` (200 when DB up, 503 when DB down) | Both present and correct on both services | Only `/health` or only one of the two | Neither present |
| `GET /health/ready` returns 503 when DB unreachable; `GET /health/live` still returns 200 (evaluator: `docker stop qoomlee-postgres-qoomlee-1`, re-check both endpoints on qoomlee-service) | Live=200, Ready=503 | One works correctly | Both return same result or both fail |

**Health check subtotal: __ / 4**

---

### Rate Limiting (4 points)

| Check | Pass (2 pts) | Fail (0 pts) |
|-------|---|---|
| `POST /api/payments/charge` returns 429 after >10 req/min from same IP; response body has `RATE_LIMIT_EXCEEDED` | | |
| `POST /api/bookings` returns 429 after >30 req/min; `GET /api/flights/search` returns 429 after >100 req/min | | |
| `GET /health/live` and `GET /health/ready` return 429 after >30 req/min; health endpoints are unauthenticated and must be rate-limited to prevent DDoS | | |

**Rate limiting subtotal: __ / 6**

> Evaluator: total is now 6 pts. Adjust Pillar 4 summary accordingly.

---

### Graceful Shutdown (3 points)

| Check | Pass (3 pts) | Partial (1 pt) | Fail (0 pts) |
|-------|---|---|---|
| Each service uses `http.Server` + `signal.Notify(SIGTERM/SIGINT)` + `srv.Shutdown(ctx)` with 10 s timeout; bare `r.Run()` is gone | | | |

**Graceful shutdown subtotal: __ / 3**

---

### Structured Logging (3 points)

| Check | Pass (2 pts) | Fail (0 pts) |
|-------|---|---|
| `log.Printf` replaced with `slog` JSON output; log line per request includes `method`, `path`, `status`, `latency_ms` | | |

| Check | Pass (1 pt) | Fail (0 pts) |
|-------|---|---|
| Error logs include relevant context (e.g. `bookingRef`, `id`, `err`) — never just `"error occurred"` | | |

**Structured logging subtotal: __ / 3**

---

### Security / Auth (4 points)

| Check | Pass (2 pts) | Partial (1 pt) | Fail (0 pts) |
|-------|---|---|---|
| Public API endpoints (`/api/*` except `PUT /api/bookings/:ref/status`) return 401 when JWT is missing, expired, or uses wrong algorithm; valid RS256 token passes; `JWT_PRIVATE_KEY` absent from all running containers | All correct | Only one case handled | No JWT check |
| `PUT /api/bookings/:ref/status` returns 403 when `X-Internal-Token` is missing or wrong; does **not** require a JWT; `crypto/subtle.ConstantTimeCompare` used; service refuses to start if `INTERNAL_TOKEN` is empty | All correct | Token checked but timing-safe compare missing | No internal token check |

**Security subtotal: __ / 4**

---

### Summary — Pillar 4

| Area | Max | Score |
|------|-----|-------|
| Health Check Endpoints | 4 | |
| Rate Limiting | 6 | |
| Graceful Shutdown | 3 | |
| Structured Logging | 3 | |
| Security / Auth | 4 | |
| **Pillar 4 Total** | **20** | |

---

## Final Score

| Pillar | Max | Score |
|--------|-----|-------|
| Working Software | 25 | |
| Testing | 35 | |
| Code Quality | 20 | |
| Infrastructure & Shippable | 20 | |
| **Total** | **100** | |

---

## Evaluator Notes

```




```
