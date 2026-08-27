# Seat Service — Architecture Overview

> ⚠️ **Aspirational** — The seat module does not exist yet. See `01-documentation/ROADMAP.md` for the long-term plan.

## Overview

The Seat Service is the single authority for all seat-related state in the Qoomlee system. It owns seat configuration per aircraft type, seat inventory per flight, and the full seat lifecycle from `AVAILABLE` through `LOCKED → BOOKED → CHECKED_IN → BOARDED`. Both the Booking Service and the Check-in Service delegate all seat state changes to this service via REST.

## Technology Stack

| Property | Value |
|----------|-------|
| Language | Kotlin |
| Framework | Spring Boot |
| Database | PostgreSQL (primary) |
| Cache | Redis (availability cache, 30-sec TTL) |
| Deployment | Docker / GCP Cloud Run |

**Rationale for Kotlin / Spring Boot:**
- Seat inventory management involves a multi-state state machine with strict transition rules — Spring State Machine provides a robust, auditable implementation.
- Optimistic locking for concurrent seat requests is well-supported via JPA `@Version`.
- Complex business rules (fare class constraints, block management, audit logging) benefit from Kotlin's expressive data modelling and Spring's dependency injection.
- Consistent with other business-logic-heavy services (Booking, Passenger, Flight).

## Core Responsibilities

1. **Seat Configuration** — Define seat maps per aircraft type (seat number, row, column, type, fare class, features).
2. **Seat Inventory Initialisation** — Create per-flight seat inventory when a flight is created by Flight Service.
3. **Seat Availability Query** — Return real-time available seats for booking and check-in consumers.
4. **Seat Lock Management** — Place 8-minute TTL locks during booking sessions; prevent double-booking under concurrency.
5. **Seat Booking Confirmation** — Transition locked seats to permanently booked after payment.
6. **Seat Release** — Return seats to available on booking cancellation.
7. **Seat Assignment at Check-in** — Allow seat changes during the check-in window.
8. **Seat Check-in Confirmation** — Mark seats as CHECKED_IN after passenger completes check-in.
9. **Seat Block Management** — Allow ops admins to block/unblock seats (CREW, MAINTENANCE, VIP, WEIGHT_BALANCE).

## Key Components (C4 Level 3)

```
Seat Service (Kotlin / Spring Boot)
├── SeatConfigController        — CRUD on seat_configurations per aircraft type
├── SeatInventoryManager        — Manages seat status state machine per flight
│     └── SeatStateMachine      — Enforces valid transitions: AVAILABLE→LOCKED→BOOKED→CHECKED_IN
├── SeatLockHandler             — Creates/confirms/releases 8-min TTL locks (concurrent-safe)
├── SeatAssignmentHandler       — Handles check-in seat changes and check-in confirmation
├── SeatMapBuilder              — Assembles full seat grid with live availability overlay for frontend
├── SeatRepository              — JPA/Hibernate CRUD on seat_configurations + seat_inventory + seat_locks
└── CircuitBreaker              — Resilience4j circuit breaker for downstream calls
```

## Seat Status State Machine

```
AVAILABLE ──lock()──▶ LOCKED ──confirm()──▶ BOOKED ──checkin()──▶ CHECKED_IN
     ▲                   │                    │
     │                   │ release()          │ cancel()
     │                   ▼                    ▼
     └──────────────── AVAILABLE ◀──────────── AVAILABLE
```

## Database Tables

### seat_configurations
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Auto-increment |
| aircraft_type_id | VARCHAR | e.g. "ac_boeing737" |
| seat_number | VARCHAR | e.g. "12A" |
| row_number | INT | |
| column_letter | CHAR(1) | |
| seat_type | VARCHAR | WINDOW, MIDDLE, AISLE |
| fare_class | VARCHAR | ECONOMY, PREMIUM_ECONOMY, BUSINESS |
| features | JSONB | ["EXTRA_LEGROOM", "EXIT_ROW"] |

### seat_inventory
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Auto-increment |
| flight_id | BIGINT FK | References flights.id |
| seat_configuration_id | BIGINT FK | References seat_configurations.id |
| status | VARCHAR | AVAILABLE, LOCKED, BOOKED, CHECKED_IN, BOARDED, BLOCKED |
| locked_at | TIMESTAMPTZ | When the lock was placed |
| locked_until | TIMESTAMPTZ | Lock expiry (8 min TTL) |
| booking_id | BIGINT FK | Which booking holds this seat |
| version | INT | Optimistic lock version |

### seat_locks
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Auto-increment |
| seat_inventory_id | BIGINT FK | |
| booking_id | BIGINT FK | |
| ttl_seconds | INT | Default 480 (8 min) |
| created_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | |

## Concurrency Strategy

1. **Optimistic locking** (`@Version` on `seat_inventory`) for seat state transitions.
2. **Redis fast-reject** — check seat availability in Redis (30-sec TTL) before hitting PostgreSQL.
3. **SELECT FOR UPDATE** on the specific seat row during lock/confirm operations.
4. **8-minute TTL** on locks — expired locks are lazily released on read.

## Integration Points

| Consumer | Calls | Purpose |
|----------|-------|---------|
| Booking Service | POST /seats/lock | Lock seat during booking |
| Booking Service | POST /seats/confirm | Confirm after payment |
| Booking Service | POST /seats/release | Release on cancellation |
| Flight Service | POST /seats/inventory/init | Initialize on flight creation |
| Check-in Service | GET /seats/flight/:id | Get seat map for check-in |
| Check-in Service | POST /seats/assign | Assign seat at check-in |
| Frontend | GET /seats/flight/:id | Display seat map to passenger |