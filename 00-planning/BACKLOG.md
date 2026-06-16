# Qoomlee Master Backlog

> **Source of truth for QML-xxx numbers:** `CHALLENGE.md`
> Planning details merged from `00-planning/` files.
> Old-style IDs (AUTH-xxx, FLIGHT-xxx, BOOK-xxx, SEAT-xxx, etc.) noted for traceability.
> Each story appears **once** under its canonical QML number — no duplicates.

---

## Story Status Dashboard

### EPIC: Flight Discovery
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-001 | Search Flights | FLIGHT-002 | qoomlee-service | ✅ Done |
| QML-002 | View Flight Details | FLIGHT-002 | qoomlee-service | ✅ Done |
| QML-066 | Flight Creation Interface — Admin | FLIGHT-001 | qoomlee-service | ⬜ Todo |
| QML-067 | Flight Search Filtering & Sorting | FLIGHT-003 | web | ⬜ Todo |
| QML-068 | Real-time Flight Status API | FLIGHT-004 | qoomlee-service + web | ⬜ Todo |

### EPIC: Booking
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-003 | Create a Booking | BOOK-002 | qoomlee-service | ✅ Done |
| QML-004 | View Booking Details | BOOK-002 | qoomlee-service | ✅ Done |
| QML-007 | Prevent Overbooking | — | qoomlee-service | ✅ Done |
| QML-013 | Passenger Email Validation | BOOK-001 | qoomlee-service | ⬜ Todo |
| QML-048 | Prevent Duplicate Bookings on Back Navigation | — | qoomlee-service + web | ✅ Done |
| QML-059 | Special Assistance & Meal Requests | BOOK-004 | qoomlee-service + web | ⬜ Todo |
| QML-060 | Travel Insurance Selection | BOOK-005 | qoomlee-service + web | ⬜ Todo |
| QML-061 | Flight Change Request | BOOK-007 | qoomlee-service + web | ⬜ Todo |
| QML-062 | Post-Booking Ancillary Services | BOOK-008 | qoomlee-service + web | ⬜ Todo |

### EPIC: Payment
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-005 | Pay for Booking | PAY-001 | payment-service | ⬜ Todo |
| QML-006 | View Payment Receipt | PAY-001 | payment-service | ⬜ Todo |
| QML-008 | Prevent Duplicate Payments | — | payment-service | ⬜ Todo |
| QML-009 | Handle Payment Failures Gracefully | — | payment-service | ⬜ Todo |
| QML-063 | Booking Cancellation & Refund Processing | PAY-002 | payment-service + web | ⬜ Todo |

### EPIC: Platform Security & Observability
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-010 | Secure Authentication via JWT | AUTH-002, AUTH-003 | both services | ⬜ Todo |
| QML-011 | Internal Token Guard Middleware | — | qoomlee-service | ⬜ Todo |
| QML-012 | Rate Limiting | — | both services | ⬜ Todo |
| QML-014 | Request Correlation ID | — | both services | ⬜ Todo |
| QML-015 | Structured Request Logging | — | both services | ⬜ Todo |

### EPIC: Seat Management (new)
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-049 | Seat Configuration Management | SEAT-001 | qoomlee-service | ⬜ Todo |
| QML-050 | Seat Inventory Initialisation on Flight Creation | SEAT-002 | qoomlee-service | ⬜ Todo |
| QML-051 | Seat Availability Query | SEAT-003 | qoomlee-service | ⬜ Todo |
| QML-052 | Seat Lock During Booking Session | SEAT-004 | qoomlee-service | ⬜ Todo |
| QML-053 | Seat Booking Confirmation | SEAT-005 | qoomlee-service | ⬜ Todo |
| QML-054 | Seat Release on Cancellation | SEAT-006 | qoomlee-service | ⬜ Todo |
| QML-055 | Seat Change at Check-in | SEAT-007 | qoomlee-service | ⬜ Todo |
| QML-056 | Seat Check-in Confirmation | SEAT-008 | qoomlee-service | ⬜ Todo |
| QML-057 | Seat Map Visualisation Endpoint | SEAT-009 | qoomlee-service + web | ⬜ Todo |
| QML-058 | Seat Block Management | SEAT-010 | qoomlee-service | ⬜ Todo |

### EPIC: Web — Flight Search Experience
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-016 | Flight Search Form — Core behaviour | — | web | ✅ Done |
| QML-017 | Flight Search Form — Desktop layout | — | web · desktop | ✅ Done |
| QML-018 | Flight Search Form — Mobile layout | — | web · mobile | ✅ Done |
| QML-019 | Date Range Picker — Core behaviour | — | web | ✅ Done |
| QML-020 | Date Range Picker — Desktop | — | web · desktop | ✅ Done |
| QML-021 | Date Range Picker — Mobile | — | web · mobile | ✅ Done |
| QML-022 | View Flight Search Results | — | web | ✅ Done |
| QML-023 | Travelers & Class — Desktop | — | web · desktop | ✅ Done |
| QML-024 | Travelers & Class — Mobile | — | web · mobile | ✅ Done |

### EPIC: Web — Booking Journey
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-025 | Create a Booking | BOOK-001, BOOK-002 | web | ✅ Done |
| QML-026 | Booking Confirmation with Copy PNR | — | web | ✅ Done |
| QML-027 | View My Bookings | BOOK-006 | web | ✅ Done |
| QML-028 | Pay for a Booking | PAY-001 | web | ✅ Done |

### EPIC: Web — My Trips
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-029 | Online Check-in | CHECK-001 | web | ✅ Done |
| QML-030 | View Boarding Passes | BPASS-001 | web | ✅ Done |
| QML-047 | Manage Your Trip | — | web | ✅ Done |

### EPIC: Web — Account & Profile
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-031 | Login & Registration | AUTH-001, AUTH-002, AUTH-006 | web | ✅ Done |
| QML-032 | Manage Profile | AUTH-005 | web | ✅ Done |
| QML-064 | Password Reset / Forgot Password | AUTH-004 | web | ⬜ Todo |
| QML-065 | Email Verification After Registration | AUTH-006 | web | ⬜ Todo |

### EPIC: Web — Airport Selection
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-033 | Airport Select — Desktop Dropdown | — | web · desktop | ✅ Done |
| QML-034 | Airport Select — Mobile Bottom Sheet | — | web · mobile | ✅ Done |

### EPIC: Web — Discovery
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-035 | Popular Destinations & Travel Tips | — | web | ✅ Done |
| QML-036 | Check Flight Status | FLIGHT-004 | web | ✅ Done |
| QML-037 | View Travel Requirements | COMP-001 | web | ✅ Done |

### EPIC: Web — App Shell
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-038 | App Navigation | — | web | ✅ Done |

### EPIC: Platform Security (Cross-cutting)
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-039 | HTTP Security Headers — API Services | — | both services | ✅ Done |
| QML-040 | HTTP Security Headers — Web Frontend | — | web | ✅ Done |

### EPIC: Booking Expiry & Status (Cross-cutting)
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-041 | Record Seat-Hold Expiry at Booking Creation | — | qoomlee-service | ✅ Done |
| QML-042 | Lazily Expire Stale Pending Bookings on Read | — | qoomlee-service | ✅ Done |
| QML-043 | Reject Confirmation & Charges for Expired Bookings | — | both services | ✅ Done |
| QML-044 | Server-Derived Payment Countdown | — | web | ✅ Done |
| QML-045 | Handle Expiry Mid-Submit | — | web | ✅ Done |
| QML-046 | "My Bookings" Backed by Real Data | — | web + qoomlee-service | ✅ Done |

### EPIC: Travel Compliance (new)
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-069 | Travel Requirements & Visa Checker | COMP-001 | qoomlee-service + web | ⬜ Todo |
| QML-070 | Health Documentation Upload | COMP-002 | qoomlee-service + web | ⬜ Todo |
| QML-071 | Pre-travel Preparation Checklist | COMP-003 | qoomlee-service + web | ⬜ Todo |

### EPIC: Passenger Services (new)
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-072 | Airport Information Guide | SERV-001 | web | ⬜ Todo |
| QML-073 | Customer Support Hub | SERV-002 | web | ⬜ Todo |

---

## Old ID → QML Cross-Reference

| Old ID | Maps to QML | Notes |
|--------|-------------|-------|
| AUTH-001 | QML-031 | Login & Registration (registration sub-feature) |
| AUTH-002 | QML-031, QML-010 | Login sub-feature; JWT auth |
| AUTH-003 | QML-010, QML-011 | RBAC is part of JWT/internal token guard |
| AUTH-004 | QML-064 | Password Reset — new story |
| AUTH-005 | QML-032 | Manage Profile |
| AUTH-006 | QML-065 | Email Verification — new story |
| FLIGHT-001 | QML-066 | Admin flight creation — new story |
| FLIGHT-002 | QML-001, QML-016–022 | Search Flights (service + web) |
| FLIGHT-003 | QML-067 | Filtering & Sorting — new story |
| FLIGHT-004 | QML-068 | Real-time Status API (QML-036 covers web UI) |
| BOOK-001 | QML-025, QML-013 | Passenger info (web form + email validation) |
| BOOK-002 | QML-003, QML-025 | Booking creation (service + web) |
| BOOK-003 | QML-005, QML-028 | Payment integration (service + web) |
| BOOK-004 | QML-059 | Special Assistance & Meal — new story |
| BOOK-005 | QML-060 | Travel Insurance — new story |
| BOOK-006 | QML-027, QML-046, QML-047 | Booking Management Hub (all merged/done) |
| BOOK-007 | QML-061 | Flight Change — new story |
| BOOK-008 | QML-062 | Ancillary Services — new story |
| PAY-001 | QML-005, QML-006, QML-028 | Payment (service + web) |
| PAY-002 | QML-063 | Cancellation & Refund — new story |
| CHECK-001 | QML-029 | Online Check-in |
| BPASS-001 | QML-030 | Boarding Passes |
| SEAT-001 | QML-049 | Seat Configuration Management |
| SEAT-002 | QML-050 | Seat Inventory Initialisation |
| SEAT-003 | QML-051 | Seat Availability Query |
| SEAT-004 | QML-052 | Seat Lock During Booking |
| SEAT-005 | QML-053 | Seat Booking Confirmation |
| SEAT-006 | QML-054 | Seat Release on Cancellation |
| SEAT-007 | QML-055 | Seat Change at Check-in |
| SEAT-008 | QML-056 | Seat Check-in Confirmation |
| SEAT-009 | QML-057 | Seat Map Visualisation |
| SEAT-010 | QML-058 | Seat Block Management |
| COMP-001 | QML-037 (done), QML-069 | QML-037 = web UI; QML-069 = service API |
| COMP-002 | QML-070 | Health Documentation Upload |
| COMP-003 | QML-071 | Pre-travel Checklist |
| SERV-001 | QML-072 | Airport Information Guide |
| SERV-002 | QML-073 | Customer Support Hub |

---

## Detailed Story Specs — Existing QML Stories

> Full acceptance criteria for QML-001 to QML-048 are in `CHALLENGE.md`.
> Operational notes from `backlog_refinement_operations.md` are appended below each story.

### QML-001 — Search Flights ✅ Done
*(formerly FLIGHT-002)*
> As a passenger, I want to search for flights by origin, destination, and date so that I can find suitable travel options.
- API: `GET /api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1`
- Returns flights with flight number, dep/arr times, price, available seats.
- Missing params → `400 MISSING_REQUIRED_FIELD`. Invalid date → `400 INVALID_DATE_FORMAT`.
- **Operational:** Real-time availability; price includes all taxes/fees; regulatory visa info noted for international routes.

### QML-002 — View Flight Details ✅ Done
> As a passenger, I want to view detailed flight information before booking.
- API: `GET /api/flights/:id`
- Returns `durationMinutes` computed field. `404 FLIGHT_NOT_FOUND` for unknown ID.

### QML-003 — Create a Booking ✅ Done
*(formerly BOOK-002)*
> As a passenger, I want to create a booking and receive a 6-character PNR.
- API: `POST /api/bookings`
- Uses `SELECT FOR UPDATE` to prevent overbooking. Decrements `available_seats`.
- `409 NO_SEATS_AVAILABLE` when sold out.

### QML-004 — View Booking Details ✅ Done
> As a passenger, I want to view my booking including passenger and flight info.
- API: `GET /api/bookings/:bookingRef`
- `CONFIRMED` bookings include `paymentProvider` and `providerChargeId`.
- `404 BOOKING_NOT_FOUND` for unknown ref.

### QML-005 — Pay for Booking ⬜ Todo
*(formerly PAY-001)*
> As a passenger, I want to pay for my booking securely using Omise.
- API: `POST /api/payments/charge`
- Validates amount matches booking total before charging.
- On success: updates booking to `CONFIRMED`, records payment.
- `402 PAYMENT_FAILED` for declined card; `409 ALREADY_PAID` for duplicate.
- **Operational:** PCI DSS Level 1 compliance; no raw card data stored; tokenisation via Omise.

### QML-006 — View Payment Receipt ⬜ Todo
> As a passenger, I want to view my payment receipt for proof of payment.
- API: `GET /api/payments/:bookingRef`
- Returns latest payment when multiple attempts exist.
- `404 PAYMENT_NOT_FOUND` for unknown ref.

### QML-007 — Prevent Overbooking ✅ Done
> Concurrent bookings on 1-seat flight result in 1 success and 1 failure.
- `SELECT FOR UPDATE` locks flight row during booking transaction.
- Transaction rolls back if no seats available.

### QML-008 — Prevent Duplicate Payments ⬜ Todo
> `409 ALREADY_PAID` for a second payment attempt on a `CONFIRMED` booking.
- payment-service calls `GET /api/bookings/:ref` before charging to check status.

### QML-009 — Handle Payment Failures Gracefully ⬜ Todo
> Failed payment records `FAILED` payment in DB; booking stays `PENDING`; retry allowed.

### QML-010 — Secure Authentication via JWT ⬜ Todo
*(formerly AUTH-002, AUTH-003)*
> RS256 JWT required on all `/api/*` routes except `/api/flights/search` and `/health/*`.
- Missing/expired/wrong-alg token → `401 UNAUTHORIZED`.
- `JWT_PUBLIC_KEY` required at startup; service refuses to start without it.
- Router groups: public (search, health), internal (`PUT .../status` with `X-Internal-Token`), JWT-protected (all other `/api`).

### QML-011 — Internal Token Guard Middleware ⬜ Todo
> `PUT /api/bookings/:bookingRef/status` requires `X-Internal-Token` header.
- Uses `crypto/subtle.ConstantTimeCompare` (no `==`).
- Missing/wrong token → `403 FORBIDDEN`.
- `INTERNAL_TOKEN` env var required at startup; service refuses to start without it.

### QML-012 — Rate Limiting ⬜ Todo
> Per-IP limits using `golang.org/x/time/rate`.

| Endpoint | Requests/min | Burst |
|----------|-------------|-------|
| `GET /api/flights/search` | 100 | 20 |
| `POST /api/bookings` | 30 | 5 |
| `POST /api/payments/charge` | 10 | 3 |
| `GET /health/live` | 30 | 10 |
| `GET /health/ready` | 30 | 10 |

### QML-013 — Passenger Email Validation ⬜ Todo
*(formerly BOOK-001)*
> `POST /api/bookings` with malformed email → `400 INVALID_FIELD`.
- Use `net/mail.ParseAddress()` in `create_handler.go` after the non-empty check.
- Empty email still returns `400 MISSING_REQUIRED_FIELD`.

### QML-014 — Request Correlation ID ⬜ Todo
> Every request gets a UUID v4 `X-Request-ID`; echoed in response; included in all log lines.

### QML-015 — Structured Request Logging ⬜ Todo
> JSON log line per request: `method`, `path`, `status`, `latency_ms`, `requestId`.
- Switch from `gin.Default()` to `gin.New()` with explicit middleware order.
- 5xx → `ERROR`, 4xx → `WARN`, 2xx/3xx → `INFO`.

*(QML-016 through QML-048: see CHALLENGE.md for full acceptance criteria — all implemented.)*

---

## Detailed Story Specs — New Stories (QML-049+)

### EPIC: Seat Management

---

### QML-049 — Seat Configuration Management ⬜ Todo
*(formerly SEAT-001)*
> As an operations admin, I want to define the seat layout for each aircraft type so that the system knows the physical configuration, seat types, and fare classes of every seat.

**Acceptance Criteria:**
- Admin can create, update, and deactivate seat configurations per aircraft type.
- Each seat: seat number (e.g. 12A), row, column, type (WINDOW/MIDDLE/AISLE), fare class (ECONOMY/PREMIUM_ECONOMY/BUSINESS/FIRST), optional features (EXTRA_LEGROOM, EXIT_ROW, BULKHEAD).
- Duplicate seat numbers for same aircraft type → `409 Conflict`.
- Deactivated seats excluded from availability queries.
- All changes audited with staff ID and timestamp.

**API:** `POST /api/v1/seats/config`
**Size:** 8 points | **Sprint:** 3 | **Priority:** Must Have
**Depends on:** QML-066 (aircraft must exist)

---

### QML-050 — Seat Inventory Initialisation on Flight Creation ⬜ Todo
*(formerly SEAT-002)*
> As the system, when a flight is created and assigned an aircraft type, seat inventory is automatically initialised so booking and check-in can query seat availability immediately.

**Acceptance Criteria:**
- Flight Service triggers Seat Service to create one `seat_inventory` row per seat in the aircraft configuration.
- All seats initialised with status `AVAILABLE`.
- Idempotent — re-sending same flight creation event does not create duplicates.
- Returns summary count of seats initialised per fare class.

**API:** `POST /api/v1/seats/inventory/init`
**Size:** 5 points | **Sprint:** 3 | **Priority:** Must Have
**Depends on:** QML-049, QML-066

---

### QML-051 — Seat Availability Query ⬜ Todo
*(formerly SEAT-003)*
> As Booking Service and Check-in Service, I want to query available seats for a flight with optional fare class filter.

**Acceptance Criteria:**
- Returns all `AVAILABLE` seats for given flight.
- Optional filter: fare class, seat type.
- Includes seat number, fare class, seat type, features, status.
- Expired locks (TTL passed) treated as `AVAILABLE`.
- Results cached in Redis with 30-second TTL.
- Response time < 200ms at p99.

**API:** `GET /api/v1/seats/inventory/{flightId}?fareClass=ECONOMY&seatType=WINDOW`
**Size:** 5 points | **Sprint:** 3 | **Priority:** Must Have
**Depends on:** QML-050

---

### QML-052 — Seat Lock During Booking Session ⬜ Todo
*(formerly SEAT-004)*
> As Booking Service, I want to place an 8-minute time-limited lock on a seat to prevent double-booking under concurrent load.

**Acceptance Criteria:**
- Seat status changes `AVAILABLE → LOCKED` for 8 minutes.
- Lock associated with `booking_session_id`.
- Attempting to lock already-locked or already-booked seat → `409 Conflict`.
- Optimistic locking (version field) prevents concurrent race conditions.
- Lock persisted in `seat_locks` table and reflected in `seat_inventory`.

**API:** `POST /api/v1/seats/lock`
**Size:** 13 points | **Sprint:** 4 | **Priority:** Must Have
**Depends on:** QML-051

---

### QML-053 — Seat Booking Confirmation ⬜ Todo
*(formerly SEAT-005)*
> As Booking Service, after payment confirmation, I want to confirm the seat lock so it transitions `LOCKED → BOOKED`.

**Acceptance Criteria:**
- Accepts `lockId` and `bookingId`.
- `seat_inventory.booked_by_booking_id` set to provided booking ID.
- Lock record in `seat_locks` marked `CONFIRMED`.
- Expired lock → `410 Gone` (`LOCK_EXPIRED`).
- Already-confirmed lock → idempotent `200`.

**API:** `POST /api/v1/seats/lock/{lockId}/confirm`
**Size:** 8 points | **Sprint:** 4 | **Priority:** Must Have
**Depends on:** QML-052

---

### QML-054 — Seat Release on Cancellation ⬜ Todo
*(formerly SEAT-006)*
> As Booking Service, when a booking is cancelled, release the seat so it becomes available again.

**Acceptance Criteria:**
- Seat reverts `BOOKED → AVAILABLE`.
- `seat_inventory.booked_by_booking_id` cleared.
- Associated seat lock marked `RELEASED`.
- Releasing a `CHECKED_IN` seat → `409 Conflict`.
- Redis availability cache invalidated on release.

**API:** `DELETE /api/v1/seats/booking/{bookingId}`
**Size:** 5 points | **Sprint:** 4 | **Priority:** Must Have
**Depends on:** QML-053

---

### QML-055 — Seat Change at Check-in ⬜ Todo
*(formerly SEAT-007)*
> As Check-in Service, I want to allow a passenger to change their assigned seat during the check-in window.

**Acceptance Criteria:**
- Old seat reverts to `AVAILABLE`; new seat transitions to `BOOKED`.
- New seat must be `AVAILABLE`; otherwise `409 Conflict`.
- Only seats within same fare class unless upgrade permitted.
- Operation atomic — either both update or neither.

**API:** `PUT /api/v1/seats/assignment`  
Body: `{ bookingId, currentSeatNumber, newSeatNumber }`
**Size:** 8 points | **Sprint:** 4 | **Priority:** Must Have
**Depends on:** QML-053

---

### QML-056 — Seat Check-in Confirmation ⬜ Todo
*(formerly SEAT-008)*
> As Check-in Service, after a passenger completes check-in, mark the seat `CHECKED_IN`.

**Acceptance Criteria:**
- Seat status transitions `BOOKED → CHECKED_IN`.
- `seat_inventory.checked_in_passenger_id` set to provided passenger ID.
- Idempotent — re-sending same check-in confirmation returns `200`.
- Confirming on `AVAILABLE` or `LOCKED` seat → `422`.

**API:** `POST /api/v1/seats/checkin-confirm`
**Size:** 5 points | **Sprint:** 4 | **Priority:** Must Have
**Depends on:** QML-055

---

### QML-057 — Seat Map Visualisation Endpoint ⬜ Todo
*(formerly SEAT-009)*
> As the frontend, I want a structured seat map with live availability overlay for visual seat selection.

**Acceptance Criteria:**
- Returns seat map grouped by row.
- Each seat entry: number, row, column, seat type, fare class, features, current status.
- Status reflects real-time availability (not stale > 30 seconds).
- `LOCKED` seats shown as `LOCKED` (not `AVAILABLE`).
- Response structure suitable for rendering a visual grid without additional processing.

**API:** `GET /api/v1/seats/inventory/{flightId}/map`
**Size:** 8 points | **Sprint:** 4 | **Priority:** Should Have
**Depends on:** QML-051

---

### QML-058 — Seat Block Management ⬜ Todo
*(formerly SEAT-010)*
> As an operations admin, I want to block specific seats (crew jump seats, inoperative seats, VIP holds) so they are excluded from passenger selection.

**Acceptance Criteria:**
- Admin can block seats with reason: `CREW`, `MAINTENANCE`, `VIP`, `WEIGHT_BALANCE`.
- Blocked seats appear with status `BLOCKED` in all availability queries.
- Admin can unblock if not `BOOKED` or `CHECKED_IN`.
- Block/unblock actions audited with staff ID, reason, and timestamp.

**API:** `POST /api/v1/seats/block`
**Size:** 5 points | **Sprint:** 5 | **Priority:** Should Have
**Depends on:** QML-050

#### Seat Status State Machine
```
AVAILABLE ──[QML-052: lock]──► LOCKED ──[TTL 8min expired]──► AVAILABLE
    ▲                                │
    │                                │ [QML-053: confirm]
    │                                ▼
    │                             BOOKED ──[QML-056: check-in]──► CHECKED_IN
    │                                │
    │                       [QML-054: release]
    │                                │
    └────────────────────────────────┘
BLOCKED (admin managed via QML-058, independently from AVAILABLE)
```

---

### EPIC: Booking Extensions

---

### QML-059 — Special Assistance & Meal Requests ⬜ Todo
*(formerly BOOK-004)*
> As a passenger, I want to request special meal options and accessibility assistance during booking so my needs are arranged before the flight.

**Acceptance Criteria:**
- Meal options: Standard, Vegetarian, Vegan, Halal, Kosher, Diabetic, Child.
- Mobility assistance: Wheelchair to gate, Wheelchair on/off aircraft, Stretcher.
- Other: Unaccompanied minor declaration, Medical oxygen, Guide/service animal.
- Requests linked per passenger (each pax can differ).
- Requests editable up to 48 hours before departure via manage booking.
- Operations team notified via internal event.

**API:** `POST /api/bookings/{id}/special-requests` · `PATCH /api/bookings/{id}/special-requests`
**Size:** 3 points | **Sprint:** 2 | **Priority:** Medium
**Depends on:** QML-003

---

### QML-060 — Travel Insurance Selection ⬜ Todo
*(formerly BOOK-005)*
> As a passenger completing a booking, I want to optionally purchase travel insurance (3 tiers: Basic, Standard, Premium).

**Acceptance Criteria:**
- 3 insurance tiers displayed with coverage summary and price.
- Selected plan added as line item to booking total before payment.
- Policy certificate emailed after payment confirmation.
- Insurance can be declined (opt-out clearly available).
- Insurance provider name and policy number in booking confirmation.

**API:** `POST /api/bookings/{id}/insurance` · `DELETE /api/bookings/{id}/insurance`
**Size:** 3 points | **Sprint:** 2 | **Priority:** Medium
**Depends on:** QML-003

---

### QML-061 — Flight Change Request ⬜ Todo
*(formerly BOOK-007)*
> As a passenger with a confirmed booking, I want to change my flight to a different date or time.

**Acceptance Criteria:**
- Available alternative flights shown for same route with fare difference and change fee (฿850/pax).
- Negative fare difference issues travel credit (not cash refund).
- Original booking updated with new flight details after payment of difference.
- Fully-booked flights shown as unavailable.
- Confirmation email sent with updated itinerary.

**API:** `POST /api/bookings/{id}/change`
**Size:** 8 points | **Sprint:** 3 | **Priority:** Medium
**Depends on:** QML-027, QML-005, QML-052

---

### QML-062 — Post-Booking Ancillary Services ⬜ Todo
*(formerly BOOK-008)*
> As a passenger with a confirmed booking, I want to purchase additional services (extra baggage, seat upgrade, lounge access, priority boarding).

**Acceptance Criteria:**
- Extra baggage: stepper to add bags (฿850/bag); weight upgrade toggle (฿450/bag to 32 kg).
- Seat upgrade: Premium Economy (from ฿3,200) and Business Class (from ฿12,500).
- Lounge access: per-person toggle (฿990/person).
- Priority boarding: per-booking toggle (฿350/person).
- Cart summary bar appears when any item selected; shows itemised total.
- Confirmation email sent after purchase with updated booking details.

**API:** `POST /api/bookings/{id}/ancillaries` · `PATCH /api/bookings/{id}/ancillaries/{type}`
**Size:** 5 points | **Sprint:** 3 | **Priority:** Medium
**Depends on:** QML-027, QML-055, QML-005

---

### EPIC: Payment Extensions

---

### QML-063 — Booking Cancellation & Refund Processing ⬜ Todo
*(formerly PAY-002)*
> As a passenger, I want to cancel my booking and receive a refund based on the cancellation policy.

**Acceptance Criteria:**
- Cancellation policy displayed before confirmation: `>24h = 80% refund`, `<24h = no refund`, `no-show = no refund`.
- Refund amount calculated and shown before passenger confirms.
- Reason for cancellation collected (required); document upload for medical/visa reasons.
- Refund processed to original payment method within 5–7 business days.
- Cancelled booking status updated to `CANCELLED` immediately.
- Confirmation email with cancellation and refund reference sent.
- "Keep my booking" escape hatch shown prominently.

**API:** `POST /api/bookings/{id}/cancel` · `POST /api/payments/refund`
**Size:** 8 points | **Sprint:** 3 | **Priority:** High
**Depends on:** QML-027, QML-005

---

### EPIC: Auth Extensions

---

### QML-064 — Password Reset / Forgot Password ⬜ Todo
*(formerly AUTH-004)*
> As a registered user who has forgotten my password, I want to request a reset link via email so I can regain account access.

**Acceptance Criteria:**
- User enters registered email and receives a time-limited reset link (valid 60 min).
- Reset link is single-use and invalidated after use.
- Expired or invalid links show appropriate error.
- Success screen shows email address and resend countdown (60s).
- Password reset completes login automatically after new password set.

**API:** `POST /api/auth/forgot-password` · `POST /api/auth/reset-password`
**Size:** 3 points | **Sprint:** 1 | **Priority:** High
**Depends on:** QML-031

---

### QML-065 — Email Verification After Registration ⬜ Todo
*(formerly AUTH-006)*
> As a newly registered user, I want to verify my email with a 6-digit OTP so that my account is activated securely.

**Acceptance Criteria:**
- 6-digit numeric OTP sent immediately after registration.
- OTP valid for 10 minutes, max 3 verification attempts before lockout.
- Resend cooldown of 60 seconds between resend requests.
- Successful verification activates account and redirects to home.
- Expired OTP prompts resend.

**API:** `POST /api/auth/verify-email` · `POST /api/auth/resend-otp`
**Size:** 2 points | **Sprint:** 1 | **Priority:** High
**Depends on:** QML-031

---

### EPIC: Flight Extensions

---

### QML-066 — Flight Creation Interface — Admin ⬜ Todo
*(formerly FLIGHT-001)*
> As an operations admin, I want to create flights with all necessary details so that passengers can book them.

**Acceptance Criteria:**
- Admin can create flight with flight number, origin, destination, aircraft assignment, scheduled dep/arr times.
- IATA airport codes validated against airports database.
- Aircraft availability checked during assignment (no double-booking of aircraft).
- Timezone handling: all times stored in UTC, displayed in local timezone.
- Flight number uniqueness enforced (case-insensitive).
- Flight creation triggers seat inventory initialisation (QML-050).

**API:** `POST /api/flights`
**Size:** 8 points | **Sprint:** 1 | **Priority:** Highest
**Depends on:** QML-010

---

### QML-067 — Flight Search Filtering & Sorting ⬜ Todo
*(formerly FLIGHT-003)*
> As a passenger, I want to filter and sort flight search results so I can find the most suitable options.

**Acceptance Criteria:**
- Filter by price range, departure time, duration, aircraft type.
- Sort by price, duration, departure time, arrival time.
- Results update dynamically as filters are applied.
- Filter validation prevents invalid combinations.

**API:** Extends `GET /api/flights/search` with additional query params: `price_min`, `price_max`, `departure_from`, `departure_to`, `duration_max`, `aircraft_types`.
**Size:** 5 points | **Sprint:** 1 | **Priority:** High
**Depends on:** QML-001

---

### QML-068 — Real-time Flight Status API ⬜ Todo
*(formerly FLIGHT-004)*
> As a passenger or person meeting a traveller, I want to check real-time flight status (QML-036 covers the web UI; this story covers the backend API and real-time updates).

**Acceptance Criteria:**
- Search by flight number returns current status: On Time, Delayed (with reason), Boarding, Departed, Arrived, Cancelled.
- Delayed flights show original and revised times.
- Departure board for today's departures from home airport (BKK) with pagination.
- Status auto-refreshes every 60 seconds.
- `Last updated` timestamp on each status.

**API:** `GET /api/flights/{flightNumber}/status` · `GET /api/flights/board?airport=BKK&date=today`
**Size:** 5 points | **Sprint:** 3 | **Priority:** Medium
**Depends on:** QML-066

---

### EPIC: Travel Compliance

---

### QML-069 — Travel Requirements & Visa Checker ⬜ Todo
*(formerly COMP-001 — QML-037 covers the read-only web display; this story adds the backend data management and personalisation API)*

> As a passenger booking an international flight, I want to see travel document requirements and check my visa eligibility personalised to my nationality.

**Acceptance Criteria:**
- Requirements personalised to passenger nationality × destination country.
- Visa types returned: e-Visa, VOA, Visa-free, Embassy visa.
- Requirements managed by ops team and cached; disclaimer that passenger must verify with embassy.
- "Requirements met" or "Action required" summary chips per document type.

**API:** `GET /api/travel-requirements?origin={IATA}&destination={IATA}&nationality={ISO2}`
**Size:** 5 points | **Sprint:** 2 | **Priority:** High
**Depends on:** QML-001

---

### QML-070 — Health Documentation Upload ⬜ Todo
*(formerly COMP-002)*
> As a passenger on a route requiring health documentation, I want to upload my vaccination certificate or health certificate so my compliance is recorded before travel.

**Acceptance Criteria:**
- Document types: Vaccination certificate, PCR test result, medical clearance letter.
- Accepted formats: JPG, PNG, PDF · Max 5 MB per file.
- Upload linked to specific passenger in booking.
- Document status: Pending Review → Accepted / Rejected (with reason).
- Rejected documents can be re-uploaded.
- Passenger notified of document status via email.

**API:** `POST /api/bookings/{id}/passengers/{pid}/health-docs` (multipart/form-data)
**Size:** 5 points | **Sprint:** 2 | **Priority:** High
**Depends on:** QML-069, QML-003

---

### QML-071 — Pre-travel Preparation Checklist ⬜ Todo
*(formerly COMP-003)*
> As a passenger with a confirmed booking, I want a personalised pre-travel checklist so I don't forget important preparation steps.

**Acceptance Criteria:**
- Checklist generated based on route, departure time, and passenger nationality.
- Items: Passport, Visa, Travel insurance, Check-in, Seat selection, Baggage limits, Airport transport, Local currency.
- Items marked complete persist across sessions (stored per booking).
- Items deep-link into relevant app screen.
- Countdown timer to departure and check-in open time shown at top.

**API:** `GET /api/bookings/{id}/checklist` · `PATCH /api/bookings/{id}/checklist/{item}/complete`
**Size:** 2 points | **Sprint:** 4 | **Priority:** Low
**Depends on:** QML-003, QML-069

---

### EPIC: Passenger Services

---

### QML-072 — Airport Information Guide ⬜ Todo
*(formerly SERV-001)*
> As a passenger, I want to access airport-specific information (terminals, transport, facilities) for my departure and arrival airports.

**Acceptance Criteria:**
- Initial launch airports: BKK Suvarnabhumi and SYD Kingsford Smith.
- Each airport shows: terminal map overview, check-in counter location, security wait guidance, dining, ground transport, WiFi details.
- Content managed by ops team and updated periodically (not real-time).
- Accessible offline (cached on app launch).

**API:** `GET /api/airports/{iata}/info`
**Size:** 3 points | **Sprint:** 4 | **Priority:** Low
**Depends on:** None

---

### QML-073 — Customer Support Hub ⬜ Todo
*(formerly SERV-002)*
> As a passenger, I want to access help articles, FAQ, and live support channels so I can resolve booking or travel issues.

**Acceptance Criteria:**
- Search bar filters help articles by keyword.
- Topic chips: Cancellations, Baggage, Check-in, Refunds, Special assistance.
- Live chat card shows agent availability and average wait time.
- Contact options: Phone (24/7), Email (reply within 24h), Community forum.
- FAQ accordion with expandable answers.
- When no agents available: chat button disabled, email CTA shown.

**API:** `GET /api/support/faqs` · `GET /api/support/agent-status` · `POST /api/support/chat/session`
**Size:** 3 points | **Sprint:** 3 | **Priority:** Medium
**Depends on:** QML-031

---

## Story Point Summary

| Epic | Stories | Points | Done |
|------|---------|--------|------|
| Flight Discovery | QML-001, 002, 066, 067, 068 | ~39 | 2/5 |
| Booking | QML-003, 004, 007, 013, 048, 059, 060, 061, 062 | ~60 | 5/9 |
| Payment | QML-005, 006, 008, 009, 063 | ~46 | 0/5 |
| Platform Security & Observability | QML-010..015 | ~30 | 0/6 |
| Seat Management | QML-049..058 | 70 | 0/10 |
| Web — Flight Search | QML-016..024 | ~40 | 9/9 |
| Web — Booking Journey | QML-025..028 | ~30 | 4/4 |
| Web — My Trips | QML-029, 030, 047 | ~20 | 3/3 |
| Web — Account & Profile | QML-031, 032, 064, 065 | ~15 | 2/4 |
| Web — Airport Selection | QML-033, 034 | ~15 | 2/2 |
| Web — Discovery | QML-035, 036, 037 | ~15 | 3/3 |
| Web — App Shell | QML-038 | ~5 | 1/1 |
| Platform Security | QML-039, 040 | ~10 | 2/2 |
| Booking Expiry & Status | QML-041..046 | ~30 | 6/6 |
| Auth Extensions | QML-064, 065 | 5 | 0/2 |
| Flight Extensions | QML-066, 067, 068 | 18 | 0/3 |
| Travel Compliance | QML-069, 070, 071 | 12 | 0/3 |
| Passenger Services | QML-072, 073 | 6 | 0/2 |

**Total new QML numbers assigned: QML-049 to QML-073 (25 new stories)**
**Grand total: ~211 story points (aligns with 00-planning estimates)**
