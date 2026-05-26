# Qoomlee Airline — Product Requirements

## 1. What is Qoomlee?

Qoomlee is a low-cost airline operating short-haul routes across Southeast Asia. Passengers book flights online and pay by credit card at the time of booking.

This challenge covers the **booking backend only** — REST API, no frontend.

---

## 2. Scope

| In scope | Out of scope |
|---|---|
| Search available flights | Frontend / UI |
| Create a booking (one passenger, one flight) | Check-in |
| Pay by credit card (Omise) | Boarding pass |
| Retrieve booking status | Seat selection |
| Retrieve payment status | Refunds / cancellation |

---

## 3. The Booking Journey

```
Search Flights → Create Booking → Pay → Confirmed
```

1. **Search** — passenger queries by origin, destination, date
2. **Book** — system reserves a seat and returns a 6-char PNR (`bookingRef`); status is `PENDING`
3. **Pay** — passenger submits a credit card token; Omise charges the card synchronously
4. **Confirm** — on successful charge, booking status flips to `CONFIRMED`

---

## 4. Business Rules

| Rule | Detail |
|---|---|
| One passenger per booking | No group bookings |
| Seat hold | Available seats decrease when booking is created (not when paid) |
| Payment is synchronous | Omise returns success/failure immediately — no webhook |
| Retry on decline | A declined payment leaves the booking `PENDING`; passenger may try a different card |
| No double-charge | A `CONFIRMED` booking cannot be charged again (409) |
| Payment traceability | On confirmation, `bookings.confirmed_payment_id` is set to the `payments.id` that succeeded; `GET /api/bookings/:ref` returns `paymentProvider` and `providerChargeId` (both null when PENDING) — the exact gateway and its transaction reference are always traceable from the booking |
| Amount in satang | 1 THB = 100 satang. `3,500 THB` → store and send `350000` |

---

## 5. Supported Payment Method

Credit card only, via **Omise** (`omise-go` SDK).

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Successful charge |
| `4111 1111 1111 1111` | Declined — `insufficient_fund` |

Cards are tokenised client-side via Omise Vault (`https://vault.omise.co/tokens`). The backend receives a single-use token (`tokn_test_...`) and passes it to the Omise charge API.

---

## 6. Cross-Functional Requirements

| Requirement | Target |
|---|---|
| Health checks | `/health/live` (always 200) and `/health/ready` (503 when DB down); no auth required |
| Rate limiting | Per-IP in-memory limiter — 10 req/min on `POST /api/payments/charge`, 30 req/min on `POST /api/bookings`, 100 req/min on `GET /api/flights/search`, 30 req/min on `GET /health/live` and `GET /health/ready` (DDoS protection — health endpoints are unauthenticated) |
| Graceful shutdown | `SIGTERM` / `SIGINT` → drain in-flight requests (10 s timeout) |
| Structured logging | `slog` JSON output; every request logged with `method`, `path`, `status`, `latency_ms` |
| Containerised | `docker compose up --build` starts all services and DB |
| Authentication (public API) | JWT RS256 `Authorization: Bearer <token>` required on all `/api/*` endpoints except `PUT /api/bookings/:ref/status`; all services verify using `JWT_PUBLIC_KEY` (public key only — private key never in any container) |
| Authentication (internal) | `PUT /api/bookings/:ref/status` is excluded from JWT; guarded by `X-Internal-Token` shared secret only (256-bit random, `openssl rand -hex 32`); compared with `crypto/subtle.ConstantTimeCompare`; service refuses to start if the value is empty |

---

## 7. Data Model Summary

| Table | Key columns |
|---|---|
| `flights` | `id`, `flight_number`, `origin`, `destination`, `departure_time`, `arrival_time`, `available_seats`, `base_price_minor` (BIGINT satang), `currency` |
| `passengers` | `id`, `first_name`, `last_name`, `email`, `phone`, `passport_number`, `date_of_birth`, `nationality` |
| `bookings` | `id`, `booking_ref` (VARCHAR 6), `flight_id`, `passenger_id`, `status` (`PENDING`/`CONFIRMED`), `confirmed_payment_id` (FK → payments), `total_amount_minor` (BIGINT satang), `currency` |
| `payments` | `id`, `booking_ref`, `payment_provider` (`OMISE`/`2C2P`/…), `provider_charge_id`, `status` (`SUCCEEDED`/`FAILED`), `amount_minor` (BIGINT satang), `currency`, `failure_code` |

> **All monetary columns are BIGINT minor units (satang). No NUMERIC/DECIMAL anywhere. Convert ÷100 only at the API boundary (handler layer).**

Schema: `infra/db/01_schema.sql`. Seed data: `infra/db/02_seed.sql`.
