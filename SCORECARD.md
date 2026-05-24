# Qoomlee Challenge — Scorecard

Team: _____________________
Date: _____________________
Evaluator: _____________________

> **Scope:** REST API only. No frontend. No check-in. No boarding pass.
> **Stack:** Go + Gin. PostgreSQL. Omise (credit card, synchronous). K6 load tests.

---

## Scoring Overview

| Pillar | Points | What it measures |
|--------|--------|-----------------|
| [1] Working Software | 25 | All 7 endpoints work end-to-end |
| [2] Testing | 35 | Unit → Integration → Contract → K6 Load |
| [3] Code Quality | 20 | Architecture, error handling, clean Go |
| [4] Infrastructure & Shippable | 20 | Health checks, rate limiting, graceful shutdown, structured logs, K8s |
| **Total** | **100** | |

---

## Pillar 1 — Working Software (25 points)

_Run after `docker compose up --build`. All requests hit the gateway on port 8080._

### Automated smoke tests — 3 pts each

| # | Command | Pass condition | Pass | Fail |
|---|---------|---------------|------|------|
| 1 | `curl "http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"` | Status 200; body has key `"flights"` with ≥1 item | | |
| 2 | `curl "http://localhost:8080/api/flights/1"` | Status 200; body has `id`, `flightNumber`, `origin`, `destination`, `durationMinutes` | | |
| 3 | `POST /api/bookings` with valid body | Status 201; `bookingRef` is exactly 6 chars; `bookingId` is an integer | | |
| 4 | `POST /api/payments/charge` with success card `4242…` token | Status 201; `omiseChargeId` non-empty; `status` is `"SUCCEEDED"` | | |
| 5 | `GET /api/bookings/{bookingRef}` (after step 4) | Status 200; `status` is `"CONFIRMED"`; `flight` and `passenger` objects present | | |
| 6 | `GET /api/payments/{bookingRef}` (after step 4) | Status 200; `status` is `"SUCCEEDED"`; `omiseChargeId` non-empty | | |

> For test #4: tokenize test card first with `curl https://vault.omise.co/tokens -u $OMISE_PUBLIC_KEY: -d "card[number]=4242424242424242&card[expiration_month]=12&card[expiration_year]=2028&card[security_code]=123"`

**Automated subtotal: __ / 18**

### Manual scenario walkthrough — 2 pts each (but capped: score 0 if smoke test #4 failed)

| Scenario | Pass condition | Pass | Fail |
|----------|---------------|------|------|
| Payment failure path | `POST /api/payments/charge` with decline card `4111…` returns 402 with `failureCode`; subsequent `GET /api/bookings/:ref` still shows `status: "PENDING"` | | |
| Retry payment | After decline, charge again with success card → 201; booking flips to `CONFIRMED` | | |
| Duplicate payment guard | Charge an already-CONFIRMED booking → 409 with `ALREADY_PAID` | | |
| Rate limit enforced | Exceed the per-IP limit on `POST /api/payments/charge` (>10 req/min) → 429 with `RATE_LIMIT_EXCEEDED` | | |

**Manual subtotal: __ / 8** _(4 scenarios × 2 pts — deduct 1 pt if retry works but duplicate guard is missing)_

> **Note on rounding:** smoke test total is 18 pts. Manual scenarios total is 8 pts but only 7 pts are added here (rounding to 25 total). Evaluator: award 7 pts max from manual section.

**PILLAR 1 TOTAL: __ / 25**

---

## Pillar 2 — Testing (35 points)

### Layer 1 — Unit Tests (12 points)

Run: `go test ./...` in each service directory. All DB and HTTP calls must be mocked via `testify/mock` interfaces.

**flight-service**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `SearchFlights()` — ≥3 cases: valid params returns flights; no match returns empty slice; blank origin returns error | | |
| `GetFlightByID()` — returns flight struct for valid id; returns `ErrNotFound` for unknown id | | |

**booking-service**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `CreateBooking()` — PNR generated is 6 chars uppercase alphanumeric; passenger repo Insert called once; booking repo Insert called with correct `flightId` | | |
| `GetBookingByRef()` — returns full struct with nested flight+passenger; returns `ErrNotFound` for unknown ref | | |
| `UpdateBookingStatus()` — updates DB with new status; returns `ErrNotFound` for unknown ref | | |

**payment-service**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `Charge()` — success: mock Omise returns `"successful"`; payments repo Insert called with `status="SUCCEEDED"`; booking-service `/status` PUT called; response is 201 | | |
| `Charge()` — decline: mock Omise returns failure; payments repo Insert called with `status="FAILED"`; booking-service NOT called; response is 402 with `failureCode` | | |
| `Charge()` — already paid: booking returns `CONFIRMED`; Omise never called; response is 409 `ALREADY_PAID` | | |
| `GetByBookingRef()` — returns 200 with payment data; returns 404 for unknown ref | | |

**Layer 1 subtotal: __ / 18** _(2 pts × 9 criteria)_

> Wait — 9 × 2 = 18 pts but Layer 1 is capped at 12. Evaluator: score each criterion 0–1 pt, then double. Total = 0–18, divide by 18 × 12 = scaled score. **Or simpler:** score 0/1/2 per criterion, max 12 pts total. Deduct 1 pt per criterion that partially passes.

**Layer 1 subtotal: __ / 12**

---

### Layer 2 — Integration Tests (10 points)

Run: `go test ./... -tags=integration`. Use `testcontainers-go` to spin up a real PostgreSQL container and apply `infra/db/01_schema.sql` + `infra/db/02_seed.sql` before tests.

**flight-service**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| Search returns seed flights for BKK→SIN on 2026-06-15; returns empty slice for unknown route | | |
| `GetByID(1)` returns correct flight with origin=BKK; `GetByID(99999)` returns `ErrNotFound` | | |

**booking-service**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `CreateBooking()` inserts rows into both `passengers` and `bookings`; `booking_ref` is unique | | |
| `GetByRef(pnr)` returns full booking joined with passenger and flight data | | |

**payment-service**

| Criterion | Pass (2 pts) | Fail (0 pts) |
|-----------|---|---|
| `Insert()` writes row to `payments` with correct `booking_ref` and `amount`; returns record with non-zero `id` | | |
| `FindByBookingRef(ref)` returns correct record after insert; returns `ErrNotFound` for unknown ref | | |

**Layer 2 subtotal: __ / 10** _(5 criteria × 2 pts — partial credit: 1 pt if test exists but assertion is incomplete)_

---

### Layer 3 — API Contract Tests (8 points)

Run against live `docker compose` stack. Use Go's `net/http`, `curl`, or any HTTP client.

| Contract | Criteria | Pass (1 pt) | Fail (0 pts) |
|----------|----------|---|---|
| `GET /api/flights/search` — bad params | 400 when `origin` is missing | | |
| `GET /api/flights/1` | 200; all of `id`, `flightNumber`, `origin`, `destination`, `durationMinutes` present | | |
| `GET /api/flights/99999` | 404 | | |
| `POST /api/bookings` — valid | 201; `bookingRef` is exactly 6 chars; `bookingId` is integer | | |
| `GET /api/bookings/{validRef}` | 200; keys `bookingRef`, `status`, `flight`, `passenger` all present | | |
| `POST /api/payments/charge` — success `4242…` | 201; `omiseChargeId` non-empty; `GET /api/bookings/{ref}` then shows `CONFIRMED` | | |
| `POST /api/payments/charge` — decline `4111…` | 402; `failureCode` non-empty; `GET /api/bookings/{ref}` still shows `PENDING` | | |
| `GET /health` on each service | All 3 services return 200 `{"status":"ok"}` when DB is up | | |

**Layer 3 subtotal: __ / 8**

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
| No hardcoded secrets | `grep -rn "skey_test\|pkey_test" services/` — zero results in `.go` files | | |
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
| **Payment→Booking coupling handled:** if the `PUT /status` call fails after a successful charge, logs and returns 201 anyway | | |
| **Readable code:** Go naming conventions; no magic numbers; no debug `fmt.Println`; slog used instead of log.Printf | | |

**Review subtotal: __ / 14**

**PILLAR 3 TOTAL: __ / 20**

---

## Pillar 4 — Infrastructure & Shippable (20 points)

### Health Check Endpoints (4 points)

| Check | Pass (2 pts) | Partial (1 pt) | Fail (0 pts) |
|-------|---|---|---|
| All 3 services have `GET /health` returning `{"status":"ok","service":"..."}` | | | |
| `GET /health` returns 503 when DB is unreachable (evaluator: kill postgres container, re-check) | | | |

**Health check subtotal: __ / 4**

---

### Rate Limiting (4 points)

| Check | Pass (2 pts) | Fail (0 pts) |
|-------|---|---|
| `POST /api/payments/charge` returns 429 after >10 req/min from same IP; response body has `RATE_LIMIT_EXCEEDED` | | |
| `POST /api/bookings` returns 429 after >30 req/min; `GET /api/flights/search` returns 429 after >100 req/min | | |

**Rate limiting subtotal: __ / 4**

---

### Graceful Shutdown (3 points)

| Check | Pass (3 pts) | Partial (1 pt) | Fail (0 pts) |
|-------|---|---|---|
| Each service uses `http.Server` + `signal.Notify(SIGTERM/SIGINT)` + `srv.Shutdown(ctx)` with 10 s timeout; bare `r.Run()` is gone | | | |

**Graceful shutdown subtotal: __ / 3**

---

### Structured Logging (3 points)

| Check | Pass (1 pt) | Fail (0 pts) |
|-------|---|---|
| `log.Printf` replaced with `slog` JSON output; each log line is valid JSON | | |
| Log line for each inbound request includes `method`, `path`, `status`, `latency_ms` | | |
| Error logs include relevant context (e.g. `bookingRef`, `id`, `err`) — never just `"error occurred"` | | |

**Structured logging subtotal: __ / 3**

---

### Kubernetes Manifests (6 points)

Run: `kubectl apply -f infra/k8s/` on a clean cluster (minikube or kind is fine).

| Check | Pass (2 pts) | Partial (1 pt) | Fail (0 pts) |
|-------|---|---|---|
| All 4 service Deployments start (`kubectl get pods -n qoomlee` → all Running) | | | |
| Each Deployment has `livenessProbe` and `readinessProbe` pointing to `GET /health`; CPU + memory `requests` and `limits` are set | | | |
| `api-gateway` has `replicas: 2` and a `HorizontalPodAutoscaler` (min 2, max 5, target 70% CPU) | | | |

**K8s subtotal: __ / 6**

---

### Summary — Pillar 4

| Area | Max | Score |
|------|-----|-------|
| Health Check Endpoints | 4 | |
| Rate Limiting | 4 | |
| Graceful Shutdown | 3 | |
| Structured Logging | 3 | |
| Kubernetes Manifests | 6 | |
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
