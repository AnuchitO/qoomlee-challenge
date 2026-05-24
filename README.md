# Qoomlee Airline — Agent Skills Challenge

A real-world engineering challenge comparing two AI-assisted development approaches:

| Team A | Team B |
|--------|--------|
| May create and use agent skill `.md` files | Single code agent only — no skill files |

Both teams build from this identical skeleton. Judged by `SCORECARD.md`.

---

## The Flow

```
Flight Search → Booking → Payment (Omise) → Check-in → Boarding Pass
```

---

## Quick Start

```bash
# 1. Copy env and add your Omise test keys
cp .env.example .env

# 2. Build and start everything
docker compose up --build

# 3. Smoke-test: verify the skeleton is working
curl "http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15"

# 4. Open the web app
open http://localhost:3000
```

---

## Project Structure

```
├── infra/db/               PostgreSQL schema + seed data (5 flights)
├── services/
│   ├── api-gateway/        Go — reverse proxy, port 8080
│   ├── flight-service/     Kotlin/Spring Boot, port 8081
│   ├── booking-service/    Kotlin/Spring Boot, port 8082
│   ├── checkin-service/    Go/Gin, port 8083
│   └── payment-service/    Go/Gorilla Mux + Omise, port 8084
└── apps/web/               Next.js 14, TypeScript, Tailwind, port 3000
```

---

## What the Skeleton Gives You

| Layer | Status |
|-------|--------|
| PostgreSQL schema | ✅ All tables created, 5 seed flights |
| API Gateway routing | ✅ All `/api/*` paths wired |
| `GET /api/flights/search` | ✅ Real DB query |
| `POST /api/bookings` | ✅ Real DB insert, returns PNR |
| `GET /api/checkin/:ref/status` | ✅ Real DB query |
| `POST /api/payments/charge` | ✅ Real Omise test API call |
| All other endpoints | ⬜ `501 Not Implemented` — **build these** |
| Web frontend pages | ⬜ Stub shells — **build these** |

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `CHALLENGE.md` | Challenge rules and what to build |
| `SCORECARD.md` | Scoring rubric (Working × Quality × Shippable) |
| `PRD.md` | Full product requirements |
| `TECHNOLOGY_STACK_SUMMARY.md` | Tech stack reference |
| `apps/web/src/types/index.ts` | All TypeScript types |
| `apps/web/src/lib/api.ts` | API client — all endpoint functions |

---

## Omise Test Cards

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Successful charge |
| `4111 1111 1111 1111` | Declined |

Use any future expiry date and any 3-digit CVV.
