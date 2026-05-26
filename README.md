# Qoomlee Airline — Agent Skills Challenge

⏺ Overview — At a Glance

  What: Build a REST API backend for a the airline called Qoomlee.

  The user journey:

```
Search Flights → Book a Seat → Pay → Get Confirmation
```

  2 services, 7 endpoints:
  - qoomlee-service :8082 — search flights, get flight detail, create booking, view booking, update status (internal)
  - payment-service :8084 — charge a card, view payment receipt

  Plus 6 infrastructure requirements on both services:
  health checks, rate limiting, graceful shutdown, structured logging, JWT auth, internal token

  What's given to you: schema, seed data, API specs, Docker Compose, test scripts — but zero business logic. You build everything from scratch.

  Stack: Go + Gin, PostgreSQL (2 instances), Omise for payments.


---

## Key Documents

| File | Purpose |
|------|---------|
| [`CHALLENGE.md`](CHALLENGE.md) | What to build, implementation hints, requirements |
| [`API_SPECS.md`](API_SPECS.md) | Request/response contract for every endpoint |
| [`SCORECARD.md`](SCORECARD.md) | Scoring rubric — 100 pts across 4 pillars |
| [`TECHNOLOGY_STACK_SUMMARY.md`](TECHNOLOGY_STACK_SUMMARY.md) | Stack reference, Go patterns, env vars |

---


## Quick Start

```bash
# 1. Get free Omise test keys → https://dashboard.omise.co
cp .env.example .env
# Edit .env — set OMISE_PUBLIC_KEY and OMISE_SECRET_KEY

# 2. Start the stack
docker compose up --build

# 3. Verify postgres is up (endpoints return 501 until you implement them)
curl "http://localhost:8082/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15"
```

## JWT Development Guide

All API endpoints require JWT authentication. For development:

1. **Default keys included**: The `.env.example` file contains development JWT keys for immediate testing
2. **Generate tokens**: Use `make jwt-token` to generate valid test tokens
3. **Use in requests**: Include in headers as `Authorization: Bearer <token>`

Example:
```bash
# Generate a test token
TOKEN=$(make jwt-token -s)

# Use in API calls
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8082/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15"
```

---

## Project Structure

```
├── services/
│   ├── qoomlee/            Go + Gin, port 8082 (flights + bookings)
│   └── payment/            Go + Gin + Omise SDK, port 8084
├── infra/
│   └── db/
│       ├── qoomlee/        Schema + seed data for qoomlee-service
│       └── qoomlee-payment/ Schema + seed data for payment-service
├── tests/k6/               K6 load test scripts
└── scripts/                Smoke, contract, and check-all scripts
```

---

## What's Provided

| Provided | What's inside |
|---|---|
| `infra/db/qoomlee/` | Schema + seed for flights, routes, passengers, bookings |
| `infra/db/qoomlee-payment/` | Schema + seed for payments |
| `docker-compose.yml` | Spins up 2 postgres instances + both services |
| `API_SPECS.md` | Exact request/response shape for every endpoint |

**Build everything from scratch.** Read `CHALLENGE.md` for what to build and in what order.

---

## Omise Test Cards

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Successful charge |
| `4111 1111 1111 1111` | Declined — `insufficient_fund` |

Use any future expiry (e.g. `12/2028`) and any 3-digit CVV.
