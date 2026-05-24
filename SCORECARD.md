# Qoomlee Challenge — Scorecard

Team: _____________________
Date: _____________________
Evaluator: _____________________

> **Scope:** REST API only. No frontend. No check-in. No boarding pass.
> **Stack:** Go + Gin. Load tests: K6.

---

## Scoring Overview

| Pillar | Points | What it measures |
|--------|--------|-----------------|
| [1] Working Software | 30 | All 7 endpoints work end-to-end |
| [2] Testing | 40 | Unit → Integration → Contract → K6 Load |
| [3] Code Quality | 20 | Architecture, error handling, clean Go |
| [4] Shippable Software | 10 | docker compose, no secrets in code |
| **Total** | **100** | |

---

## Pillar 1 — Working Software (30 points)

_Run after `docker compose up --build`. All requests hit the gateway on port 8080._

### Automated smoke tests — 4 pts each

| # | Command | Pass condition | Pass | Fail |
|---|---------|---------------|------|------|
| 1 | `curl "http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"` | Status 200; body has key `"flights"` with ≥1 item | | |
| 2 | `curl "http://localhost:8080/api/flights/1"` | Status 200; body has `id`, `flightNumber`, `origin`, `destination`, `durationMinutes` | | |
| 3 | `POST /api/bookings` with valid body | Status 201; `bookingRef` is exactly 6 chars; `bookingId` is an integer | | |
| 4 | `POST /api/payments/charge` with success card `4242…` token | Status 201; `omiseChargeId` non-empty; `status` is `"SUCCEEDED"` | | |
| 5 | `GET /api/bookings/{bookingRef}` (after step 4) | Status 200; `status` is `"CONFIRMED"`; `flight` and `passenger` objects present | | |
| 6 | `GET /api/payments/{bookingRef}` (after step 4) | Status 200; `status` is `"SUCCEEDED"`; `omiseChargeId` non-empty | | |

> For test #4: tokenize test card first with `curl https://vault.omise.co/tokens -u $OMISE_PUBLIC_KEY: -d "card[number]=4242424242424242&card[expiration_month]=12&card[expiration_year]=2028&card[security_code]=123"`

**Automated subtotal: __ / 24**

### Manual scenario walkthrough — 2 pts each

| Scenario | Pass condition | Pass | Fail |
|----------|---------------|------|------|
| Payment failure path | `POST /api/payments/charge` with decline card `4111…` returns 402 with `failureCode`; subsequent `GET /api/bookings/:ref` still shows `status: "PENDING"` | | |
| Retry payment | After decline, charge again with success card → 201; booking flips to `CONFIRMED` | | |
| Duplicate payment guard | Charge an already-CONFIRMED booking → 409 with `ALREADY_PAID` | | |

**Manual subtotal: __ / 6**

**PILLAR 1 TOTAL: __ / 30**

---

## Pillar 2 — Testing (40 points)

### Layer 1 — Unit Tests (14 points)

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

**Layer 1 subtotal: __ / 14** _(2 pts × 9 criteria — partial credit for partially-passing suites)_

---

### Layer 2 — Integration Tests (12 points)

Run: `go test ./... -tags=integration` (or separate directory). Use `testcontainers-go` to spin up a real PostgreSQL container and apply `infra/db/01_schema.sql` + `infra/db/02_seed.sql` before tests.

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

**Layer 2 subtotal: __ / 12**

---

### Layer 3 — API Contract Tests (10 points)

Run against live `docker compose` stack. Use Go's `net/http`, `curl`, or any HTTP client.

| Contract | Criteria | Pass (1 pt) | Fail (0 pts) |
|----------|----------|---|---|
| `GET /api/flights/search` — bad params | 400 when `origin` is missing | | |
| `GET /api/flights/search` — valid | 200; `flights` array key present | | |
| `GET /api/flights/1` | 200; all of `id`, `flightNumber`, `origin`, `destination`, `durationMinutes` present | | |
| `GET /api/flights/99999` | 404 | | |
| `POST /api/bookings` — valid | 201; `bookingRef` is exactly 6 chars; `bookingId` is integer | | |
| `POST /api/bookings` — missing email | 400 | | |
| `GET /api/bookings/{validRef}` | 200; keys `bookingRef`, `status`, `flight`, `passenger` all present | | |
| `GET /api/bookings/XXXXXX` | 404 | | |
| `POST /api/payments/charge` — success `4242…` | 201; `omiseChargeId` non-empty; `GET /api/bookings/{ref}` then shows `CONFIRMED` | | |
| `POST /api/payments/charge` — decline `4111…` | 402; `failureCode` non-empty; `GET /api/bookings/{ref}` still shows `PENDING` | | |

**Layer 3 subtotal: __ / 10**

---

### Layer 4 — Load Tests / K6 (4 points)

Scripts in `tests/k6/`. Run against live stack. Evaluator runs and checks the K6 summary output.

| Script | Scenario | Threshold | Pass (2 pts) | Fail (0 pts) |
|--------|----------|-----------|---|---|
| `tests/k6/search.js` | 50 VUs × 30 s — `GET /api/flights/search` | p95 < 500 ms, error rate < 1% | | |
| `tests/k6/booking-flow.js` | 20 VUs × 60 s — search → book → pay (full flow) | p95 < 3000 ms, error rate < 2% | | |

**Layer 4 subtotal: __ / 4**

---

### Summary — Pillar 2

| Layer | Max | Score |
|-------|-----|-------|
| Unit Tests | 14 | |
| Integration Tests | 12 | |
| Contract Tests | 10 | |
| K6 Load Tests | 4 | |
| **Pillar 2 Total** | **40** | |

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
| **HTTP semantics correct:** 201 on create, 200 on read, 404 for not-found, 400 for bad input, 402 for decline, 409 for already-paid | | |
| **No hardcoded config:** DB DSN, Omise keys, service URLs — all from `os.Getenv()` | | |
| **Payment→Booking coupling handled:** if the `PUT /status` call fails after a successful charge, the service logs/handles the error rather than crashing | | |
| **Readable code:** Go naming conventions (`CamelCase` for exported, `camelCase` for unexported); no magic numbers; no debug `fmt.Println` | | |

**Review subtotal: __ / 14**

**PILLAR 3 TOTAL: __ / 20**

---

## Pillar 4 — Shippable Software (10 points)

| Check | How to verify | Pass (2 pts) | Fail (0 pts) |
|-------|--------------|---|---|
| `docker compose up --build` succeeds | All containers healthy within 60 s | | |
| All services respond | `curl http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15` → 200 within 30 s of compose up | | |
| No secrets in source | `grep -rn "skey_test\|pkey_test" services/` → zero results | | |
| `.env` not committed | `.gitignore` lists `.env`; no `.env` in git index | | |
| `.env.example` complete | Lists all required env vars with placeholder values | | |

**PILLAR 4 TOTAL: __ / 10**

---

## Final Score

| Pillar | Max | Score |
|--------|-----|-------|
| Working Software | 30 | |
| Testing | 40 | |
| Code Quality | 20 | |
| Shippable Software | 10 | |
| **Total** | **100** | |

---

## Evaluator Notes

```




```
