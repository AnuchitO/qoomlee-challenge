# Qoomlee — Architecture Directory

## Overview

This directory contains system architecture documentation and diagrams for the Qoomlee Airline System, reflecting the **actual implemented architecture** — 2 Go services, a Next.js frontend, and 2 PostgreSQL databases.

## File Structure

### C4 Model Diagrams

| File | Level | What it shows |
|------|-------|---------------|
| [`c4/Qoomlee_C4_L1_Context.d2`](c4/Qoomlee_C4_L1_Context.d2) | System Context | Passengers, ground agents, Qoomlee system, Omise payment gateway |
| [`c4/Qoomlee_C4_L2_Container.d2`](c4/Qoomlee_C4_L2_Container.d2) | Container | Next.js web app, qoomlee-service, payment-service, 2 PostgreSQL instances |
| [`c4/Qoomlee_C4_L3_Component.d2`](c4/Qoomlee_C4_L3_Component.d2) | Component | Internal components: handlers, services, repositories, middleware, clients |

> `.d2` files are source code for the [D2 diagramming tool](https://d2lang.com/). Render with: `d2 file.d2 file.svg`

### API Reference

| File | Purpose |
|------|---------|
| [`api/API_REFERENCE.md`](api/API_REFERENCE.md) | Concise reference of all 7 endpoints with auth requirements |

## Architecture at a Glance

```
Passenger/Agent → Next.js Web App → qoomlee-service (Go) → PostgreSQL (qoomlee)
                                  → payment-service (Go) → PostgreSQL (payment)
                                                           → Omise API
```

### Core Services

| Service | Language | Port | Responsibility |
|---------|----------|------|----------------|
| Next.js Web App | TypeScript | 3000 | Flight search, booking form, payment, my bookings, check-in |
| qoomlee-service | Go + Gin | 9988 | Flights (search + detail), bookings (CRUD + status), session auth |
| payment-service | Go + Gin | 9984 | Card charges via Omise, payment receipts, rate limiting |

### Data Stores

| Database | Owned by | Tables |
|----------|----------|--------|
| PostgreSQL (qoomlee) | qoomlee-service | flights, routes, passengers, bookings, checkins, boarding_passes |
| PostgreSQL (payment) | payment-service | payments |

### External Systems

| System | Used by | Purpose |
|--------|---------|---------|
| Omise Payment Gateway | payment-service | Credit/debit card processing |

### Infrastructure (both services)

- Structured JSON logging (slog)
- Request correlation IDs
- Security headers (CORS, Cache-Control, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- Graceful shutdown
- Health checks (liveness + readiness)

## Key Concepts

- **Monolith-friendly modularity**: 2 services, not 8. Each service owns its domain end-to-end.
- **Handler → Service → Repository**: Clean layered architecture with interface-driven testability.
- **Lazy expiry**: PENDING bookings expire on read (no background sweeper).
- **SELECT FOR UPDATE**: Prevents overbooking under concurrent requests.
- **Session auth**: Opaque Bearer tokens (upgrade to JWT RS256 planned — see roadmap).

## Related Documents

- [ROADMAP.md](../01-documentation/ROADMAP.md) — Feature status and priorities
- [API_REFERENCE.md](api/API_REFERENCE.md) — Endpoint reference
- [API_SPECS.md](../API_SPECS.md) — Full API contract with examples
- [CHALLENGE.md](../CHALLENGE.md) — Story descriptions and acceptance criteria
- [flight-search-review.md](../01-documentation/flight-search-review.md) — Code review findings
- [stitch_ui_prompt.md](../01-documentation/stitch_ui_prompt.md) — UI design spec (aspirational)