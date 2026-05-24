# Qoomlee Airline — Agent Skills Challenge

A real-world engineering challenge comparing two AI-assisted development approaches.

| Team A | Team B |
|--------|--------|
| May create and use agent skill `.md` files | Single code agent only — no skill files |

Both teams start from this identical skeleton. Judged by `SCORECARD.md`.

---

## The Flow

```
Search Flights → Book a Seat → Pay → Get Confirmation
```

---

## Quick Start

```bash
# 1. Get free Omise test keys → https://dashboard.omise.co
cp .env.example .env
# Edit .env — set OMISE_PUBLIC_KEY and OMISE_SECRET_KEY

# 2. Start the stack
docker compose up --build

# 3. Verify postgres is up (endpoints return 501 until you implement them)
curl "http://localhost:8080/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15"
```

---

## Project Structure

```
├── infra/
│   ├── db/                 PostgreSQL schema (01_schema.sql) + seed data (02_seed.sql)
│   └── k8s/                Kubernetes manifests skeleton — fill in the TODOs
├── services/
│   ├── api-gateway/        Go + Gin, port 8080 — reverse proxy
│   ├── flight-service/     Go + Gin, port 8081
│   ├── booking-service/    Go + Gin, port 8082
│   └── payment-service/    Go + Gin + Omise SDK, port 8084
├── tests/k6/               K6 load test scripts
└── scripts/                Smoke, contract, and check-all scripts
```

---

## What the Skeleton Gives You

| Provided | What's inside |
|---|---|
| `infra/db/` | Schema for all tables + 5 seed flights |
| `services/*/model/` | Go struct definitions matching the DB schema |
| `services/*/db/` | PostgreSQL connection helper |
| `services/*/handler/` | Gin handler stubs — all return `501 Not Implemented` |
| `services/*/repository/` | Repository stubs — all return `errors.New("not implemented")` |
| `infra/k8s/` | K8s Deployment/Service/ConfigMap/Secret skeletons |
| `API_SPECS.md` | Exact request/response shape for every endpoint |

**Nothing is implemented.** Read `CHALLENGE.md` for what to build and in what order.

---

## Key Documents

| File | Purpose |
|------|---------|
| `CHALLENGE.md` | What to build, implementation hints, rules |
| `API_SPECS.md` | Request/response contract for every endpoint |
| `SCORECARD.md` | Scoring rubric — 100 pts across 4 pillars |
| `TECHNOLOGY_STACK_SUMMARY.md` | Stack reference, Go patterns, env vars |

---

## Omise Test Cards

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Successful charge |
| `4111 1111 1111 1111` | Declined — `insufficient_fund` |

Use any future expiry (e.g. `12/2028`) and any 3-digit CVV.
