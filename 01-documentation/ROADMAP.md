# Qoomlee Airline System — Roadmap

> Last updated: 2026-08-27 | Maps all features by priority and implementation status.

---

## How to Read This

| Icon | Meaning |
|------|---------|
| ✅ | Done — implemented and tested |
| ⚠️ | Partial — basic implementation exists, needs completion |
| 🔲 | Not started — planned |
| 💡 | Aspirational — future vision, not yet scoped |

---

## Today's Architecture (What Exists)

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  Next.js Web App  │────▶│  qoomlee-service     │────▶│  PostgreSQL (qoomlee) │
│  (TypeScript)     │     │  (Go + Gin, :9988)   │     │  flights, routes,     │
│  12 screens       │     │  6 endpoints          │     │  bookings, passengers, │
│                   │     │                      │     │  checkins             │
│                   │     │  Flight + Booking     │     └──────────────────────┘
│                   │     │  Session auth         │
│                   │     │  Internal token guard │
│                   │     │  Structured logging   │
│                   │     │  Correlation IDs      │
│                   │     │  Security headers     │
│                   │     └──────────┬───────────┘
│                   │                │ PUT /api/bookings/:ref/status
│                   │     ┌──────────▼───────────┐     ┌──────────────────────┐
│                   │────▶│  payment-service     │────▶│  PostgreSQL (payment) │
│                   │     │  (Go + Gin, :9984)   │     │  payments             │
│                   │     │  2 endpoints          │     └──────────────────────┘
│                   │     │                      │
│                   │     │  Omise integration    │────▶│  Omise Payment Gateway│
│                   │     │  Rate limiting        │     └──────────────────────┘
│                   │     │  Session auth         │
│                   │     │  Structured logging   │
│                   │     │  Correlation IDs      │
│                   │     │  Security headers     │
│                   └─────┴──────────────────────┘
```

**2 services, 7 endpoints, 2 PostgreSQL instances, 1 external payment gateway.**

---

## Feature Status by Epic

### Epic Summary

| Epic | Name | Done | Partial | Not Started | Total |
|------|------|------|---------|-------------|-------|
| EPIC-01 | Flight Search & Booking | 9 | 0 | 2 | 11 |
| EPIC-02 | Payment Processing | 4 | 0 | 3 | 7 |
| EPIC-03 | Security & Authentication | 3 | 2 | 0 | 5 |
| EPIC-04 | Observability | 2 | 0 | 0 | 2 |
| EPIC-05 | Check-in & Boarding | 0 | 2 | 4 | 6 |
| EPIC-06 | Web Frontend | 23 | 0 | 0 | 23 |
| EPIC-07 | Seat Management | 0 | 0 | 5 | 5 |
| EPIC-08 | Additional Payment Methods | 0 | 0 | 3 | 3 |
| EPIC-09 | Notifications | 0 | 0 | 3 | 3 |
| EPIC-10 | Mobile Apps | 0 | 0 | 2 | 2 |
| EPIC-11 | Passenger Experience | 0 | 0 | 7 | 7 |
| EPIC-12 | Admin & Operations | 0 | 0 | 4 | 4 |
| EPIC-13 | Code Quality & Testing | 0 | 0 | 12 | 12 |

---

### EPIC-01: Flight Search & Booking

| Story | Feature | Status |
|-------|---------|--------|
| QML-001 | Search flights (public, no auth) | ✅ |
| QML-002 | View flight details | ✅ |
| QML-003 | Create booking (seat decrement, PNR generation) | ✅ |
| QML-004 | View booking details (with payment info) | ✅ |
| QML-007 | Prevent overbooking (SELECT FOR UPDATE) | ✅ |
| QML-048 | Prevent duplicate bookings (bookingToken) | ✅ |
| QML-041 | Record seat-hold expiry at booking creation | ✅ |
| QML-042 | Lazily expire stale PENDING bookings on read | ✅ |
| QML-043 | Reject confirmation & charges for expired bookings | ✅ |
| QML-052 | Cancel booking (seat release + refund trigger) | 🔲 |
| QML-013 | Passenger email validation | 🔲 |

### EPIC-02: Payment Processing

| Story | Feature | Status |
|-------|---------|--------|
| QML-005 | Charge card via Omise (synchronous) | ✅ |
| QML-006 | View payment receipt | ✅ |
| QML-008 | Prevent duplicate payments | ✅ |
| QML-009 | Handle payment failures gracefully (record FAILED, allow retry) | ✅ |
| QML-053 | Refund payment on cancellation | 🔲 |
| QML-047 | Pay from booking detail page (web) | 🔲 |
| QML-054 | Cancel booking from Manage Trip (web) | 🔲 |

### EPIC-03: Security & Authentication

| Story | Feature | Status |
|-------|---------|--------|
| QML-010 | JWT RS256 authentication | ⚠️ Use session tokens (opaque Bearer), not JWT RS256 |
| QML-011 | Internal token guard (X-Internal-Token) | ✅ |
| QML-012 | Rate limiting | ⚠️ Done in payment-service only. Not in qoomlee-service. |
| QML-039 | HTTP security headers (API services) | ✅ |
| QML-040 | HTTP security headers + CSP (web) | ✅ |

### EPIC-04: Observability

| Story | Feature | Status |
|-------|---------|--------|
| QML-014 | Request correlation ID | ✅ |
| QML-015 | Structured request logging (slog JSON) | ✅ |

### EPIC-05: Check-in & Boarding

| Story | Feature | Status |
|-------|---------|--------|
| QML-049 | Online check-in (POST /api/checkins) | 🔲 |
| QML-050 | View check-in status | 🔲 |
| QML-051 | View boarding pass | 🔲 |
| QML-055 | Check-in time window (24h–1h before departure) | 🔲 |
| QML-029 | Online check-in UI (web) | ⚠️ Frontend exists, needs backend |
| QML-030 | View boarding passes UI (web) | ⚠️ Frontend exists, needs backend |

### EPIC-06: Web Frontend

| Story | Feature | Status |
|-------|---------|--------|
| QML-016 | Search form — core behavior | ✅ |
| QML-017 | Search form — desktop layout | ✅ |
| QML-018 | Search form — mobile layout | ✅ |
| QML-019 | Date range picker — core | ✅ |
| QML-020 | Date range picker — desktop | ✅ |
| QML-021 | Date range picker — mobile | ✅ |
| QML-022 | Flight search results | ✅ |
| QML-023 | Travelers & class — desktop | ✅ |
| QML-024 | Travelers & class — mobile | ✅ |
| QML-025 | Create booking form | ✅ |
| QML-026 | Booking confirmation with copy PNR | ✅ |
| QML-027 | View my bookings | ✅ |
| QML-028 | Pay for booking | ✅ |
| QML-031 | Login & registration | ✅ |
| QML-032 | Manage profile | ✅ |
| QML-033 | Airport select — desktop | ✅ |
| QML-034 | Airport select — mobile | ✅ |
| QML-035 | Popular destinations & travel tips | ✅ |
| QML-036 | Flight status lookup | ✅ |
| QML-037 | Travel requirements | ✅ |
| QML-038 | App navigation (desktop + mobile) | ✅ |
| QML-044 | Server-derived payment countdown | ✅ |
| QML-045 | Handle expiry mid-submit | ✅ |
| QML-046 | "My Bookings" backed by real data | ✅ |

---

## Prioritized Roadmap

### 🔴 Short-term (Next Sprint)

Critical path — these are blocking the full booking flow:

| Priority | Epic | Story | What | Effort |
|----------|------|-------|------|--------|
| P0 | EPIC-03 | QML-010 | **Upgrade auth to JWT RS256.** Replace session token with real JWT verification. Already have `golang-jwt/jwt/v5` as dependency. Middleware pattern exists — swap session extraction for `jwt.ParseWithClaims`. | S |
| P0 | EPIC-03 | QML-012 | **Add rate limiting to qoomlee-service.** Port the `ratelimit.go` pattern from payment-service to qoomlee-service. Protect search and booking endpoints. | XS |
| P1 | EPIC-02 | QML-047 | **Pay from Booking Detail.** Wire "Complete Payment" button on booking detail page → `/payment?ref=X`. Reuse existing payment page. | XS |
| P1 | EPIC-01 | QML-013 | **Passenger email validation.** Add email format validation in `POST /api/bookings` handler. | XS |

### 🟡 Medium-term (2–3 Sprints)

Completing the booking lifecycle:

| Priority | Epic | Story | What | Effort |
|----------|------|-------|------|--------|
| P2 | EPIC-01 | QML-052 | **Cancel booking (backend).** `PUT /api/bookings/:ref/cancel` — release seat, update status. For CONFIRMED: call payment-service refund. | M |
| P2 | EPIC-02 | QML-053 | **Refund payment (backend).** `POST /api/payments/:ref/refund` — internal endpoint. Call Omise refund API, record result. | M |
| P2 | EPIC-02 | QML-054 | **Cancel booking (web).** Add confirmation dialog to Manage Trip page. Wire to QML-052 endpoint. | S |
| P3 | EPIC-05 | QML-049 | **Online check-in (backend).** `POST /api/checkins` — validate booking, assign seat, generate boarding pass barcode. | M |
| P3 | EPIC-05 | QML-050 | **View check-in status.** `GET /api/checkins/:ref` — return check-in record with nested flight + passenger. | S |
| P3 | EPIC-05 | QML-051 | **View boarding pass.** `GET /api/checkins/:ref/boarding-pass` — return barcode, gate, boarding time. | S |
| P3 | EPIC-05 | QML-055 | **Check-in time window.** 24h before to 1h before departure. Add time check to QML-049 handler. | XS |

### 🟢 Long-term (Future)

Features that expand the system beyond the core booking flow:

**EPIC-07: Seat Management**
- Seat configuration per aircraft type (seat maps, rows, columns, fare classes)
- Seat inventory per flight (AVAILABLE → LOCKED → BOOKED → CHECKED_IN)
- Seat lock TTL (8-minute hold during booking)
- Interactive seat map UI (from `stitch_ui_prompt.md` seat_selection screen)
- Seat upgrade/purchase flow

**EPIC-08: Additional Payment Methods**
- PromptPay QR code generation
- Bank transfer
- Payment method selection UI (from `stitch_ui_prompt.md` payment screen)

**EPIC-09: Notifications**
- Email confirmations (booking, payment, check-in)
- SMS alerts (flight delays, gate changes)
- Push notifications (mobile apps)

**EPIC-04: Observability** (expansion)
- Prometheus metrics endpoint on both services
- Grafana dashboards (request rates, error rates, latency)
- Distributed tracing with Jaeger/OpenTelemetry

**EPIC-10: Mobile Apps**
- iOS (Swift/SwiftUI) — from `stitch_ui_prompt.md` mobile screens
- Android (Kotlin/Jetpack Compose)

**EPIC-11: Passenger Experience**
- Travel insurance purchase flow
- Special meal requests
- Mobility assistance
- Visa requirement checker
- Health document upload
- Multi-passenger bookings

**EPIC-12: Admin & Operations**
- Flight creation/management UI
- Staff authentication and RBAC
- Booking management dashboard
- Reporting & analytics

---

## EPIC-13: Code Quality & Testing (from flight-search-review.md)

These were identified in the code review (2026-06-23). Verify current status before acting.

| Story | Area | Severity | What |
|-------|------|----------|------|
| QML-069 | Money | HIGH | Fix float64 in price formatting (use integer division) |
| QML-070 | UI | BUG | FlightCard shows status as cabin class label |
| QML-071 | Tests | HIGH | Mock argument verification in handler tests |
| QML-072 | Arch | MEDIUM | Move timezone conversion to service layer |
| QML-073 | Validation | LOW | Add IATA format + passengers bounds validation |
| QML-074 | Tests | MEDIUM | FlightCard test coverage + accessibility |
| QML-075 | Error | MEDIUM | Results page error handling (NaN, fragile reload) |
| QML-076 | Tests | MEDIUM | FilterChips + PassengerSelector tests |
| QML-077 | E2E | MEDIUM | E2E: results page renders cards + empty state |
| QML-078 | E2E | LOW | E2E: round-trip flow + sort |
| QML-079 | Tests | LOW | Backend test polish (parallel, slog silence, boundary) |
| QML-080 | Cleanup | LOW | Dead code removal, type tightening, URL extraction |

---

## Technical Debt Management

### Debt Categories

| Category | Description | Stories |
|----------|-------------|---------|
| **Code Quality** | Float precision, dead code, type safety | QML-069, QML-080 |
| **Test Coverage** | Missing/incomplete tests, mock verification, E2E gaps | QML-071, QML-074, QML-076, QML-077, QML-078, QML-079 |
| **Architecture** | Layer violations, timezone handling placement | QML-072 |
| **UI/UX Bugs** | Display bugs, error handling fragility | QML-070, QML-075 |
| **Validation** | Missing input format/bounds checks | QML-073 |
| **Security** | Auth gap (session vs JWT), rate limit gap | QML-010, QML-012 |
| **Dependencies** | <!-- TODO: audit Go/JS dependency versions, CVE scan --> | — |

### Debt Register

| ID | Category | Severity | Item | Status | Introduced | Target Resolution |
|----|----------|----------|------|--------|------------|-------------------|
| TD-001 | Security | HIGH | Session tokens instead of JWT RS256 (QML-010) | Open | Initial design | Next sprint |
| TD-002 | Security | MEDIUM | No rate limiting on qoomlee-service (QML-012) | Open | Initial design | Next sprint |
| TD-003 | Code Quality | HIGH | float64 price formatting — money precision risk (QML-069) | Open | Initial code | Next sprint |
| TD-004 | UI/UX | BUG | FlightCard shows status as cabin class (QML-070) | Open | Initial code | Next sprint |
| TD-005 | Test Coverage | HIGH | Mock argument verification missing (QML-071) | Open | Initial tests | Next sprint |
| TD-006 | Architecture | MEDIUM | Timezone conversion in handler, not service layer (QML-072) | Open | Initial code | 2–3 sprints |
| TD-007 | UI/UX | MEDIUM | Results page NaN + fragile reload (QML-075) | Open | Initial code | 2–3 sprints |
| TD-008 | Validation | LOW | No IATA format + passenger bounds validation (QML-073) | Open | Initial code | 2–3 sprints |
| TD-009 | Code Quality | LOW | Dead code, type tightening, URL extraction (QML-080) | Open | Refactor | Backlog |
| TD-010 | Dependencies | <!-- TODO: severity? --> | <!-- TODO: dependency audit + CVE scan not yet performed --> | Open | — | Backlog |
| TD-011 | Test Coverage | <!-- TODO: coverage % baseline? --> | <!-- TODO: measure current test coverage % per package --> | Open | — | Backlog |

### Management Process

1. **Sprint Allocation** — Reserve 15–20% of sprint capacity for tech debt payoff. Pick items from the register by severity (HIGH → MEDIUM → LOW).
2. **Debt Introduction Review** — Every PR that introduces known tech debt must create a TD register entry with justification and target resolution sprint.
3. **Quarterly Audit** — <!-- TODO: schedule quarterly tech debt review. Review register, re-score severity, close resolved items. -->
4. **Visibility** — This register is reviewed at sprint planning. Items marked HIGH are candidates for the next sprint unless explicitly deferred with reason.
5. **Definition of Done** — No new HIGH-severity tech debt may be introduced without an acknowledged TD register entry. <!-- TODO: formalize DoD checklist -->

---

## Dependency Graph

```
Short-term (no blockers)
├── QML-010 (JWT) ── independent
├── QML-012 (Rate limit) ── independent
├── QML-047 (Pay from detail) ── independent
└── QML-013 (Email validation) ── independent

Medium-term
├── QML-052 (Cancel booking) ── independent
│   └── QML-053 (Refund) ── needed by QML-052 (for CONFIRMED bookings)
├── QML-054 (Cancel UI) ── depends on QML-052
├── QML-049 (Check-in) ── independent
│   └── QML-055 (Time window) ── extends QML-049
├── QML-050 (Check-in status) ── depends on QML-049
└── QML-051 (Boarding pass) ── depends on QML-049

Long-term
├── Seat Module ── independent (new service or new package)
├── Notifications ── independent
├── Observability ── independent
└── Mobile Apps ── independent
```

---

## Related Documents

- [CHALLENGE.md](../CHALLENGE.md) — Full story descriptions and acceptance criteria
- [API_SPECS.md](../API_SPECS.md) — Current API contract
- [flight-search-review.md](flight-search-review.md) — Detailed code review with findings
- [stitch_ui_prompt.md](stitch_ui_prompt.md) — UI design spec (38 screens, aspirational)