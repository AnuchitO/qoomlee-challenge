# Qoomlee Master Backlog

> **Source of truth for QML-xxx numbers:** `CHALLENGE.md`
> This file is the single planning reference — full story details, accurate implementation status, and old-style ID mapping.
> Status is verified against real code, not just the challenge spec.
>
> **Status legend:**
> - ✅ Done — backend + frontend both implemented
> - ⚠️ Partial — exists but has known gaps (noted inline)
> - ❌ Not done — not yet started

---

## Story Status Dashboard

### EPIC: Flight Discovery
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-001 | Search Flights | FLIGHT-002 | qoomlee-service | ✅ Done |
| QML-002 | View Flight Details | FLIGHT-002 | qoomlee-service | ✅ Done |
| QML-066 | Flight Creation Interface — Admin | FLIGHT-001 | qoomlee-service | ❌ Not done |
| QML-067 | Flight Search Filtering & Sorting | FLIGHT-003 | web | ❌ Not done |
| QML-068 | Real-time Flight Status API | FLIGHT-004 | qoomlee-service + web | ❌ Not done |

### EPIC: Booking
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-003 | Create a Booking | BOOK-002 | qoomlee-service | ✅ Done |
| QML-004 | View Booking Details | BOOK-002 | qoomlee-service | ✅ Done |
| QML-007 | Prevent Overbooking | — | qoomlee-service | ✅ Done |
| QML-013 | Passenger Email Validation | BOOK-001 | qoomlee-service | ❌ Not done |
| QML-048 | Prevent Duplicate Bookings on Back Navigation | — | qoomlee-service + web | ✅ Done |
| QML-059 | Special Assistance & Meal Requests | BOOK-004 | qoomlee-service + web | ❌ Not done |
| QML-060 | Travel Insurance Selection | BOOK-005 | qoomlee-service + web | ❌ Not done |
| QML-061 | Flight Change Request | BOOK-007 | qoomlee-service + web | ❌ Not done |
| QML-062 | Post-Booking Ancillary Services | BOOK-008 | qoomlee-service + web | ❌ Not done |

### EPIC: Payment
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-005 | Pay for Booking | PAY-001 | payment-service | ✅ Done |
| QML-006 | View Payment Receipt | PAY-001 | payment-service | ✅ Done |
| QML-008 | Prevent Duplicate Payments | — | payment-service | ✅ Done |
| QML-009 | Handle Payment Failures Gracefully | — | payment-service | ✅ Done |
| QML-063 | Booking Cancellation & Refund Processing | PAY-002 | payment-service + web | ❌ Not done |

### EPIC: Platform Security & Observability
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-010 | Secure Authentication via JWT | AUTH-002, AUTH-003 | both services | ⚠️ Partial |
| QML-011 | Internal Token Guard Middleware | — | qoomlee-service | ⚠️ Partial |
| QML-012 | Rate Limiting | — | both services | ⚠️ Partial |
| QML-013 | Passenger Email Validation | BOOK-001 | qoomlee-service | ❌ Not done |
| QML-014 | Request Correlation ID | — | both services | ✅ Done |
| QML-015 | Structured Request Logging | — | both services | ⚠️ Partial |

### EPIC: Seat Management (new)
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-049 | Seat Configuration Management | SEAT-001 | qoomlee-service | ❌ Not done |
| QML-050 | Seat Inventory Initialisation on Flight Creation | SEAT-002 | qoomlee-service | ❌ Not done |
| QML-051 | Seat Availability Query | SEAT-003 | qoomlee-service | ❌ Not done |
| QML-052 | Seat Lock During Booking Session | SEAT-004 | qoomlee-service | ❌ Not done |
| QML-053 | Seat Booking Confirmation | SEAT-005 | qoomlee-service | ❌ Not done |
| QML-054 | Seat Release on Cancellation | SEAT-006 | qoomlee-service | ❌ Not done |
| QML-055 | Seat Change at Check-in | SEAT-007 | qoomlee-service | ❌ Not done |
| QML-056 | Seat Check-in Confirmation | SEAT-008 | qoomlee-service | ❌ Not done |
| QML-057 | Seat Map Visualisation Endpoint | SEAT-009 | qoomlee-service + web | ❌ Not done |
| QML-058 | Seat Block Management | SEAT-010 | qoomlee-service | ❌ Not done |

### EPIC: Web — Flight Search Experience
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-016 | Flight Search Form — Core behaviour | web | ✅ Done |
| QML-017 | Flight Search Form — Desktop layout | web · desktop | ✅ Done |
| QML-018 | Flight Search Form — Mobile layout | web · mobile | ✅ Done |
| QML-019 | Date Range Picker — Core behaviour | web | ✅ Done |
| QML-020 | Date Range Picker — Desktop | web · desktop | ✅ Done |
| QML-021 | Date Range Picker — Mobile | web · mobile | ✅ Done |
| QML-022 | View Flight Search Results | web | ✅ Done |
| QML-023 | Travelers & Class — Desktop | web · desktop | ✅ Done |
| QML-024 | Travelers & Class — Mobile | web · mobile | ✅ Done |

### EPIC: Web — Booking Journey
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-025 | Create a Booking | web | ✅ Done |
| QML-026 | Booking Confirmation with Copy PNR | web | ✅ Done |
| QML-027 | View My Bookings | web | ✅ Done |
| QML-028 | Pay for a Booking | web | ✅ Done |

### EPIC: Web — My Trips
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-029 | Online Check-in | web | ✅ Done |
| QML-030 | View Boarding Passes | web | ✅ Done |
| QML-047 | Manage Your Trip | web | ✅ Done |

### EPIC: Web — Account & Profile
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-031 | Login & Registration | AUTH-001, AUTH-002, AUTH-006 | web | ✅ Done |
| QML-032 | Manage Profile | AUTH-005 | web | ✅ Done |
| QML-064 | Password Reset / Forgot Password | AUTH-004 | web | ❌ Not done |
| QML-065 | Email Verification After Registration | AUTH-006 | web | ❌ Not done |

### EPIC: Web — Airport Selection
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-033 | Airport Select — Desktop Dropdown | web · desktop | ✅ Done |
| QML-034 | Airport Select — Mobile Bottom Sheet | web · mobile | ✅ Done |

### EPIC: Web — Discovery
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-035 | Popular Destinations & Travel Tips | web | ✅ Done |
| QML-036 | Check Flight Status | web | ✅ Done |
| QML-037 | View Travel Requirements | web | ✅ Done |

### EPIC: Web — App Shell
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-038 | App Navigation | web | ✅ Done |

### EPIC: Platform Security (Cross-cutting)
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-039 | HTTP Security Headers — API Services | both services | ✅ Done |
| QML-040 | HTTP Security Headers — Web Frontend | web | ✅ Done |

### EPIC: Booking Expiry & Status (Cross-cutting)
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-041 | Record Seat-Hold Expiry at Booking Creation | qoomlee-service | ✅ Done |
| QML-042 | Lazily Expire Stale Pending Bookings on Read | qoomlee-service | ✅ Done |
| QML-043 | Reject Confirmation & Charges for Expired Bookings | both services | ✅ Done |
| QML-044 | Server-Derived Payment Countdown | web | ✅ Done |
| QML-045 | Handle Expiry Mid-Submit | web | ✅ Done |
| QML-046 | "My Bookings" Backed by Real Data | web + qoomlee-service | ✅ Done |

### EPIC: Travel Compliance (new)
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-069 | Travel Requirements & Visa Checker API | COMP-001 | qoomlee-service + web | ❌ Not done |
| QML-070 | Health Documentation Upload | COMP-002 | qoomlee-service + web | ❌ Not done |
| QML-071 | Pre-travel Preparation Checklist | COMP-003 | qoomlee-service + web | ❌ Not done |

### EPIC: Passenger Services (new)
| # | Story | Old ID | Platform | Status |
|---|-------|--------|----------|--------|
| QML-072 | Airport Information Guide | SERV-001 | web | ❌ Not done |
| QML-073 | Customer Support Hub | SERV-002 | web | ❌ Not done |

---

## Old ID → QML Cross-Reference

| Old ID | Maps to QML | Notes |
|--------|-------------|-------|
| AUTH-001 | QML-031 | Registration sub-feature of Login & Registration |
| AUTH-002 | QML-031, QML-010 | Login sub-feature; JWT auth spec |
| AUTH-003 | QML-010, QML-011 | RBAC via JWT claims / internal token |
| AUTH-004 | QML-064 | Password Reset |
| AUTH-005 | QML-032 | Manage Profile |
| AUTH-006 | QML-065 | Email Verification |
| FLIGHT-001 | QML-066 | Admin flight creation |
| FLIGHT-002 | QML-001, QML-016–022 | Search (service + web) |
| FLIGHT-003 | QML-067 | Filtering & Sorting |
| FLIGHT-004 | QML-068 | Real-time Status API (QML-036 = web UI only) |
| BOOK-001 | QML-025, QML-013 | Passenger info form + email validation |
| BOOK-002 | QML-003, QML-025 | Booking creation (service + web) |
| BOOK-003 | QML-005, QML-028 | Payment (service + web) |
| BOOK-004 | QML-059 | Special Assistance & Meal |
| BOOK-005 | QML-060 | Travel Insurance |
| BOOK-006 | QML-027, QML-046, QML-047 | Booking Management (all done) |
| BOOK-007 | QML-061 | Flight Change |
| BOOK-008 | QML-062 | Ancillary Services |
| PAY-001 | QML-005, QML-006, QML-028 | Payment (service + web) |
| PAY-002 | QML-063 | Cancellation & Refund |
| CHECK-001 | QML-029 | Online Check-in |
| BPASS-001 | QML-030 | Boarding Passes |
| SEAT-001..010 | QML-049..058 | Full Seat Management epic |
| COMP-001 | QML-037 (web done), QML-069 (API todo) | |
| COMP-002 | QML-070 | Health Documentation |
| COMP-003 | QML-071 | Pre-travel Checklist |
| SERV-001 | QML-072 | Airport Info |
| SERV-002 | QML-073 | Customer Support |

---

## Full Story Specs

---

### EPIC: Flight Discovery

---

### QML-001 — Search Flights ✅ Done
*(formerly FLIGHT-002)*

> As a passenger, I want to search for flights by origin, destination, and date so that I can find suitable travel options.

**API:** `GET /api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1`

**Acceptance Criteria:**
- Returns list of matching flights with flight number, dep/arr times, price, available seats.
- Missing required params → `400 MISSING_REQUIRED_FIELD`.
- Invalid date format → `400 INVALID_DATE_FORMAT`.
- No matching flights → empty list `[]`.
- Sold-out flights (`available_seats=0`) excluded from results.
- Route is public — no auth required.

**Implementation:** `services/qoomlee/flight/search_handler.go` + `search_repository.go`

---

### QML-002 — View Flight Details ✅ Done

> As a passenger, I want to view detailed flight information so that I can confirm before booking.

**API:** `GET /api/flights/:id`

**Acceptance Criteria:**
- Returns complete flight details including `durationMinutes` (computed from dep/arr times).
- Unknown flight ID → `404 FLIGHT_NOT_FOUND`.
- Requires session auth.

**Implementation:** `services/qoomlee/flight/get_by_id_handler.go` + `get_by_id_repository.go`

---

### QML-066 — Flight Creation Interface — Admin ❌ Not done
*(formerly FLIGHT-001)*

> As an operations admin, I want to create flights with all necessary details so that passengers can book them.

**API:** `POST /api/flights`

**Acceptance Criteria:**
- Create flight with flight number, origin, destination, aircraft assignment, dep/arr times.
- IATA airport codes validated against airports database.
- Aircraft availability checked — no double-booking of aircraft.
- Times stored UTC; displayed in local timezone.
- Flight number uniqueness enforced (case-insensitive).
- Flight creation triggers seat inventory initialisation (QML-050).

**Size:** 8 pts | **Sprint:** 1 | **Priority:** Highest | **Depends on:** QML-010

---

### QML-067 — Flight Search Filtering & Sorting ❌ Not done
*(formerly FLIGHT-003)*

> As a passenger, I want to filter and sort flight search results.

**API:** Extends `GET /api/flights/search` with: `price_min`, `price_max`, `departure_from`, `departure_to`, `duration_max`, `aircraft_types`, `sort`.

**Acceptance Criteria:**
- Filter by price range, departure time, duration, aircraft type.
- Sort by price, duration, departure time, arrival time.
- Dynamic filtering — no page reload.
- Invalid filter combinations rejected.

**Size:** 5 pts | **Sprint:** 1 | **Priority:** High | **Depends on:** QML-001

---

### QML-068 — Real-time Flight Status API ❌ Not done
*(formerly FLIGHT-004 — QML-036 covers the read-only web UI; this covers the backend and live updates)*

> As a passenger, I want to check real-time flight status by flight number.

**API:** `GET /api/flights/{flightNumber}/status` · `GET /api/flights/board?airport=BKK&date=today`

**Acceptance Criteria:**
- Status types: On Time, Delayed (with reason + delay duration), Boarding, Departed, Arrived, Cancelled.
- Delayed flights show original and revised times.
- Departure board shows today's departures from BKK with pagination.
- Status cached in Redis with 30-second TTL; auto-refreshed every 60s.
- `lastUpdated` timestamp on each status.

**Size:** 5 pts | **Sprint:** 3 | **Priority:** Medium | **Depends on:** QML-066

---

### EPIC: Booking

---

### QML-003 — Create a Booking ✅ Done
*(formerly BOOK-002)*

> As a passenger, I want to create a booking for a flight so that I can reserve my seat and receive a PNR.

**API:** `POST /api/bookings?bookingToken=<uuid>`

**Acceptance Criteria:**
- Returns `201` with `bookingId`, `bookingRef` (6-char PNR), `expiresAt`.
- `SELECT FOR UPDATE` prevents overbooking; decrements `available_seats`.
- Sold-out flight → `409 NO_SEATS_AVAILABLE`.
- Missing fields → `400 MISSING_REQUIRED_FIELD`.
- Amount locked to flight price at booking time.
- Requires session auth.

**Implementation:** `services/qoomlee/booking/create_handler.go` + `create_repository.go`

---

### QML-004 — View Booking Details ✅ Done

> As a passenger, I want to view my booking details including passenger and flight info.

**API:** `GET /api/bookings/:bookingRef`

**Acceptance Criteria:**
- Returns booking with nested passenger and flight info.
- `CONFIRMED` → includes `paymentProvider` and `providerChargeId`.
- `PENDING` → includes `expiresAt`.
- Unknown ref → `404 BOOKING_NOT_FOUND`.
- Lazily expires stale PENDING bookings on read (QML-042).

**Implementation:** `services/qoomlee/booking/get_by_ref_handler.go` + `get_by_ref_repository.go`

---

### QML-007 — Prevent Overbooking ✅ Done

> Concurrent bookings on a 1-seat flight result in exactly 1 success and 1 failure.

**Acceptance Criteria:**
- `SELECT FOR UPDATE` locks flight row during booking transaction.
- Available seats checked inside lock — rolls back if 0.
- Concurrent requests serialised; only first wins.

**Implementation:** `services/qoomlee/booking/create_repository.go`

---

### QML-013 — Passenger Email Validation ❌ Not done
*(formerly BOOK-001)*

> As a system, I want to reject bookings with a malformed email so that booking data is correct.

**Gap:** `create_handler.go` only checks `email == ""` for `MISSING_REQUIRED_FIELD`. No format validation exists.

**Required change:** Add `net/mail.ParseAddress()` check in `create_handler.go` after the empty check:

```go
if _, err := mail.ParseAddress(req.Passenger.Email); err != nil {
    c.JSON(http.StatusBadRequest, apiErr("INVALID_FIELD", "passenger email must be a valid email address"))
    return
}
```

**Acceptance Criteria:**
- `"user@example.com"` → accepted, `201`.
- `"notanemail"` / `"@"` / `"user@"` → `400 INVALID_FIELD`.
- `""` (empty) → `400 MISSING_REQUIRED_FIELD` (existing check, unchanged).

**Size:** 2 pts | **Sprint:** 1 | **Priority:** High

---

### QML-048 — Prevent Duplicate Bookings on Back Navigation ✅ Done

> When the passenger navigates back and clicks "Continue to Payment" again, the system returns the existing booking.

**Acceptance Criteria:**
- `?bookingToken=<uuid>` sent by web client on first mount; preserved in URL on back navigation.
- Second `POST /api/bookings?bookingToken=same-uuid` returns same `bookingRef` and `bookingId`.
- Two calls with same token → exactly one row in `bookings` table.
- Missing `?bookingToken` → creates normally (backward-compatible).

**Implementation:** `services/qoomlee/booking/create_repository.go` (idempotency check on `booking_token`)

---

### QML-059 — Special Assistance & Meal Requests ❌ Not done
*(formerly BOOK-004)*

> As a passenger, I want to request special meal options and accessibility assistance.

**API:** `POST /api/bookings/{id}/special-requests` · `PATCH /api/bookings/{id}/special-requests`

**Acceptance Criteria:**
- Meal options: Standard, Vegetarian, Vegan, Halal, Kosher, Diabetic, Child.
- Mobility assistance: Wheelchair to gate / on-off aircraft, Stretcher.
- Other: Unaccompanied minor, Medical oxygen, Guide/service animal.
- Requests linked per passenger (each pax can differ).
- Editable up to 48h before departure.

**Size:** 3 pts | **Sprint:** 2 | **Priority:** Medium | **Depends on:** QML-003

---

### QML-060 — Travel Insurance Selection ❌ Not done
*(formerly BOOK-005)*

> As a passenger, I want to optionally purchase travel insurance (Basic / Standard / Premium).

**API:** `POST /api/bookings/{id}/insurance` · `DELETE /api/bookings/{id}/insurance`

**Acceptance Criteria:**
- 3 tiers with coverage summary and price.
- Selected plan added as line item to booking total before payment.
- Policy certificate emailed after payment confirmation.
- Opt-out clearly available.

**Size:** 3 pts | **Sprint:** 2 | **Priority:** Medium | **Depends on:** QML-003

---

### QML-061 — Flight Change Request ❌ Not done
*(formerly BOOK-007)*

> As a passenger with a confirmed booking, I want to change my flight to a different date or time.

**API:** `POST /api/bookings/{id}/change`

**Acceptance Criteria:**
- Available alternatives shown for same route with fare difference and change fee (฿850/pax).
- Negative fare difference → travel credit (not cash).
- Fully-booked flights shown as unavailable.
- Confirmation email with updated itinerary.

**Size:** 8 pts | **Sprint:** 3 | **Priority:** Medium | **Depends on:** QML-027, QML-005

---

### QML-062 — Post-Booking Ancillary Services ❌ Not done
*(formerly BOOK-008)*

> As a passenger, I want to purchase extra baggage, seat upgrades, lounge access, and priority boarding.

**API:** `POST /api/bookings/{id}/ancillaries` · `PATCH /api/bookings/{id}/ancillaries/{type}`

**Acceptance Criteria:**
- Extra baggage: stepper (฿850/bag); weight upgrade toggle (฿450/bag to 32 kg).
- Seat upgrade: Premium Economy (from ฿3,200), Business (from ฿12,500).
- Lounge access: ฿990/person. Priority boarding: ฿350/person.
- Cart summary bar with itemised total.
- Confirmation email after purchase.

**Size:** 5 pts | **Sprint:** 3 | **Priority:** Medium | **Depends on:** QML-027, QML-005

---

### EPIC: Payment

---

### QML-005 — Pay for Booking ✅ Done
*(formerly PAY-001)*

> As a passenger, I want to pay for my booking securely via Omise.

**API:** `POST /api/payments/charge`

**Acceptance Criteria:**
- Tokenises card via Omise; charges the booking amount.
- Validates amount matches booking total → `400 AMOUNT_MISMATCH` if not.
- Success → booking status updated to `CONFIRMED`, returns `201` with charge details.
- Declined card → `402 PAYMENT_FAILED` with `failureCode` and `failureMessage`.
- Already confirmed booking → `409 ALREADY_PAID`.
- Expired booking → `409 booking_expired`.

**Implementation:** `services/payment/payment/handler.go` · `service.go` · `omise_client.go`

---

### QML-006 — View Payment Receipt ✅ Done

> As a passenger, I want to view my payment receipt.

**API:** `GET /api/payments/:bookingRef`

**Acceptance Criteria:**
- Returns latest payment for the booking ref.
- `SUCCEEDED` payment includes `paidAt`.
- `FAILED` payment includes `failureCode` and `failureMessage`.
- No payment → `404 NOT_FOUND`.

**Implementation:** `services/payment/payment/handler.go` · `GetByBookingRef`

---

### QML-008 — Prevent Duplicate Payments ✅ Done

> A second charge attempt on a `CONFIRMED` booking returns `409 ALREADY_PAID`.

**Acceptance Criteria:**
- payment-service calls `GET /api/bookings/:ref` before charging.
- `CONFIRMED` status → `409 ALREADY_PAID` without calling Omise.

**Implementation:** `services/payment/payment/service.go` · `ErrAlreadyPaid`

---

### QML-009 — Handle Payment Failures Gracefully ✅ Done

> Failed payment records a `FAILED` row; booking stays `PENDING`; retry allowed.

**Acceptance Criteria:**
- Declined card → `FAILED` payment recorded in DB.
- Booking status remains `PENDING` after failure.
- Retry with different card is allowed.
- `402` returned with `failureCode` + `failureMessage`.

**Implementation:** `services/payment/payment/service.go` · `FailedError`

---

### QML-063 — Booking Cancellation & Refund Processing ❌ Not done
*(formerly PAY-002)*

> As a passenger, I want to cancel my booking and receive a refund based on the cancellation policy.

**API:** `POST /api/bookings/{id}/cancel` · `POST /api/payments/refund`

**Acceptance Criteria:**
- Policy: `>24h before departure = 80% refund`, `<24h = no refund`, no-show = no refund.
- Refund amount shown before passenger confirms.
- Cancellation reason required; document upload for medical/visa.
- Booking → `CANCELLED` immediately; refund processed within 5–7 business days.
- "Keep my booking" escape hatch shown prominently.

**Size:** 8 pts | **Sprint:** 3 | **Priority:** High | **Depends on:** QML-005

---

### EPIC: Platform Security & Observability

---

### QML-010 — Secure Authentication via JWT ⚠️ Partial
*(formerly AUTH-002, AUTH-003)*

> RS256 JWT required on all `/api/*` routes except `/api/flights/search` and `/health/*`.

**Current implementation:** `middleware.SessionAuth()` — accepts any opaque `Bearer <token>` and stores it as `userSub`. **No cryptographic verification. Not RS256. No `exp` check. Not JWT.**

**Gap:** Replace `SessionAuth` with a proper RS256 JWT middleware that:
- Validates signature with `JWT_PUBLIC_KEY` (RS256 only — reject HS256).
- Rejects missing/expired/malformed tokens with `401 UNAUTHORIZED`.
- Requires `sub` and `exp` claims; extracts `sub` as `userSub`.
- Service refuses to start if `JWT_PUBLIC_KEY` env var is absent.

**Acceptance Criteria:**
- Valid RS256 token → handler receives request.
- Missing/expired/HS256/malformed token → `401 {"error":"UNAUTHORIZED","message":"missing or invalid token"}`.
- `GET /api/flights/search` — no token required.
- `PUT /api/bookings/:ref/status` — internal token only (no JWT).
- `GET /health/live` / `GET /health/ready` — no token required.

**Size:** 5 pts | **Sprint:** 1 | **Priority:** High

---

### QML-011 — Internal Token Guard Middleware ⚠️ Partial

> `PUT /api/bookings/:bookingRef/status` accepts only calls with a correct `X-Internal-Token`.

**Current implementation:** `middleware.InternalToken()` exists with `crypto/subtle.ConstantTimeCompare` ✅. `INTERNAL_TOKEN` required at startup ✅.

**Gap:** Returns `401 UNAUTHORIZED` but spec requires `403 FORBIDDEN`.

**Required fix:** Change `http.StatusUnauthorized` → `http.StatusForbidden` and error code `"FORBIDDEN"` in `internal_token.go`.

**Acceptance Criteria:**
- Correct `X-Internal-Token` → handler invoked.
- Missing header → `403 {"error":"FORBIDDEN","message":"internal token required"}`.
- Wrong token value → `403 FORBIDDEN`.
- `crypto/subtle.ConstantTimeCompare` used (no `==`).
- `INTERNAL_TOKEN` empty at startup → `os.Exit(1)`.

**Size:** 1 pt | **Sprint:** 1 | **Priority:** High

---

### QML-012 — Rate Limiting ⚠️ Partial

> Per-IP rate limits on all sensitive endpoints.

**Current implementation:**
- payment-service: `POST /api/payments/charge` — `rate.Limit(10)`, burst 20 ✅
- qoomlee-service: **no rate limiting** ❌
- health endpoints: **no rate limiting** ❌

**Gaps:** Need rate limiting on:

| Endpoint | Requests/min | Burst |
|----------|-------------|-------|
| `GET /api/flights/search` | 100 | 20 |
| `POST /api/bookings` | 30 | 5 |
| `GET /health/live` | 30 | 10 |
| `GET /health/ready` | 30 | 10 |

payment-service charge rate needs adjustment to match spec (10 req/min not 10 req/s).

**Acceptance Criteria:**
- Per-IP using `golang.org/x/time/rate` in-memory map keyed by `c.ClientIP()`.
- Exceeded limit → `429 {"error":"RATE_LIMIT_EXCEEDED","message":"Too many requests. Please try again later."}`.
- Two different IPs get independent quotas.

**Size:** 3 pts | **Sprint:** 2 | **Priority:** Medium

---

### QML-013 — Passenger Email Validation ❌ Not done

> `POST /api/bookings` with malformed email → `400 INVALID_FIELD`.

**Gap:** `create_handler.go` only checks `Email == ""`. No format check.

**Required change in `create_handler.go`:**
```go
if _, err := mail.ParseAddress(req.Passenger.Email); err != nil {
    c.JSON(http.StatusBadRequest, apiErr("INVALID_FIELD", "passenger email must be a valid email address"))
    return
}
```

**Acceptance Criteria:**
- `"user@example.com"` → `201`.
- `"notanemail"` / `"@"` / `"user@"` / `"@example.com"` → `400 INVALID_FIELD`.
- `""` → `400 MISSING_REQUIRED_FIELD` (existing check unchanged).

**Size:** 1 pt | **Sprint:** 1 | **Priority:** High

---

### QML-014 — Request Correlation ID ✅ Done

> Every request gets a UUID v4 `X-Request-ID`; echoed in response; in all log lines.

**Current implementation:** `middleware.CorrelationID()` wired in both services. Sets `correlation_id` in context; `X-Request-ID` echoed in response.

**Minor gap vs spec:** Spec calls the log field `requestId`; implementation uses `correlation_id`. No behaviour difference — cosmetic.

**Implementation:** `services/qoomlee/middleware/correlationid.go` · `services/payment/middleware/correlationid.go`

---

### QML-015 — Structured Request Logging ⚠️ Partial

> Every HTTP request logged as structured JSON with method, path, status, latency_ms, requestId.

**Current implementation:** `middleware.RequestLogger()` exists in both services. Logs `method`, `path`, `status`, `latency_ms`, `correlation_id`. Uses `gin.New()` (not `gin.Default()`).

**Gaps:**
1. Always logs at `INFO` — spec requires `WARN` for 4xx, `ERROR` for 5xx.
2. Field name `correlation_id` vs spec's `requestId`.

**Required fix:**
```go
level := slog.LevelInfo
if status >= 500 {
    level = slog.LevelError
} else if status >= 400 {
    level = slog.LevelWarn
}
slog.Log(context.Background(), level, "request", ...)
```

**Size:** 1 pt | **Sprint:** 1 | **Priority:** Medium

---

### EPIC: Seat Management (new — QML-049..058)

---

### QML-049 — Seat Configuration Management ❌ Not done
*(formerly SEAT-001)*

> As an operations admin, I want to define the seat layout for each aircraft type.

**API:** `POST /api/v1/seats/config`

**Acceptance Criteria:**
- Each seat: number (e.g. 12A), row, column, type (WINDOW/MIDDLE/AISLE), fare class (ECONOMY/PREMIUM_ECONOMY/BUSINESS/FIRST), optional features (EXTRA_LEGROOM, EXIT_ROW, BULKHEAD).
- Duplicate seat number for same aircraft → `409 Conflict`.
- Deactivated seats excluded from availability queries.
- All changes audited with staff ID + timestamp.

**Size:** 8 pts | **Sprint:** 3 | **Priority:** Must Have | **Depends on:** QML-066

---

### QML-050 — Seat Inventory Initialisation ❌ Not done
*(formerly SEAT-002)*

> On flight creation, seat inventory is automatically initialised.

**API:** `POST /api/v1/seats/inventory/init` (called by Flight Service)

**Acceptance Criteria:**
- Creates one `seat_inventory` row per seat in aircraft configuration, all `AVAILABLE`.
- Idempotent — re-trigger returns existing count, no duplicates.
- Returns per-fare-class seat count summary.
- Unknown aircraft type → `422`.

**Size:** 5 pts | **Sprint:** 3 | **Priority:** Must Have | **Depends on:** QML-049, QML-066

---

### QML-051 — Seat Availability Query ❌ Not done
*(formerly SEAT-003)*

> Query available seats for a flight with optional filters.

**API:** `GET /api/v1/seats/inventory/{flightId}?fareClass=ECONOMY&seatType=WINDOW`

**Acceptance Criteria:**
- Returns all `AVAILABLE` seats; optional filter by fare class / seat type.
- Expired locks (TTL passed) treated as `AVAILABLE`.
- Redis cache with 30-second TTL; p99 < 200ms.

**Size:** 5 pts | **Sprint:** 3 | **Priority:** Must Have | **Depends on:** QML-050

---

### QML-052 — Seat Lock During Booking Session ❌ Not done
*(formerly SEAT-004)*

> Place an 8-minute lock on a seat to prevent double-booking.

**API:** `POST /api/v1/seats/lock`

**Acceptance Criteria:**
- `AVAILABLE → LOCKED` for 8 minutes, associated with `booking_session_id`.
- Already-locked or already-booked seat → `409 Conflict`.
- Optimistic locking (version field) prevents concurrent race conditions.

**Size:** 13 pts | **Sprint:** 4 | **Priority:** Must Have | **Depends on:** QML-051

---

### QML-053 — Seat Booking Confirmation ❌ Not done
*(formerly SEAT-005)*

> After payment, confirm seat lock: `LOCKED → BOOKED`.

**API:** `POST /api/v1/seats/lock/{lockId}/confirm`

**Acceptance Criteria:**
- Accepts `lockId` + `bookingId`; `seat_inventory.booked_by_booking_id` set.
- Expired lock → `410 Gone (LOCK_EXPIRED)`. Already confirmed → idempotent `200`.

**Size:** 8 pts | **Sprint:** 4 | **Priority:** Must Have | **Depends on:** QML-052

---

### QML-054 — Seat Release on Cancellation ❌ Not done
*(formerly SEAT-006)*

> On booking cancellation, release seat: `BOOKED → AVAILABLE`.

**API:** `DELETE /api/v1/seats/booking/{bookingId}`

**Acceptance Criteria:**
- `seat_inventory.booked_by_booking_id` cleared; lock marked `RELEASED`.
- `CHECKED_IN` seat → `409 Conflict`.
- Redis cache invalidated on release.

**Size:** 5 pts | **Sprint:** 4 | **Priority:** Must Have | **Depends on:** QML-053

---

### QML-055 — Seat Change at Check-in ❌ Not done
*(formerly SEAT-007)*

> Allow passenger to change assigned seat during check-in window.

**API:** `PUT /api/v1/seats/assignment` · Body: `{ bookingId, currentSeatNumber, newSeatNumber }`

**Acceptance Criteria:**
- Old seat → `AVAILABLE`; new seat → `BOOKED`. Operation atomic.
- New seat unavailable → `409`. Fare class mismatch → `422`.

**Size:** 8 pts | **Sprint:** 4 | **Priority:** Must Have | **Depends on:** QML-053

---

### QML-056 — Seat Check-in Confirmation ❌ Not done
*(formerly SEAT-008)*

> After check-in, mark seat `CHECKED_IN`.

**API:** `POST /api/v1/seats/checkin-confirm`

**Acceptance Criteria:**
- `BOOKED → CHECKED_IN`; `checked_in_passenger_id` set.
- Idempotent — duplicate confirm returns `200`.
- Confirming `AVAILABLE` or `LOCKED` seat → `422`.

**Size:** 5 pts | **Sprint:** 4 | **Priority:** Must Have | **Depends on:** QML-055

---

### QML-057 — Seat Map Visualisation Endpoint ❌ Not done
*(formerly SEAT-009)*

> Structured seat map with live availability overlay for visual seat selection.

**API:** `GET /api/v1/seats/inventory/{flightId}/map`

**Acceptance Criteria:**
- Returns rows in ascending order; each seat: number, row, column, type, fare class, features, status.
- Status reflects real-time data (not stale > 30s). `LOCKED` shown as `LOCKED`.

**Size:** 8 pts | **Sprint:** 4 | **Priority:** Should Have | **Depends on:** QML-051

---

### QML-058 — Seat Block Management ❌ Not done
*(formerly SEAT-010)*

> Block specific seats (crew, inoperative, VIP) so they're excluded from passenger selection.

**API:** `POST /api/v1/seats/block`

**Acceptance Criteria:**
- Block with reason: `CREW / MAINTENANCE / VIP / WEIGHT_BALANCE`. Status → `BLOCKED`.
- Unblock if not `BOOKED` or `CHECKED_IN`. All actions audited.

**Size:** 5 pts | **Sprint:** 5 | **Priority:** Should Have | **Depends on:** QML-050

#### Seat Status State Machine
```
AVAILABLE ──[QML-052]──► LOCKED ──[TTL expired]──► AVAILABLE
    ▲                        │
    │                [QML-053: confirm]
    │                        ▼
    │                     BOOKED ──[QML-056]──► CHECKED_IN
    │                        │
    │                [QML-054: release]
    └────────────────────────┘
BLOCKED (admin via QML-058, independent transition from/to AVAILABLE)
```

---

### EPIC: Web — Flight Search Experience

*(QML-016..024 — all ✅ Done. Full AC in CHALLENGE.md.)*

| # | Story | Key Behaviour |
|---|-------|--------------|
| QML-016 | Flight Search Form — Core | One-way / Round-trip toggle; swap airports; inline validation |
| QML-017 | Flight Search Form — Desktop | Single-row layout ≥ 1024px; errors don't shift Search button |
| QML-018 | Flight Search Form — Mobile | Stacked card layout < 768px; floating swap button |
| QML-019 | Date Range Picker — Core | One-way closes on pick; round-trip advances to return step |
| QML-020 | Date Range Picker — Desktop | Floating panel showing 2 months; click-outside closes |
| QML-021 | Date Range Picker — Mobile | Full-screen modal; "Done" button; step label in header |
| QML-022 | View Flight Search Results | Cards with flight#, route, times, duration, seats, price |
| QML-023 | Travelers & Class — Desktop | Inline stepper + chips (no card border) |
| QML-024 | Travelers & Class — Mobile | Label above controls; positioned below date pickers |

---

### EPIC: Web — Booking Journey

*(QML-025..028 — all ✅ Done. Full AC in CHALLENGE.md.)*

| # | Story | Key Behaviour |
|---|-------|--------------|
| QML-025 | Create a Booking | Passenger details form; validation; POST to API; redirect to confirmation |
| QML-026 | Booking Confirmation with Copy PNR | PNR in monospace; copy icon → checkmark 2s; full summary |
| QML-027 | View My Bookings | Cards: PNR, route, flight#, dep date, status badge, total; tap → detail |
| QML-028 | Pay for a Booking | Shows booking ref + total; card form; success → CONFIRMED |

---

### EPIC: Web — My Trips

*(QML-029, QML-030, QML-047 — all ✅ Done. Full AC in CHALLENGE.md.)*

| # | Story | Key Behaviour |
|---|-------|--------------|
| QML-029 | Online Check-in | PNR lookup → passenger confirm → seat select → review |
| QML-030 | View Boarding Passes | Pass card with all fields; detail view with scannable QR/barcode |
| QML-047 | Manage Your Trip | Fetches and displays real booking details from API |

---

### EPIC: Web — Account & Profile

---

### QML-031 — Login & Registration ✅ Done

> Registration, login, and forgot-password flows.

**Acceptance Criteria:**
- Registration: valid name/email/password → verification email; inline errors for invalid email/weak password.
- Login: valid credentials → authenticated, redirect to `/flights`.
- Forgot password: submit email → confirmation message shown.

---

### QML-032 — Manage Profile ✅ Done

> View and update account details.

**Acceptance Criteria:**
- Shows name, email, phone, nationality, passport details; initials as avatar (no photo).
- Edit → save persists updates.
- Settings page: notification preference toggles.

---

### QML-064 — Password Reset / Forgot Password ❌ Not done
*(formerly AUTH-004)*

> As a registered user, I want to request a password reset link via email.

**API:** `POST /api/auth/forgot-password` · `POST /api/auth/reset-password`

**Acceptance Criteria:**
- Time-limited reset link (60 min); single-use; invalidated after use.
- Expired/invalid link shows clear error.
- Success screen shows email address and 60s resend countdown.
- Completed reset auto-logs user in.
- No account enumeration — neutral response for unregistered emails.

**Size:** 3 pts | **Sprint:** 1 | **Priority:** High | **Depends on:** QML-031

---

### QML-065 — Email Verification After Registration ❌ Not done
*(formerly AUTH-006)*

> As a new user, verify email with 6-digit OTP.

**API:** `POST /api/auth/verify-email` · `POST /api/auth/resend-otp`

**Acceptance Criteria:**
- OTP valid 10 min; max 3 attempts before lockout; 60s resend cooldown.
- Correct OTP → account activated, redirect to home.
- Expired OTP → resend button enabled; new code sent.

**Size:** 2 pts | **Sprint:** 1 | **Priority:** High | **Depends on:** QML-031

---

### EPIC: Web — Airport Selection

*(QML-033, QML-034 — all ✅ Done. Full AC in CHALLENGE.md.)*

| # | Story | Key Behaviour |
|---|-------|--------------|
| QML-033 | Airport Select — Desktop Dropdown | Popular list on open; filters on type; excludes selected origin |
| QML-034 | Airport Select — Mobile Bottom Sheet | Slides up; drag handle; backdrop tap closes without selection |

---

### EPIC: Web — Discovery

*(QML-035, QML-036, QML-037 — all ✅ Done — web UI only. Backend APIs QML-068, QML-069 are ❌ not done.)*

| # | Story | Key Behaviour |
|---|-------|--------------|
| QML-035 | Popular Destinations & Travel Tips | Destination cards with name + price + trending badge; travel tip section |
| QML-036 | Check Flight Status | Flight number input; shows status, route, times; not-found message |
| QML-037 | View Travel Requirements | Requirements list with status badges; tappable reference links |

---

### EPIC: Web — App Shell

*(QML-038 ✅ Done. Full AC in CHALLENGE.md.)*

| # | Story | Key Behaviour |
|---|-------|--------------|
| QML-038 | App Navigation | Sticky top bar (desktop); bottom nav (mobile); active item highlighted; logo → /flights |

---

### EPIC: Platform Security (Cross-cutting)

---

### QML-039 — HTTP Security Headers — API Services ✅ Done

**Acceptance Criteria (all present on every response):**
- `Cache-Control: no-store, no-cache, must-revalidate`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

**Implementation:** `services/qoomlee/middleware/securityheaders.go` · `services/payment/middleware/securityheaders.go`

---

### QML-040 — HTTP Security Headers — Web Frontend ✅ Done

**Acceptance Criteria:**
- `Content-Security-Policy` restricts scripts, styles, fonts, images, connections to trusted sources.
- `unsafe-eval` in `script-src` in dev (Turbopack); removed in production.
- `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.

**Implementation:** `app/web/next.config.ts` — `headers()` function.

---

### EPIC: Booking Expiry & Status (Cross-cutting)

*(QML-041..046 — all ✅ Done. Full AC in CHALLENGE.md.)*

| # | Story | Key Behaviour |
|---|-------|--------------|
| QML-041 | Record Seat-Hold Expiry | `expires_at = created_at + 15 min`; `user_sub` from session; `expiresAt` in response |
| QML-042 | Lazily Expire Stale Bookings | GET on expired PENDING → flip to EXPIRED + increment `available_seats` in one tx |
| QML-043 | Reject Expired/Confirmed | `PUT .../status` on EXPIRED → `409 booking_expired`; on CONFIRMED → `409 already_confirmed` |
| QML-044 | Server-Derived Countdown | `/payment` seeds countdown from `expiresAt`, not hardcoded 900s; refresh-safe |
| QML-045 | Handle Expiry Mid-Submit | `409 booking_expired` on charge → shows "hold expired" panel, not generic error |
| QML-046 | My Bookings Real Data | `GET /api/bookings` scoped by `user_sub`; lazy expiry applied to each row |

---

### EPIC: Travel Compliance (new)

---

### QML-069 — Travel Requirements & Visa Checker API ❌ Not done
*(formerly COMP-001 — QML-037 covers the static web display; this story adds the personalised backend API)*

> As a passenger, I want travel requirements personalised to my nationality × destination.

**API:** `GET /api/travel-requirements?origin={IATA}&destination={IATA}&nationality={ISO2}`

**Acceptance Criteria:**
- Returns visa type: e-Visa / VOA / Visa-free / Embassy visa.
- Requirements personalised per nationality × destination.
- Legal disclaimer shown as non-dismissible banner.
- Cache with 1-hour TTL; fallback to DB on miss.

**Size:** 5 pts | **Sprint:** 2 | **Priority:** High | **Depends on:** QML-001

---

### QML-070 — Health Documentation Upload ❌ Not done
*(formerly COMP-002)*

> As a passenger, upload vaccination or health certificates before travel.

**API:** `POST /api/bookings/{id}/passengers/{pid}/health-docs` (multipart/form-data)

**Acceptance Criteria:**
- Types: Vaccination cert, PCR result, medical clearance. Formats: JPG/PNG/PDF, max 5 MB.
- Status: Pending Review → Accepted / Rejected (with reason). Rejected docs can be re-uploaded.
- Passenger notified on status change.

**Size:** 5 pts | **Sprint:** 2 | **Priority:** High | **Depends on:** QML-069, QML-003

---

### QML-071 — Pre-travel Preparation Checklist ❌ Not done
*(formerly COMP-003)*

> Personalised pre-travel checklist for a confirmed booking.

**API:** `GET /api/bookings/{id}/checklist` · `PATCH /api/bookings/{id}/checklist/{item}/complete`

**Acceptance Criteria:**
- Items: Passport, Visa, Insurance, Check-in, Seat, Baggage, Transport, Currency.
- Completion persists across sessions; deep-links into app screens.
- Countdown to departure + check-in open time at top.

**Size:** 2 pts | **Sprint:** 4 | **Priority:** Low | **Depends on:** QML-003, QML-069

---

### EPIC: Passenger Services (new)

---

### QML-072 — Airport Information Guide ❌ Not done
*(formerly SERV-001)*

> Access airport-specific info (terminals, transport, facilities).

**API:** `GET /api/airports/{iata}/info`

**Acceptance Criteria:**
- Initial airports: BKK and SYD.
- Covers: terminal map, check-in counters, security guidance, dining, transport, WiFi.
- Accessible offline (cached on app launch, 24-hour TTL).

**Size:** 3 pts | **Sprint:** 4 | **Priority:** Low

---

### QML-073 — Customer Support Hub ❌ Not done
*(formerly SERV-002)*

> Access help articles, FAQ, and live support channels.

**API:** `GET /api/support/faqs` · `GET /api/support/agent-status` · `POST /api/support/chat/session`

**Acceptance Criteria:**
- Search bar filters articles by keyword; topic chips: Cancellations, Baggage, Check-in, Refunds.
- Live chat: shows agent availability + avg wait; disabled when no agents (email CTA shown instead).
- Contact options: Phone (24/7), Email (24h reply), community forum.

**Size:** 3 pts | **Sprint:** 3 | **Priority:** Medium | **Depends on:** QML-031

---

## Implementation Reality Check

### Stories done in CHALLENGE.md but actually ✅ Done (code verified)

| QML | Claim | Reality |
|-----|-------|---------|
| QML-005 | ⬜ Todo | ✅ payment-service fully implemented with Omise |
| QML-006 | ⬜ Todo | ✅ GET /api/payments/:bookingRef implemented |
| QML-008 | ⬜ Todo | ✅ ErrAlreadyPaid guard implemented |
| QML-009 | ⬜ Todo | ✅ FailedError handling + FAILED status recorded |
| QML-014 | ⬜ Todo | ✅ CorrelationID middleware wired in both services |

### Stories done in CHALLENGE.md but actually ⚠️ Partial

| QML | Gap |
|-----|-----|
| QML-010 | Uses opaque `SessionAuth` not RS256 JWT — no crypto verification |
| QML-011 | Returns `401` not `403` as spec requires |
| QML-012 | Only payment charge endpoint rate-limited; qoomlee-service has none |
| QML-015 | Always logs INFO; no WARN/ERROR differentiation by status code |

### Quick wins (small gaps, high value)

| QML | Fix | Effort |
|-----|-----|--------|
| QML-013 | Add `mail.ParseAddress()` in `create_handler.go` | 30 min |
| QML-011 | Change `401` → `403` in `internal_token.go` | 5 min |
| QML-015 | Add status-code branching in `requestlog.go` | 15 min |

---

## Story Point Summary

| Epic | Stories | Points | ✅ Done | ⚠️ Partial | ❌ Todo |
|------|---------|--------|---------|-----------|--------|
| Flight Discovery | QML-001,002,066,067,068 | ~39 | 2 | 0 | 3 |
| Booking | QML-003,004,007,013,048,059–062 | ~60 | 4 | 0 | 5 |
| Payment | QML-005,006,008,009,063 | ~46 | 4 | 0 | 1 |
| Platform Security | QML-010–015 | ~14 | 1 | 3 | 2 |
| Seat Management | QML-049–058 | 70 | 0 | 0 | 10 |
| Web — Flight Search | QML-016–024 | ~40 | 9 | 0 | 0 |
| Web — Booking Journey | QML-025–028 | ~30 | 4 | 0 | 0 |
| Web — My Trips | QML-029,030,047 | ~20 | 3 | 0 | 0 |
| Web — Account & Profile | QML-031,032,064,065 | ~15 | 2 | 0 | 2 |
| Web — Airport Selection | QML-033,034 | ~15 | 2 | 0 | 0 |
| Web — Discovery | QML-035,036,037 | ~15 | 3 | 0 | 0 |
| Web — App Shell | QML-038 | ~5 | 1 | 0 | 0 |
| Platform Security (X-cutting) | QML-039,040 | ~10 | 2 | 0 | 0 |
| Booking Expiry & Status | QML-041–046 | ~30 | 6 | 0 | 0 |
| Auth Extensions | QML-064,065 | 5 | 0 | 0 | 2 |
| Travel Compliance | QML-069,070,071 | 12 | 0 | 0 | 3 |
| Passenger Services | QML-072,073 | 6 | 0 | 0 | 2 |

**Total: ~432 story points | ✅ 43 done | ⚠️ 3 partial | ❌ 27 todo**
