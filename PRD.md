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

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Health checks | `/health/live` (always 200) and `/health/ready` (503 when DB down) |
| Rate limiting | Per-IP in-memory limiter — 10 req/min on `POST /payments/charge`, 30 req/min on `POST /bookings`, 100 req/min on `GET /flights/search` |
| Graceful shutdown | `SIGTERM` / `SIGINT` → drain in-flight requests (10 s timeout) |
| Structured logging | `slog` JSON output; every request logged with `method`, `path`, `status`, `latency_ms` |
| Containerised | `docker compose up --build` starts all services and DB |

---

## 7. Data Model Summary

| Table | Key columns |
|---|---|
| `flights` | `id`, `flight_number`, `origin`, `destination`, `departure_time`, `arrival_time`, `available_seats`, `base_price` |
| `passengers` | `id`, `first_name`, `last_name`, `email`, `phone`, `passport_number`, `date_of_birth`, `nationality` |
| `bookings` | `id`, `booking_ref` (VARCHAR 6), `flight_id`, `passenger_id`, `status` (`PENDING`/`CONFIRMED`), `total_amount`, `currency` |
| `payments` | `id`, `booking_ref`, `omise_charge_id`, `status` (`SUCCEEDED`/`FAILED`), `amount` (satang), `currency`, `failure_code` |

Schema: `infra/db/01_schema.sql`. Seed data: `infra/db/02_seed.sql`.
