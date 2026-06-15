# Qoomlee Airline — Agent Skills Challenge

---

## Table of Contents

1. [What You're Building](#whats-building)
2. [User Stories](#user-stories)
3. [Full Flow Acceptance Criteria](#full-flow-acceptance-criteria)
4. [What's Provided](#whats-provided)
5. [What You Build](#what-you-build)
6. [Team Setup](#team-setup)
7. [Start Here](#start-here)
8. [Technology Stack](#technology-stack)
9. [Service Architecture](#service-architecture)
10. [The Database](#the-database)
11. [How the Endpoints Connect](#how-the-endpoints-connect)
12. [Endpoint Specifications](#endpoint-specifications)
13. [Infrastructure Requirements](#infrastructure-requirements)
14. [Implementation Requirements](#implementation-requirements)
15. [Testing Requirements](#testing-requirements)
16. [Constraints](#constraints)
17. [Scoring](#scoring)
18. [FAQ](#faq)

---

## Story Status

### EPIC: Flight Discovery
| # | Story | Service | Status |
|---|-------|---------|--------|
| QML-001 | Search Flights | qoomlee-service | ✅ Done |
| QML-002 | View Flight Details | qoomlee-service | ✅ Done |

### EPIC: Booking
| # | Story | Service | Status |
|---|-------|---------|--------|
| QML-003 | Create a Booking | qoomlee-service | ✅ Done |
| QML-004 | View Booking Details | qoomlee-service | ✅ Done |
| QML-007 | Prevent Overbooking | qoomlee-service | ✅ Done |
| QML-013 | Passenger Email Validation | qoomlee-service | ⬜ Todo |

### EPIC: Payment
| # | Story | Service | Status |
|---|-------|---------|--------|
| QML-005 | Pay for Booking | payment-service | ⬜ Todo |
| QML-006 | View Payment Receipt | payment-service | ⬜ Todo |
| QML-008 | Prevent Duplicate Payments | payment-service | ⬜ Todo |
| QML-009 | Handle Payment Failures Gracefully | payment-service | ⬜ Todo |

### EPIC: Platform Security & Observability
| # | Story | Service | Status |
|---|-------|---------|--------|
| QML-010 | Secure Authentication via JWT | both services | ⬜ Todo |
| QML-011 | Internal Token Guard Middleware | qoomlee-service | ⬜ Todo |
| QML-012 | Rate Limiting | both services | ⬜ Todo |
| QML-014 | Request Correlation ID | both services | ⬜ Todo |
| QML-015 | Structured Request Logging | both services | ⬜ Todo |

### EPIC: Web — Flight Search Experience
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-016 | Flight Search Form — Core behavior | web | ✅ Done |
| QML-017 | Flight Search Form — Desktop layout | web · desktop | ✅ Done |
| QML-018 | Flight Search Form — Mobile layout | web · mobile | ✅ Done |
| QML-019 | Date Range Picker — Core behavior | web | ✅ Done |
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

### EPIC: Web — Account & Profile
| # | Story | Platform | Status |
|---|-------|----------|--------|
| QML-031 | Login & Registration | web | ✅ Done |
| QML-032 | Manage Profile | web | ✅ Done |

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
| # | Story | Service | Status |
|---|-------|---------|--------|
| QML-039 | HTTP Security Headers — API Services | both services | ✅ Done |
| QML-040 | HTTP Security Headers — Web Frontend | web | ✅ Done |

### EPIC: Booking Expiry & Status (Cross-cutting)
| # | Story | Service | Status |
|---|-------|---------|--------|
| QML-041 | Record Seat-Hold Expiry at Booking Creation | qoomlee-service | ⬜ Todo |
| QML-042 | Lazily Expire Stale Pending Bookings on Read | qoomlee-service | ⬜ Todo |
| QML-043 | Reject Confirmation & Charges for Expired Bookings | both services | ⬜ Todo |
| QML-044 | Server-Derived Payment Countdown | web | ⬜ Todo |
| QML-045 | Handle Expiry Mid-Submit | web | ⬜ Todo |
| QML-046 | "My Bookings" Backed by Real Data | web + qoomlee-service | ⬜ Todo |

---

## What You're Building

You're building the backend for a simple airline booking system called **Qoomlee**.
It's a REST API only — no frontend, no UI.

Here's the journey a passenger takes:

```
Search flights  →  Pick a flight  →  Book a seat  →  Pay  →  Get confirmation
```

Your job is to make that entire journey work — from searching available flights
all the way to a confirmed, paid booking.

---

## User Stories

---

### EPIC: Flight Discovery

---

### QML-001 — Search Flights · ✅ Done

> As a passenger, I want to search for flights by origin, destination, and date so that I can find suitable travel options.

**Acceptance Criteria**

- **Given** a valid origin airport code, destination airport code, and date
  **When** I search for available flights
  **Then** the system returns a list of matching flights with flight number, departure/arrival times, price, and available seats
- **Given** no flights match the search criteria
  **When** I search for available flights
  **Then** the system returns an empty list
- **Given** missing required search parameters
  **When** I search for available flights
  **Then** the system returns an appropriate error response

**Test Cases**

| Type | Case |
|---|---|
| Positive | Search for BKK→SIN on 2026-06-15 returns matching flights |
| Negative | Search with missing origin returns `400 MISSING_REQUIRED_FIELD` |
| Negative | Search with invalid date format returns `400 INVALID_DATE_FORMAT` |
| Normal | Search for sold-out flights excludes them from results |

---

### QML-002 — View Flight Details · ✅ Done

> As a passenger, I want to view detailed flight information so that I can confirm flight times, prices, and availability before booking.

**Acceptance Criteria**

- **Given** a valid flight ID
  **When** I request detailed flight information
  **Then** the system returns complete flight details including flight number, route, departure/arrival times, price, and available seats
- **Given** a flight ID that does not exist
  **When** I request detailed flight information
  **Then** the system returns a 404 error
- **Given** a valid flight
  **When** I request detailed flight information
  **Then** the system calculates and includes duration from departure and arrival times

**Test Cases**

| Type | Case |
|---|---|
| Positive | `GET /api/flights/1` returns complete flight details |
| Negative | `GET /api/flights/99999` returns `404 FLIGHT_NOT_FOUND` |
| Normal | Response includes `durationMinutes` field |

---

### EPIC: Booking

---

### QML-003 — Create a Booking · ✅ Done

> As a passenger, I want to create a booking for a flight so that I can reserve my seat and receive a booking reference.

**Acceptance Criteria**

- **Given** valid flight ID and passenger details
  **When** I create a booking
  **Then** the system creates the booking and returns a 6-character booking reference (PNR)
- **Given** a booking request with valid details
  **When** I create a booking
  **Then** the system decrements available seats for the flight
- **Given** a flight with no available seats
  **When** I attempt to create a booking
  **Then** the system prevents overbooking and returns an appropriate error
- **Given** a booking request
  **When** I create a booking
  **Then** the system ensures total amount matches flight price at time of booking

**Test Cases**

| Type | Case |
|---|---|
| Positive | `POST /api/bookings` with valid flight ID returns `201` with `bookingRef` |
| Negative | `POST` for sold-out flight returns `409 NO_SEATS_AVAILABLE` |
| Negative | `POST` with missing passenger details returns `400 MISSING_REQUIRED_FIELD` |
| Normal | Concurrent bookings on 1-seat flight results in 1 success and 1 failure |

---

### QML-004 — View Booking Details · ✅ Done

> As a passenger, I want to view my booking details so that I can confirm my reservation information including flight and passenger details.

**Acceptance Criteria**

- **Given** a valid booking reference
  **When** I request booking details
  **Then** the system returns booking details with nested passenger and flight information
- **Given** a valid booking reference
  **When** I request booking details
  **Then** the system returns details including booking status, PNR, passenger info, and flight details
- **Given** a booking reference that does not exist
  **When** I request booking details
  **Then** the system returns a 404 error
- **Given** a confirmed booking
  **When** I request booking details
  **Then** the system includes payment provider and charge ID information

**Test Cases**

| Type | Case |
|---|---|
| Positive | `GET /api/bookings/SEED01` returns complete booking with `CONFIRMED` status |
| Negative | `GET /api/bookings/XXXXXX` returns `404 BOOKING_NOT_FOUND` |
| Normal | `PENDING` bookings show `null` for payment provider fields |
| Normal | `CONFIRMED` bookings show `paymentProvider` and `providerChargeId` |

---

### EPIC: Payment

---

### QML-005 — Pay for Booking · ⬜ Todo

> As a passenger, I want to pay for my booking securely so that I can confirm my reservation and receive payment confirmation.

**Acceptance Criteria**

- **Given** a valid booking reference and card token
  **When** I initiate payment
  **Then** the system charges payment using Omise
- **Given** a payment request with amount
  **When** I initiate payment
  **Then** the system validates amount matches booking total before charging
- **Given** a successful payment
  **When** the payment completes
  **Then** the system updates booking status to `CONFIRMED`
- **Given** a payment request
  **When** I initiate payment
  **Then** the system records payment details in payment database
- **Given** an already confirmed booking
  **When** I attempt to make payment
  **Then** the system prevents duplicate payments

**Test Cases**

| Type | Case |
|---|---|
| Positive | `POST /api/payments/charge` with success card returns `201` with `SUCCEEDED` status |
| Negative | `POST` with decline card returns `402 PAYMENT_FAILED` |
| Negative | `POST` for already `CONFIRMED` booking returns `409 ALREADY_PAID` |
| Negative | `POST` with mismatched amount returns `400 AMOUNT_MISMATCH` |

---

### QML-006 — View Payment Receipt · ⬜ Todo

> As a passenger, I want to view my payment receipt so that I can have proof of payment and booking confirmation.

**Acceptance Criteria**

- **Given** a valid booking reference
  **When** I request payment details
  **Then** the system returns payment details for that booking
- **Given** a payment exists
  **When** I request payment details
  **Then** the system returns details including payment status, amount, provider, and timestamps
- **Given** multiple payment attempts for the same booking
  **When** I request payment details
  **Then** the system returns the most recent payment attempt
- **Given** no payment exists for the booking reference
  **When** I request payment details
  **Then** the system returns a 404 error

**Test Cases**

| Type | Case |
|---|---|
| Positive | `GET /api/payments/SEED01` returns `SUCCEEDED` payment details |
| Negative | `GET /api/payments/XXXXXX` returns `404 PAYMENT_NOT_FOUND` |
| Normal | Returns latest payment when multiple attempts exist for same booking |

---

### QML-007 — Prevent Overbooking · ✅ Done

> As a system, I want to ensure that bookings cannot be overbooked so that I maintain accurate seat availability.

**Acceptance Criteria**

- **Given** a booking request
  **When** the system processes the booking
  **Then** the system uses `SELECT FOR UPDATE` to lock flight row during booking
- **Given** a booking request
  **When** the system processes the booking
  **Then** the system checks available seats before creating booking
- **Given** concurrent booking requests
  **When** the system processes them
  **Then** the system prevents concurrent bookings from exceeding seat capacity
- **Given** no seats are available
  **When** I attempt to create a booking
  **Then** the transaction rolls back

**Test Cases**

| Type | Case |
|---|---|
| Normal | Concurrent requests on 1-seat flight results in 1 success and 1 failure |
| Positive | Booking on flight with available seats succeeds |
| Negative | Booking on sold-out flight returns `409 NO_SEATS_AVAILABLE` |

---

### QML-008 — Prevent Duplicate Payments · ⬜ Todo

> As a system, I want to prevent duplicate payments for the same booking so that I avoid charging customers multiple times.

**Acceptance Criteria**

- **Given** a payment request
  **When** the system processes the payment
  **Then** the system checks booking status before processing payment
- **Given** a payment request for an already `CONFIRMED` booking
  **When** the system processes the payment
  **Then** the system rejects the payment
- **Given** a duplicate payment attempt
  **When** I initiate payment
  **Then** the system returns `409 ALREADY_PAID` error
- **Given** a payment request
  **When** the system processes the payment
  **Then** the system calls qoomlee-service to verify booking status before charging

**Test Cases**

| Type | Case |
|---|---|
| Positive | Payment for `PENDING` booking succeeds |
| Negative | Payment for `CONFIRMED` booking returns `409 ALREADY_PAID` |
| Negative | Second payment attempt for same booking returns `409 ALREADY_PAID` |

---

### QML-009 — Handle Payment Failures Gracefully · ⬜ Todo

> As a system, I want to handle payment failures gracefully so that pending bookings remain available for retry.

**Acceptance Criteria**

- **Given** a payment failure (e.g., declined card)
  **When** the payment processing completes
  **Then** the system records `FAILED` payment in database
- **Given** a failed payment
  **When** the payment processing completes
  **Then** the system keeps booking in `PENDING` status
- **Given** a payment failure
  **When** the system processes the failure
  **Then** the system returns appropriate error message for the failure type
- **Given** a booking with failed payment
  **When** I attempt payment again
  **Then** the system allows retry with different payment method

**Test Cases**

| Type | Case |
|---|---|
| Normal | Payment with declined card results in `FAILED` payment record |
| Normal | Booking remains `PENDING` after failed payment |
| Positive | Booking can be retried with success card after failure |
| Negative | Failed payment returns `402` with failure details |

---

### EPIC: Platform Security & Observability

---

### QML-010 — Secure Authentication via JWT · ⬜ Todo

> As a system, I want to ensure secure authentication using JWT so that only authorized users can access booking functionality.

**Acceptance Criteria**

- **Given** a request with a valid RS256 JWT in `Authorization: Bearer <token>`
  **When** the request hits a JWT-protected `/api/*` route
  **Then** the request is passed through to the handler
- **Given** a request with no `Authorization` header
  **When** the request hits a JWT-protected `/api/*` route
  **Then** the service returns `401` with `{ "error": "UNAUTHORIZED", "message": "missing or invalid token" }`
- **Given** a request with an expired JWT
  **When** the request hits a JWT-protected `/api/*` route
  **Then** the service returns `401 UNAUTHORIZED`
- **Given** a request signed with the wrong algorithm (e.g. HS256)
  **When** the request hits a JWT-protected `/api/*` route
  **Then** the service returns `401 UNAUTHORIZED` (algorithm must be validated explicitly)
- **Given** `GET /api/flights/search`
  **When** called with no `Authorization` header
  **Then** the request is allowed — flight search is public so passengers can browse before logging in
- **Given** `PUT /api/bookings/:bookingRef/status`
  **When** called with a valid `X-Internal-Token` and no JWT
  **Then** the request is allowed — this route is exempt from JWT
- **Given** `GET /health/live` or `GET /health/ready`
  **When** called with no token
  **Then** the request is allowed — health probes are unprotected
- **Given** `JWT_PUBLIC_KEY` env var is absent at startup
  **When** the service starts
  **Then** the service refuses to start (`os.Exit(1)`)
- **Given** `JWT_PRIVATE_KEY` is used only for local token generation (`make jwt-token`)
  **Then** the private key must never be present in any running container — only `JWT_PUBLIC_KEY` in env

**Technical Notes**

- Algorithm: RS256 (asymmetric). Use `github.com/golang-jwt/jwt/v5`.
- Required JWT claims: `sub` (subject), `exp` (expiry). Reject if either is missing.
- `GET /api/flights/search` is registered directly on the root router (no JWT middleware) so unauthenticated users can search for flights.
- JWT middleware wired on the `/api` group in `cmd/main.go`, covering booking and flight-detail routes only.
- Use router groups to separate unprotected routes from JWT-protected ones:

```go
// No JWT — health probes, internal service endpoint, and flight search
r.GET("/health/live", ...)
r.GET("/health/ready", ...)
r.GET("/api/flights/search", flightHandler.Search)

internal := r.Group("/api/bookings")
internal.Use(middleware.InternalToken(...))
internal.PUT("/:ref/status", bookingHandler.UpdateStatus)

// JWT required — booking and flight detail
api := r.Group("/api")
api.Use(middleware.JWTAuth(jwtPublicKey))
api.GET("/flights/:id", ...)
api.POST("/bookings", ...)
api.GET("/bookings/:ref", ...)
```

**Test Cases**

| Layer | Type | Case |
|---|---|---|
| Unit | Positive | Valid RS256 token → handler receives request |
| Unit | Negative | Missing `Authorization` header → 401 |
| Unit | Negative | Expired token → 401 |
| Unit | Negative | HS256-signed token → 401 (algorithm mismatch) |
| Unit | Negative | Malformed token string → 401 |
| Contract | Positive | `GET /api/flights/search` without token → 200 (public route) |
| Contract | Negative | `POST /api/bookings` without token → 401 |
| Contract | Positive | `GET /health/live` without token → 200 |
| Contract | Positive | `PUT /api/bookings/SEED02/status` with valid internal token, no JWT → 200 |

---

## Frontend Web Stories

---

### EPIC: Web — Flight Search Experience

---

### QML-016 — Flight Search Form · ✅ Done

> As a passenger, I want to search for flights by trip type, route, and date so that I can find flights that match my plans.

**Acceptance Criteria**

- **Given** I toggle between "One way" and "Round trip"
  **When** the selection changes
  **Then** the return date field appears for round trip and is hidden for one way
- **Given** I type in the origin or destination field
  **When** matching airports are found
  **Then** a dropdown shows IATA code, city name, and airport name for each match
- **Given** I tap the swap icon between origin and destination
  **When** the swap completes
  **Then** the two values are exchanged instantly
- **Given** I tap Search Flights with one or more required fields empty
  **When** validation runs
  **Then** each missing field shows an inline error and the search is blocked
- **Given** all fields are valid
  **When** I tap Search Flights
  **Then** I am taken to the results page with origin, destination, date, passengers, and cabin class in the URL

**Test Cases**

| Type | Case |
|---|---|
| Unit | `validate()` returns false and sets `origin` error when origin is empty |
| Unit | `validate()` returns false and sets `returnDate` error for round-trip when return date is missing |
| Unit | `validate()` returns true when all required fields are filled |
| Unit | `swapAirports()` exchanges origin and destination |
| Unit | `buildSearchUrl()` produces correct query string including cabin and passengers |

---

### QML-017 — Flight Search Form — Desktop Layout · ✅ Done

> As a passenger on desktop, I want the search form to display all fields in a single row so that I can see and fill in everything at once.

**Acceptance Criteria**

- **Given** I view the search form on a screen wider than 1024 px
  **When** the form renders
  **Then** From, To, Departure date, Return Date, and Search Flights appear in one horizontal row with labels aligned at the top
- **Given** one or more fields have validation errors
  **When** the error messages appear below their field
  **Then** the Search Flights button stays top-aligned and does not shift down
- **Given** I hover over any field trigger or the Search button
  **When** the pointer enters
  **Then** the cursor changes to a pointer

**Test Cases**

| Type | Case |
|---|---|
| Visual | All input top edges are at the same Y position (measured via DOM `getBoundingClientRect`) |
| Visual | Search button top stays aligned with inputs when error messages appear |
| Visual | Swap button is vertically centred within the airport input zone |

---

### QML-018 — Flight Search Form — Mobile Layout · ✅ Done

> As a passenger on mobile, I want the search form to stack vertically so that all fields are easy to tap on a small screen.

**Acceptance Criteria**

- **Given** I view the search form on a screen narrower than 768 px
  **When** the form renders
  **Then** From and To inputs are stacked inside a single bordered card separated by a divider line
- **Given** I want to swap origin and destination on mobile
  **When** I tap the swap button that floats over the divider between the two fields
  **Then** the two values are exchanged
- **Given** the form renders on mobile
  **When** I review the layout
  **Then** Departure date, Return Date, Travelers & Class, and Search Flights each occupy their own full-width row below the airport card

**Test Cases**

| Type | Case |
|---|---|
| Visual | Airport inputs render as a stacked card with a divider on viewports < 768 px |
| Visual | Swap button is absolutely positioned over the divider, not in the flow |
| Visual | No horizontal overflow at 375 px viewport width |

---

### QML-019 — Date Range Picker — Core Behavior · ✅ Done

> As a passenger, I want to pick departure and return dates from a calendar so that date selection is visual, fast, and error-free on any device.

**Acceptance Criteria**

- **Given** I open the calendar in one-way mode and pick a date
  **When** the selection is made
  **Then** the calendar closes and the departure date is set
- **Given** I open the calendar in round-trip mode and pick a departure date
  **When** the selection is made
  **Then** the calendar stays open and advances to the return date step automatically
- **Given** I pick a return date after a departure date in round-trip mode
  **When** the selection is made
  **Then** the calendar closes with both dates set
- **Given** I open the return trigger before picking a departure date
  **When** I pick a return date
  **Then** the calendar stays open and switches to the departure step so I can pick departure next without reopening
- **Given** I pick departure after return in the reverse flow
  **When** the selection is made
  **Then** the calendar closes with both dates set
- **Given** I hover over a date while the range band is active
  **When** the pointer moves
  **Then** a light band previews the range from the anchor date to the hovered date with rounded pill caps at each end
- **Given** I am on a one-way trip and click "+ Add return" with no departure date set
  **When** I pick a return date
  **Then** the calendar stays open and switches to the departure step so I can pick departure next without reopening, and picking departure then closes the calendar
- **Given** I am on a one-way trip
  **When** I open the departure calendar and hover over a date after the selected departure date
  **Then** no range band highlight is shown, since one-way has no return date to range to
- **Given** I picked a departure and return date on a round trip and then switch to one-way
  **When** I reopen the departure calendar
  **Then** the stale return date is not shown as selected, does not disable any dates on/after it, and any date can be picked as the new departure

**Test Cases**

| Type | Case |
|---|---|
| Journey | One-way: pick departure → calendar closes |
| Journey | Round-trip: pick departure → calendar stays open → pick return → calendar closes |
| Journey | Reverse flow: open return trigger with no departure → pick return → calendar stays open → pick departure → calendar closes |
| Journey | Opening return trigger with departure already set → pick return → calendar closes |
| Journey | "+ Add return" from one-way with no departure set → pick return → calendar stays open → pick departure → calendar closes |
| Unit | `onReturnChange` fires with ISO date when return is picked first |
| Unit | `onDepartureChange` fires and calendar closes when departure is picked after return in reverse flow |
| Unit | Dates on/after committed return are disabled in departure step (reverse mode) |
| Unit | Normal round-trip and one-way flows are unaffected by reverse-flow logic |
| Regression | No range band rendered when hovering in one-way mode, even with a departure date already set |
| Regression | Range band still renders on round-trip when hovering a return candidate |
| Regression | Stale `returnDate` from a previous round-trip selection does not disable dates on/after it once switched to one-way |
| Regression | Stale `returnDate` is not rendered as a selected day once switched to one-way |
| Regression | A date on/after the stale `returnDate` can be picked as the new departure date in one-way mode |

---

### QML-020 — Date Range Picker — Desktop · ✅ Done

> As a passenger on desktop, I want the calendar to open as a dropdown panel with two months so that I can see a wider date range without scrolling.

**Acceptance Criteria**

- **Given** I click a date trigger on desktop (viewport ≥ 768 px)
  **When** the calendar opens
  **Then** it appears as a floating panel below the trigger showing the current month and the next month side by side
- **Given** the calendar panel is open
  **When** I click outside both the trigger and the panel
  **Then** the calendar closes without selecting any date
- **Given** the calendar is open and focused
  **When** I press the arrow keys
  **Then** focus moves between dates by day (left/right) or week (up/down)
- **Given** a date is focused via keyboard
  **When** I press Enter or Space
  **Then** that date is selected as if clicked
- **Given** the calendar is open
  **When** I press Escape
  **Then** the calendar closes without selecting any date

**Test Cases**

| Type | Case |
|---|---|
| Regression | Mousedown on a day button inside the portal does not close the calendar before the click fires |
| Regression | Clicking a day in the desktop portal registers the date (end-to-end) |
| Regression | Clicking truly outside trigger and panel closes the calendar |
| Unit | Arrow key navigation moves focused date by 1 day (left/right) and 7 days (up/down) |
| Unit | Escape closes the calendar and clears hover state |

---

### QML-021 — Date Range Picker — Mobile · ✅ Done

> As a passenger on mobile, I want the calendar to open as a full-screen overlay so that it is easy to tap dates on a small screen.

**Acceptance Criteria**

- **Given** I tap a date trigger on mobile (viewport < 768 px)
  **When** the calendar opens
  **Then** it covers the full screen as a modal overlay showing a single scrollable month
- **Given** the mobile calendar is open
  **When** I tap a date
  **Then** the selection registers the same way as on desktop (one-way closes, round-trip advances step)
- **Given** I have finished selecting dates
  **When** I tap the "Done" button at the bottom
  **Then** the modal closes
- **Given** the mobile calendar is open
  **When** I review the header
  **Then** a text label tells me whether I am selecting the departure date or the return date

**Test Cases**

| Type | Case |
|---|---|
| Visual | Calendar renders as a full-screen overlay at 390 px viewport width |
| Visual | "Done" button is visible and fixed at the bottom of the overlay |
| Visual | Step label ("Select departure date" / "Select return date") is shown in the header |
| Journey | Tap departure trigger on mobile → pick date → calendar closes (one-way) |

---

### QML-022 — View Flight Search Results · ✅ Done

> As a passenger, I want to see a list of matching flights after searching so that I can compare options and choose one to book.

**Acceptance Criteria**

- **Given** valid search params are in the URL
  **When** the results page loads
  **Then** each flight card shows flight number, route, departure/arrival times, duration, available seats, and price
- **Given** the backend returns no flights for the search
  **When** the page loads
  **Then** an empty-state message is shown instead of a blank list
- **Given** the results page loads
  **When** I review the header
  **Then** a summary line confirms the route, date, passenger count, and cabin class I searched for

**Test Cases**

| Type | Case |
|---|---|
| Component | `FlightList` renders one card per flight in the array |
| Component | `FlightList` renders empty-state when the array is empty |
| Unit | `formatSearchSummary` returns the correct string for all input combinations |
| Unit | `buildApiUrl` produces the correct query string from search params |
| Unit | `sortFlights` orders flights by departure time ascending |

---

### QML-023 — Travelers & Class — Desktop · ✅ Done

> As a passenger on desktop, I want to adjust traveler count and cabin class directly in the search form header so that it does not interrupt my focus on the main search fields.

**Acceptance Criteria**

- **Given** I view the search form on desktop
  **When** the header row renders
  **Then** the traveler stepper (− count +) and cabin class chips (Economy / Business / First) appear inline to the right of the trip-type toggle, without a card border
- **Given** I click + or − on the stepper
  **When** the count changes
  **Then** the value updates immediately; − is disabled at 1 and + is disabled at 9
- **Given** I click a cabin class chip
  **When** the selection registers
  **Then** the tapped chip becomes selected and the others become unselected
- **Given** I hover over any chip or stepper button
  **When** the pointer enters
  **Then** the cursor changes to a pointer

**Test Cases**

| Type | Case |
|---|---|
| Visual | Inline variant renders without a card border or background on desktop |
| Component | `−` button is disabled and shows `cursor-default` when passenger count is 1 |
| Component | `+` button is disabled and shows `cursor-default` when passenger count is 9 |
| Component | Clicking a cabin chip marks it selected and deselects the previous selection |

---

### QML-024 — Travelers & Class — Mobile · ✅ Done

> As a passenger on mobile, I want to see and adjust traveler count and cabin class just below the date fields so that I can complete the search form in a natural top-to-bottom flow.

**Acceptance Criteria**

- **Given** I view the search form on mobile
  **When** the form renders
  **Then** a "Travelers & Class" label appears above the stepper and chips, positioned below the date pickers and above the Search button
- **Given** the mobile control renders
  **When** I review its appearance
  **Then** it is a flat row without a card border — the label and controls sit directly on the form background
- **Given** I interact with the stepper or chips
  **When** the value changes
  **Then** behavior is identical to desktop (same increments, same chip toggle)

**Test Cases**

| Type | Case |
|---|---|
| Visual | Label "Travelers & Class" is visible above the stepper row on mobile |
| Visual | No card border renders around the mobile control |
| Visual | Control appears below the date pickers in the stacked form layout |

---

### EPIC: Web — Booking Journey

---

### QML-025 — Create a Booking · ✅ Done

> As a passenger, I want to fill in my details and book a selected flight so that my seat is reserved and I receive a booking reference.

**Acceptance Criteria**

- **Given** I have selected a flight from the results
  **When** I open the booking form
  **Then** the selected flight details are displayed and I must enter first name, last name, email, and phone
- **Given** I submit the form with all valid fields
  **When** the booking API responds with success
  **Then** I am redirected to the confirmation page showing my PNR
- **Given** I submit the form with a required field missing
  **When** validation runs
  **Then** an inline error is shown for each missing field and the form is not submitted

**Test Cases**

| Type | Case |
|---|---|
| Component | Form shows validation error when first name, last name, or email is empty |
| Component | Successful submit navigates to `/bookings/confirmation` with the PNR in the URL |
| Component | Flight summary (number, route, departure time, price) is visible on the form |

---

### QML-026 — Booking Confirmation with Copy PNR · ✅ Done

> As a passenger, I want to see my booking reference prominently after booking so that I can save it for check-in and support queries.

**Acceptance Criteria**

- **Given** a booking was just confirmed
  **When** the confirmation page loads
  **Then** the 6-character PNR is displayed in a large monospace font under the "Booking Reference" label
- **Given** I tap the copy icon to the right of the PNR
  **When** the clipboard write succeeds
  **Then** the icon changes to a check mark for 2 seconds, then resets to the copy icon
- **Given** the confirmation page loads
  **When** I scroll through the summary card
  **Then** flight number, route, departure time, passenger name, email, and total paid are all visible

**Test Cases**

| Type | Case |
|---|---|
| Component | Copy icon appears to the right of the PNR value at the top of the PNR number |
| Component | Clicking the copy icon calls `navigator.clipboard.writeText` with the PNR string |
| Component | Icon reverts to `content_copy` after 2 seconds |
| Component | Booking summary renders correct values from URL search params |

---

### QML-027 — View My Bookings · ✅ Done

> As a passenger, I want to see all my bookings in one place so that I can track the status of each trip.

**Acceptance Criteria**

- **Given** I navigate to the Bookings tab
  **When** the page loads
  **Then** each booking card shows PNR, route, flight number, departure date, status badge (CONFIRMED / PENDING), and total amount
- **Given** I tap a booking card
  **When** the detail page opens
  **Then** full booking details are shown including passenger info, flight info, and payment status

**Test Cases**

| Type | Case |
|---|---|
| Component | CONFIRMED booking shows a green status badge |
| Component | PENDING booking shows an amber status badge |
| Component | Tapping a booking card navigates to `/bookings/[ref]` |

---

### QML-028 — Pay for a Booking · ✅ Done

> As a passenger, I want to pay for a pending booking so that my seat is confirmed and I receive payment proof.

**Acceptance Criteria**

- **Given** I have a PENDING booking
  **When** I open the payment page
  **Then** the booking reference and total amount due are shown before I enter card details
- **Given** I submit valid card details
  **When** the charge succeeds
  **Then** I see a success confirmation and the booking status updates to CONFIRMED

**Test Cases**

| Type | Case |
|---|---|
| Component | Payment form displays the total amount from the booking |
| Component | Success state is rendered after a successful API response |

---

### EPIC: Web — My Trips

---

### QML-029 — Online Check-in · ✅ Done

> As a passenger, I want to check in online before my flight so that I can skip the airport counter queue.

**Acceptance Criteria**

- **Given** I navigate to Check-in and enter my booking reference
  **When** a matching booking is found
  **Then** I can progress through: passenger confirmation → seat selection → review
- **Given** I enter a booking reference that does not exist
  **When** the lookup runs
  **Then** a not-found page tells me the reference is invalid

**Test Cases**

| Type | Case |
|---|---|
| Component | Not-found page renders when the booking ref is unknown |
| E2E | Full check-in flow from ref entry through review completes without errors |

---

### QML-030 — View Boarding Passes · ✅ Done

> As a passenger, I want to view my boarding pass on my phone so that I can present it at the gate without printing.

**Acceptance Criteria**

- **Given** I have a checked-in booking
  **When** I open the Passes tab
  **Then** a boarding pass card shows flight number, route, seat, passenger name, and departure time
- **Given** I tap a boarding pass card
  **When** the detail view opens
  **Then** a scannable QR code or barcode is displayed for gate scanning

**Test Cases**

| Type | Case |
|---|---|
| Component | Pass card renders all required boarding pass fields |
| Component | Pass detail view shows a scannable code element |

---

### EPIC: Web — Account & Profile

---

### QML-031 — Login & Registration · ✅ Done

> As a passenger, I want to create an account or log in so that my bookings are saved and accessible across sessions.

**Acceptance Criteria**

- **Given** I am a new user and complete the registration form
  **When** I submit valid name, email, and password
  **Then** a verification email is sent and I am prompted to confirm it
- **Given** I am a registered user and enter valid credentials
  **When** I submit the login form
  **Then** I am authenticated and redirected to the flight search page
- **Given** I forget my password and enter my email on the forgot-password page
  **When** I submit
  **Then** a reset link is sent to that address and a confirmation message is shown
- **Given** I enter an invalid email or a password that does not meet strength requirements
  **When** the form is submitted
  **Then** inline validation errors describe what needs to be corrected

**Test Cases**

| Type | Case |
|---|---|
| Component | Password strength indicator updates as the password is typed |
| Component | Register form shows inline error for an invalid email format |
| Component | Login form redirects to `/flights` after a successful submit |
| Component | Forgot-password form shows a confirmation message after submit |

---

### QML-032 — Manage Profile · ✅ Done

> As a passenger, I want to view and update my account details so that my personal information stays accurate.

**Acceptance Criteria**

- **Given** I open my profile
  **When** the page loads
  **Then** my name, email, phone, nationality, and passport details are shown; my initials appear as the avatar when no photo is uploaded
- **Given** I tap Edit and change a field
  **When** I save
  **Then** the updated value is persisted and reflected on the profile page
- **Given** I open Account Settings
  **When** the page loads
  **Then** I can manage notification preferences and linked payment methods

**Test Cases**

| Type | Case |
|---|---|
| Component | Profile page renders user initials when no profile photo is set |
| Component | Edit form pre-fills current profile values |
| Component | Saving calls the update API with only the changed fields |
| Component | Settings page renders notification preference toggles |

---

### EPIC: Web — Airport Selection

---

### QML-033 — Airport Select — Desktop Dropdown · ✅ Done

> As a passenger on desktop, I want to type and choose an airport from a dropdown so that I can quickly find the right origin or destination.

**Acceptance Criteria**

- **Given** I click the From or To field on desktop
  **When** the dropdown opens
  **Then** a "Popular Cities or Airports" list is shown before I type anything
- **Given** I type a city or airport name
  **When** results are filtered
  **Then** only matching airports are shown; non-matching airports disappear
- **Given** I have already selected Bangkok (BKK) as origin
  **When** I open the destination dropdown and search for Bangkok
  **Then** Bangkok does not appear — the already-selected airport is excluded
- **Given** I click outside the dropdown
  **When** the click registers
  **Then** the dropdown closes without selecting anything

**Test Cases**

| Type | Case |
|---|---|
| E2E | Opens dropdown showing popular cities list on click |
| E2E | Typing "Singapore" filters to Singapore Changi Airport only |
| E2E | Destination dropdown excludes the already-selected origin |
| E2E | Clicking outside the dropdown closes it |

---

### QML-034 — Airport Select — Mobile Bottom Sheet · ✅ Done

> As a passenger on mobile, I want airport selection to open as a bottom sheet so that the list is easy to scroll and tap on a small screen.

**Acceptance Criteria**

- **Given** I tap the From or To field on mobile
  **When** the bottom sheet opens
  **Then** it slides up with a drag handle, showing "Flying from" or "Flying to" as the header and a popular airports list
- **Given** the bottom sheet is open
  **When** I tap the backdrop behind the sheet
  **Then** the sheet closes without selecting an airport
- **Given** I select an airport from the sheet
  **When** the tap registers
  **Then** the sheet closes and the selected airport appears in the field

**Test Cases**

| Type | Case |
|---|---|
| E2E | Tapping From opens bottom sheet with "Flying from" header |
| E2E | Selecting an airport closes the sheet and populates the field |
| E2E | Tapping the backdrop closes the sheet with no selection |

---

### EPIC: Web — Discovery

---

### QML-035 — Popular Destinations & Travel Tips · ✅ Done

> As a passenger on the home page, I want to see popular destinations and a travel tip so that I can get inspiration and useful information before searching.

**Acceptance Criteria**

- **Given** I am on the flight search home page
  **When** the page loads
  **Then** a "Popular Destinations" section shows destination cards with name, starting price, and an optional trending badge
- **Given** I see the travel tip section
  **When** it renders
  **Then** one contextual tip is shown with an icon and short advisory text

**Test Cases**

| Type | Case |
|---|---|
| Component | Destination card renders name and starting price |
| Component | Trending badge appears on the designated card |
| Component | Travel tip renders with an icon and non-empty text |

---

### QML-036 — Check Flight Status · ✅ Done

> As a passenger, I want to look up a flight by number so that I can see whether it is on time, delayed, or cancelled.

**Acceptance Criteria**

- **Given** I navigate to the flight status page
  **When** the page loads
  **Then** I see a search field where I can enter a flight number
- **Given** I submit a valid flight number
  **When** the result loads
  **Then** the flight status (scheduled, delayed, cancelled) is shown alongside the route and times
- **Given** I submit a flight number that is not found
  **When** the lookup completes
  **Then** a clear not-found message is shown

**Test Cases**

| Type | Case |
|---|---|
| Component | Status page renders the flight number input |
| Component | Known flight number shows status, route, and departure/arrival times |
| Component | Unknown flight number shows a not-found message |

---

### QML-037 — View Travel Requirements · ✅ Done

> As a passenger, I want to see visa and health requirements for my trip so that I know what documents to prepare before flying.

**Acceptance Criteria**

- **Given** I navigate to the travel requirements page
  **When** the page loads
  **Then** a list of requirements is shown, each with a title, status (required / not required / check), and details
- **Given** a requirement has a reference link
  **When** I tap it
  **Then** I am taken to the relevant external resource

**Test Cases**

| Type | Case |
|---|---|
| Component | Requirements list renders with correct status badge for each item |
| Component | Items with a link render a tappable anchor |

---

### EPIC: Web — App Shell

---

### QML-038 — App Navigation · ✅ Done

> As a passenger, I want consistent navigation across the app so that I can move between sections without getting lost.

**Acceptance Criteria**

- **Given** I view any page on desktop
  **When** the header renders
  **Then** a sticky top app bar shows the Qoomlee logo and links to Search, Bookings, Check-in, and Passes; the current section is highlighted
- **Given** I view any page on mobile
  **When** the page renders
  **Then** a bottom navigation bar with Search, Bookings, Check-in, and Passes icons is fixed at the bottom of the screen
- **Given** I tap the menu icon on mobile
  **When** the tap registers
  **Then** I am taken to the support/settings page
- **Given** I tap the Qoomlee logo in the top bar
  **When** the navigation runs
  **Then** I am taken to the flight search page

**Test Cases**

| Type | Case |
|---|---|
| Component | Active nav item is highlighted based on the current route |
| Component | BottomNav renders four tab items with icons and labels |
| Component | Tapping the logo navigates to `/flights` |
| Visual | TopAppBar is sticky (remains visible on scroll) |

---

### EPIC: Platform Security (Cross-cutting)

---

### QML-039 — HTTP Security Headers — API Services · ✅ Done

> As a platform operator, I want every API response to include security headers so that browsers and proxies apply safe defaults for caching, content-type handling, and clickjacking protection.

**Acceptance Criteria**

- **Given** any HTTP response from qoomlee-service or payment-service
  **When** the response is received
  **Then** it includes `Cache-Control: no-store, no-cache, must-revalidate`
- **Given** any HTTP response from either service
  **When** the response is received
  **Then** it includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`
- **Given** the security header middleware is registered
  **When** the service starts
  **Then** the middleware is applied globally before any route handler

**Test Cases**

| Type | Case |
|---|---|
| Unit | Middleware sets all four headers on every response |
| Contract | `GET /health/live` response includes `X-Frame-Options: DENY` |
| Contract | `GET /api/flights/search` response includes `Cache-Control: no-store` |

---

### QML-040 — HTTP Security Headers — Web Frontend · ✅ Done

> As a platform operator, I want the Next.js web app to set a strict Content Security Policy and security headers so that it is protected against XSS, clickjacking, and MIME-type sniffing.

**Acceptance Criteria**

- **Given** any page response from the Next.js app
  **When** the browser receives it
  **Then** a `Content-Security-Policy` header restricts scripts, styles, fonts, images, and connections to trusted sources only
- **Given** the app runs in development
  **When** Turbopack hot-reload is active
  **Then** `unsafe-eval` is allowed in the CSP `script-src` directive but removed in production
- **Given** any page response from the Next.js app
  **When** the browser receives it
  **Then** `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` are present

**Test Cases**

| Type | Case |
|---|---|
| Unit | `next.config.ts` exports a `headers()` function that includes all required header keys |
| Contract | `GET /flights` response includes `Content-Security-Policy` header |
| Contract | `Content-Security-Policy` value contains `frame-ancestors 'none'` |
| Contract | Production CSP does not contain `unsafe-eval` |

---

### EPIC: Booking Expiry & Status (Cross-cutting)

> **Why**: `POST /api/bookings` already creates a `PENDING` row and decrements
> `flights.available_seats` immediately — the seat hold already exists in
> Postgres. The only thing missing is a server-side expiry: the 15-minute
> countdown on `/payment` is pure client state (`useState(900)`), so
> refreshing the page resets it and an abandoned booking holds its seat
> forever. These stories add a third booking status, `EXPIRED`, enforced via
> lazy expiry-on-read (no background sweeper), and wire `/bookings` to real
> data.

---

### QML-041 — Record Seat-Hold Expiry at Booking Creation · ⬜ Todo

> As the booking service, I want to record when a booking's seat hold expires so that the hold is not tied to client-side state.

**Acceptance Criteria**

- **Given** `infra/db/qoomlee/01_schema.sql`
  **When** the schema is applied
  **Then** `bookings` has a `NOT NULL` `expires_at TIMESTAMPTZ` column, a `NOT NULL` `user_sub VARCHAR(255)` column, and the `status` check constraint allows `PENDING`, `CONFIRMED`, and `EXPIRED`
- **Given** a valid booking request with an authenticated JWT
  **When** `POST /api/bookings` succeeds
  **Then** the new row stores `expires_at = created_at + 15 minutes` (the 15-minute hold duration is a named constant) and `user_sub` from the JWT `sub` claim
- **Given** a successful booking creation
  **When** the `201` response is returned
  **Then** it includes `expiresAt` as an RFC3339 timestamp
- **Given** `infra/db/qoomlee/02_seed.sql`
  **When** the database is seeded
  **Then** every seeded `PENDING` booking has a `user_sub` and an `expires_at` in the future, so seed data is not immediately treated as expired

**Test Cases**

| Type | Case |
|---|---|
| Positive | `POST /api/bookings` response includes `expiresAt` ≈ 15 minutes from now |
| Positive | the created `bookings` row has `user_sub` set to the caller's JWT `sub` |
| Unit | the `status` check constraint accepts `EXPIRED` |
| Normal | seeded `PENDING` bookings have `expires_at` in the future and a non-null `user_sub` |

---

### QML-042 — Lazily Expire Stale Pending Bookings on Read · ⬜ Todo

> As the booking service, when anything reads a `PENDING` booking past its `expires_at`, I want to flip it to `EXPIRED` and release the seat so abandoned holds don't block other passengers.

**Acceptance Criteria**

- **Given** a `PENDING` booking whose `expires_at` is in the past
  **When** `GET /api/bookings/:bookingRef` is called
  **Then** in one transaction the booking's status becomes `EXPIRED`, `flights.available_seats` for its flight is incremented by 1, and the response returns `status: "EXPIRED"`
- **Given** a `PENDING` booking whose `expires_at` is in the future
  **When** `GET /api/bookings/:bookingRef` is called
  **Then** the booking is returned unchanged, including `expiresAt`
- **Given** a booking that is already `EXPIRED`
  **When** `GET /api/bookings/:bookingRef` is called
  **Then** it is returned unchanged with no additional seat increment
- **Given** a booking that is `CONFIRMED`
  **When** `GET /api/bookings/:bookingRef` is called
  **Then** it is returned unchanged with no `expiresAt` field

**Test Cases**

| Type | Case |
|---|---|
| Positive | `GET` on an expired `PENDING` booking returns `EXPIRED` and increments `available_seats` by 1 |
| Positive | `GET` on a non-expired `PENDING` booking returns `PENDING` with `expiresAt` |
| Normal | `GET` on an already-`EXPIRED` booking does not increment `available_seats` again |
| Normal | `GET` on a `CONFIRMED` booking omits `expiresAt` |
| Negative | `GET /api/bookings/XXXXXX` still returns `404 BOOKING_NOT_FOUND` |

---

### QML-043 — Reject Confirmation & Charges for Expired Bookings · ⬜ Todo

> As the platform, I want a lapsed seat hold to never be confirmed or charged so that an expired booking cannot become a paid one.

**Acceptance Criteria**

- **Given** a booking that is (or, via the QML-042 lazy check, just became) `EXPIRED`
  **When** `PUT /api/bookings/:bookingRef/status` is called with `status: "CONFIRMED"`
  **Then** the service returns `409 {"error":"booking_expired"}` and does not change the booking's status
- **Given** a booking that is already `CONFIRMED`
  **When** `PUT /api/bookings/:bookingRef/status` is called again
  **Then** the service returns `409 {"error":"already_confirmed"}`
- **Given** payment-service's `BookingClient.GetBooking` fetches a booking with status `EXPIRED`
  **When** `payment.Service.Charge` evaluates it
  **Then** it returns a new `ErrBookingExpired`
- **Given** `POST /api/payments/charge` is called for an `EXPIRED` booking
  **When** the handler processes it
  **Then** it returns `409 {"error":"booking_expired"}` without calling Omise, alongside the existing `ErrAlreadyPaid` → `already_paid` mapping

**Test Cases**

| Type | Case |
|---|---|
| Negative | `PUT .../status` with `CONFIRMED` on an expired `PENDING` booking returns `409 booking_expired` |
| Negative | `PUT .../status` with `CONFIRMED` on a `CONFIRMED` booking returns `409 already_confirmed` |
| Negative | `POST /api/payments/charge` for an `EXPIRED` booking returns `409 booking_expired`, no Omise call made |
| Positive | `PUT .../status` with `CONFIRMED` on a non-expired `PENDING` booking still succeeds |

---

### QML-044 — Server-Derived Payment Countdown · ⬜ Todo

> As a passenger, I want the payment countdown to reflect my real server-side seat hold so that refreshing the page doesn't reset my time, and so I'm told clearly if my hold has expired.

**Acceptance Criteria**

- **Given** I create a booking on `/bookings/new`
  **When** `POST /api/bookings` succeeds
  **Then** the real `bookingRef` is passed to `/payment` as a query param, replacing the client-side `generateBookingRef()`
- **Given** `/payment` loads with a `bookingRef`
  **When** it calls `GET /api/bookings/:ref` and the booking is `PENDING` and not expired
  **Then** `secondsRemaining = max(0, expiresAt - now)` seeds the countdown, which still ticks down once per second client-side but is recomputed from `expiresAt` on every page load
- **Given** the fetched booking is `EXPIRED` (including a `PENDING` booking that this very `GET` lazily expired)
  **When** `/payment` renders
  **Then** it shows a "Your booking hold has expired" panel, hides the payment form, and links back to flight search — with no countdown
- **Given** the fetched booking is `CONFIRMED`
  **When** `/payment` loads
  **Then** it redirects immediately to `/bookings/confirmation?ref=...`
- **Given** the `bookingRef` query param is missing or `GET /api/bookings/:ref` returns `404`
  **When** `/payment` loads
  **Then** it redirects to `/bookings/new`

**Test Cases**

| Type | Case |
|---|---|
| Component | `/bookings/new` passes the real `bookingRef` to `/payment` |
| Component | countdown's initial value derives from `expiresAt`, not a hardcoded `900` |
| Component | `EXPIRED` booking renders the expired panel with no payment form |
| Component | `CONFIRMED` booking redirects to `/bookings/confirmation?ref=...` |
| Component | missing or `404` `bookingRef` redirects to `/bookings/new` |

---

### QML-045 — Handle Expiry Mid-Submit · ⬜ Todo

> As a passenger, if my seat hold expires in the moment I submit payment, I want a clear "hold expired" message instead of a generic payment failure.

**Acceptance Criteria**

- **Given** I submit the payment form
  **When** `POST /api/payments/charge` returns `409 booking_expired` (per QML-043)
  **Then** `/payment` shows the same "Your booking hold has expired" panel as QML-044, instead of a generic payment-failure message

**Test Cases**

| Type | Case |
|---|---|
| Component | `409 booking_expired` on submit renders the expired panel |
| Component | other payment errors (e.g. `402`) still show the generic failure message |

---

### QML-046 — "My Bookings" Backed by Real Data · ⬜ Todo

> As a passenger, I want to see all my bookings — including pending holds with their time remaining and expired holds — in one place, backed by real data.

**Acceptance Criteria**

- **Given** an authenticated passenger
  **When** `GET /api/bookings` is called
  **Then** it returns every booking whose `user_sub` matches the caller's JWT `sub`, each with `bookingRef`, `status` (`PENDING|CONFIRMED|EXPIRED`), `expiresAt` (present only when `PENDING`), route, flight number, departure date, passenger count, and total amount + currency — applying the same lazy-expiry transition as QML-042 to each row
- **Given** the `/bookings` page
  **When** it loads
  **Then** it fetches `GET /api/bookings` instead of `lib/booking/mock.ts`
- **Given** a booking's status
  **When** its card renders
  **Then** `CONFIRMED` shows a green "Confirmed" badge, `PENDING` shows an amber "Awaiting payment · expires in Xm" badge, and `EXPIRED` shows a grey "Expired" badge
- **Given** the caller has no bookings
  **When** `/bookings` loads
  **Then** an empty state ("No bookings yet") is shown
- **Given** the page is wired to the real endpoint
  **When** the migration is complete
  **Then** `lib/booking/mock.ts` and its usages are removed

**Test Cases**

| Type | Case |
|---|---|
| Positive | `GET /api/bookings` returns only the caller's own bookings |
| Positive | `PENDING` rows include `expiresAt`; `CONFIRMED`/`EXPIRED` rows omit it |
| Component | `PENDING` badge reads "Awaiting payment · expires in Xm" |
| Component | `EXPIRED` badge reads "Expired" in grey |
| Component | empty list shows "No bookings yet" |
| Negative | `lib/booking/mock.ts` is no longer referenced anywhere |

---

## Full Flow Acceptance Criteria

**End-to-End Journey Test**: As a passenger, I want to complete the full booking journey from searching flights to receiving payment confirmation so that I can successfully book a flight.

**Given** a passenger with a valid JWT token
**When** the passenger performs the complete booking journey:

1. Searches for flights from BKK to SIN on 2026-06-15
2. Views details of a specific flight (e.g., flight ID 1)
3. Creates a booking for that flight with valid passenger details
4. Receives a booking reference (PNR) and confirms the booking is in `PENDING` status
5. Obtains an Omise card token for a success card (4242...)
6. Charges the card for the booking using the correct amount
7. Verifies the booking status changes to `CONFIRMED`
8. Views the payment receipt to confirm successful payment

**Then** the entire journey completes successfully with:
- Appropriate HTTP status codes at each step (200, 201)
- Correct data persisted in respective databases
- Proper error handling for invalid inputs
- Secure authentication maintained throughout
- Accurate seat availability updated

**Full Flow Test Cases**

| Type | Case |
|---|---|
| Positive | Complete journey from flight search to payment confirmation executes without errors |
| Verification | Booking shows `CONFIRMED` status with payment traceability |
| Verification | Flight seat availability decreases by 1 |
| Negative | Interruption at any step does not corrupt data integrity |

---

### QML-011 — Internal Token Guard Middleware · ⬜ Todo

> As a system, I want the internal status-update endpoint to accept only calls from payment-service using a shared secret so that no external caller can arbitrarily confirm a booking without payment.

**Acceptance Criteria**

- **Given** a request with a correct `X-Internal-Token` header
  **When** `PUT /api/bookings/:bookingRef/status` is called
  **Then** the request is processed normally (no JWT required)
- **Given** a request with a missing `X-Internal-Token` header
  **When** `PUT /api/bookings/:bookingRef/status` is called
  **Then** the service returns `403` with `{ "error": "FORBIDDEN", "message": "internal token required" }`
- **Given** a request with an incorrect token value
  **When** `PUT /api/bookings/:bookingRef/status` is called
  **Then** the service returns `403 FORBIDDEN`
- **Given** the token comparison is implemented
  **Then** `crypto/subtle.ConstantTimeCompare` must be used to prevent timing attacks — never use `==`
- **Given** `INTERNAL_TOKEN` env var is empty or absent at startup
  **When** the service starts
  **Then** the service refuses to start (`os.Exit(1)`)
- **Given** payment-service makes its internal callback
  **Then** it must set `X-Internal-Token` from its own `INTERNAL_TOKEN` env var — both services share the same secret value

**Technical Notes**

- Middleware is wired only on `PUT /api/bookings/:bookingRef/status` — not on the `/api` group.
- `INTERNAL_TOKEN` must be a high-entropy random value — generate with `openssl rand -hex 32`.
- `crypto/subtle.ConstantTimeCompare` prevents timing side-channel attacks where an attacker could guess the token byte-by-byte by measuring response latency.

```go
import "crypto/subtle"

func InternalTokenMiddleware(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        got := c.GetHeader("X-Internal-Token")
        if subtle.ConstantTimeCompare([]byte(got), []byte(secret)) != 1 {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
                "error": "FORBIDDEN", "message": "internal token required",
            })
            return
        }
        c.Next()
    }
}
```

**Test Cases**

| Layer | Type | Case |
|---|---|---|
| Unit | Positive | Correct `X-Internal-Token` → handler invoked |
| Unit | Negative | Missing header → 403 |
| Unit | Negative | Wrong token value → 403 |
| Contract | Positive | `PUT /api/bookings/SEED02/status` with valid token → 200 |
| Contract | Negative | `PUT /api/bookings/SEED01/status` without token → 403 |

---

### QML-012 — Rate Limiting · ⬜ Todo

> As a platform operator, I want per-IP rate limits on all endpoints so that no single client can exhaust server resources or disrupt other passengers.

**Acceptance Criteria**

- **Given** a single IP exceeds **10 requests/min** on `POST /api/payments/charge`
  **When** the 11th request arrives
  **Then** the service returns `429` with `{ "error": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please try again later." }`
- **Given** a single IP exceeds **30 requests/min** on `POST /api/bookings`
  **When** the 31st request arrives
  **Then** the service returns `429 RATE_LIMIT_EXCEEDED`
- **Given** a single IP exceeds **100 requests/min** on `GET /api/flights/search`
  **When** the 101st request arrives
  **Then** the service returns `429 RATE_LIMIT_EXCEEDED`
- **Given** a single IP exceeds **30 requests/min** on `GET /health/live` or `GET /health/ready`
  **When** the 31st request arrives
  **Then** the service returns `429 RATE_LIMIT_EXCEEDED` — health endpoints are unauthenticated and must be rate-limited to prevent DDoS
- **Given** different IPs send requests simultaneously
  **Then** limits are applied per-IP independently — one client's quota does not affect others

**Rate Limit Table**

| Endpoint | Requests/min | Burst | Reason |
|---|---|---|---|
| `GET /api/flights/search` | 100 | 20 | High-volume read |
| `POST /api/bookings` | 30 | 5 | Write operation |
| `POST /api/payments/charge` | 10 | 3 | Sensitive financial endpoint |
| `GET /health/live` | 30 | 10 | Unauthenticated — DDoS protection |
| `GET /health/ready` | 30 | 10 | Unauthenticated — DDoS protection |

**Technical Notes**

- Use `golang.org/x/time/rate` with an in-memory map keyed by `c.ClientIP()`.
- Rate limit middleware must be registered before JWT middleware so that rate-limited health requests never reach auth checks.
- Per-IP, not global — a single heavy client must not starve others.

**Test Cases**

| Layer | Type | Case |
|---|---|---|
| Unit | Positive | Requests within window → pass through |
| Unit | Negative | 11th request on payment endpoint within window → 429 |
| Unit | Positive | Two different IPs: each gets full quota independently |
| Unit | Positive | Counter resets after window expires |
| Contract | Negative | Burst `POST /api/bookings` >30 times → 429 |
| K6 | Positive | `search.js` at 50 VUs produces some 429 responses confirming middleware is active |

---

### QML-013 — Passenger Email Validation · ⬜ Todo

> As a passenger, I want the system to reject bookings with a malformed email address so that my booking data is correct and confirmation emails are deliverable.

**Acceptance Criteria**

- **Given** a `POST /api/bookings` request with a well-formed email (e.g. `"user@example.com"`)
  **When** the booking is created
  **Then** the system accepts the request and returns `201`
- **Given** a `POST /api/bookings` request with a malformed email (e.g. `"notanemail"`, `"@"`)
  **When** the booking is submitted
  **Then** the system returns `400` with `{ "error": "INVALID_FIELD", "message": "passenger email must be a valid email address" }`
- **Given** a `POST /api/bookings` request with an email missing the domain (e.g. `"user@"`)
  **When** the booking is submitted
  **Then** the system returns `400 INVALID_FIELD`
- **Given** a `POST /api/bookings` request with an email missing the local part (e.g. `"@example.com"`)
  **When** the booking is submitted
  **Then** the system returns `400 INVALID_FIELD`
- **Given** a `POST /api/bookings` request with an empty email
  **When** the booking is submitted
  **Then** the system returns `400 MISSING_REQUIRED_FIELD` (existing check — not changed)

**Technical Notes**

- Validation belongs in `booking/create_handler.go`, after the existing non-empty field check.
- Use `net/mail.ParseAddress()` from the standard library — no external dependency needed:

```go
if _, err := mail.ParseAddress(req.Passenger.Email); err != nil {
    c.JSON(http.StatusBadRequest, apiErr("INVALID_FIELD", "passenger email must be a valid email address"))
    return
}
```

- Do not add validation in the service or repository layer — this is a boundary concern (user input).

**Test Cases**

| Layer | Type | Case |
|---|---|---|
| Unit | Positive | `"user@example.com"` → passes validation, booking created |
| Unit | Negative | `"notanemail"` → 400 INVALID_FIELD |
| Unit | Negative | `"@"` → 400 INVALID_FIELD |
| Unit | Negative | `"user@"` → 400 INVALID_FIELD |
| Unit | Negative | `""` (empty) → 400 MISSING_REQUIRED_FIELD (existing check) |

---

### QML-014 — Request Correlation ID · ⬜ Todo

> As an operator debugging a production incident, I want every log line to carry a unique request ID that also appears in the HTTP response so that I can correlate client-reported errors with server logs in seconds.

**Acceptance Criteria**

- **Given** any inbound HTTP request without an `X-Request-ID` header
  **When** the request is received
  **Then** a unique UUID v4 is generated and attached to the request context
- **Given** a client sends an `X-Request-ID` header
  **When** the request is received
  **Then** the client-supplied value is used instead of generating a new one (allows end-to-end tracing)
- **Given** any request that produces a log entry
  **Then** every `slog` call in that request's lifecycle includes `"requestId"` as a structured field
- **Given** any HTTP response
  **Then** the `X-Request-ID` header is set on the response so the client can report it in bug reports
- **Given** an error response (4xx or 5xx)
  **Then** the log entry includes `"requestId"`, relevant domain fields (e.g. `"bookingRef"`, `"flightId"`), and `"err"`

**Technical Notes**

- Implement as a Gin middleware registered before all other middleware:

```go
func RequestIDMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.GetHeader("X-Request-ID")
        if id == "" {
            id = uuid.New().String()
        }
        c.Set("requestId", id)
        c.Header("X-Request-ID", id)
        c.Next()
    }
}
```

- Extract in handlers via `c.GetString("requestId")` and pass to `slog` calls:

```go
slog.Error("create booking failed", "requestId", c.GetString("requestId"), "err", err)
```

**Test Cases**

| Layer | Type | Case |
|---|---|---|
| Unit | Positive | Request with no `X-Request-ID` → response has a generated UUID header |
| Unit | Positive | Request with `X-Request-ID: abc-123` → response echoes same value |
| Unit | Positive | Error handler log includes `"requestId"` field |

---

### QML-015 — Structured Request Logging · ⬜ Todo

> As an operator, I want every HTTP request logged as a structured JSON line with method, path, status code, and latency so that log aggregators can query and alert on latency regressions and error rates.

**Acceptance Criteria**

- **Given** any HTTP request completes
  **Then** a single JSON log line is emitted to stderr with at minimum:
  ```json
  { "level": "INFO", "msg": "request", "method": "GET", "path": "/api/flights/search", "status": 200, "latency_ms": 12, "requestId": "..." }
  ```
- **Given** `gin.Default()` is currently used
  **Then** it must be replaced with `gin.New()` — the built-in text logger is removed
- **Given** the response status is 5xx
  **Then** the log level is `ERROR`; for 4xx it is `WARN`; for 2xx/3xx it is `INFO`
- **Given** a handler panics
  **Then** `gin.Recovery()` catches it, logs the panic with `slog.Error`, and returns `500`

**Technical Notes**

- Switch `cmd/main.go` from `gin.Default()` to `gin.New()` with explicit middleware registration order:

```go
r := gin.New()
r.Use(gin.Recovery())
r.Use(RequestIDMiddleware())   // must run first — provides requestId to logger
r.Use(RequestLoggerMiddleware())
r.Use(RateLimitMiddleware())
// JWT middleware on /api group only
```

- Logger middleware must call `c.Next()` before reading status and latency:

```go
func RequestLoggerMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        latency := time.Since(start).Milliseconds()
        level := slog.LevelInfo
        if c.Writer.Status() >= 500 {
            level = slog.LevelError
        } else if c.Writer.Status() >= 400 {
            level = slog.LevelWarn
        }
        slog.Log(context.Background(), level, "request",
            "method", c.Request.Method,
            "path", c.FullPath(),
            "status", c.Writer.Status(),
            "latency_ms", latency,
            "requestId", c.GetString("requestId"),
        )
    }
}
```

- `slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))` is already in `main.go` — keep it.

**Test Cases**

| Layer | Type | Case |
|---|---|---|
| Unit | Positive | 200 response → log level INFO with `method`, `path`, `status`, `latency_ms` fields |
| Unit | Positive | 500 response → log level ERROR |
| Unit | Positive | 400 response → log level WARN |
| Unit | Positive | `latency_ms` is a non-negative integer |
| Manual | Positive | `docker compose up`, run any curl → log line contains `"latency_ms"` key in JSON output |

---

## What's Provided

| Provided | Location | Purpose |
|---|---|---|
| Booking DB schema | `infra/db/qoomlee/01_schema.sql` | Table definitions for qoomlee-service |
| Payment DB schema | `infra/db/qoomlee-payment/01_schema.sql` | Table definitions for payment-service |
| Booking DB seed | `infra/db/qoomlee/02_seed.sql` | Flights, passengers, bookings |
| Payment DB seed | `infra/db/qoomlee-payment/02_seed.sql` | Payments |
| API specifications | `API_SPECS.md` | Exact request/response shape for every endpoint |
| Docker Compose | `docker-compose.yml` | Spins up 2 postgres instances + both services |
| Test scripts | `scripts/`, `tests/k6/` | Smoke, contract, and load tests |

You are **not** given any working business logic. Build everything from scratch.

**Feel free to edit anything to make it serve the business requirements.**

---

## What You Build

### API Endpoints (all 7)

```
qoomlee-service  :8082
  GET  /api/flights/search              Search flights by route + date
  GET  /api/flights/:id                 View a single flight's details
  POST /api/bookings                    Create a booking, receive a 6-char PNR
  GET  /api/bookings/:bookingRef        View booking + passenger + flight info
  PUT  /api/bookings/:bookingRef/status Internal: flip status PENDING→CONFIRMED

payment-service  :8084
  POST /api/payments/charge             Charge a card via Omise
  GET  /api/payments/:bookingRef        View payment receipt
```

### Infrastructure & Security (all 6)

```
Both services    GET /health/live              Liveness probe  — always 200 (no auth)
Both services    GET /health/ready             Readiness probe — 503 when DB is down (no auth)
Both services    Rate limiting                 Per-IP limits on sensitive endpoints
Both services    Graceful shutdown             Drain connections on SIGTERM (10 s)
Both services    Structured logging            JSON logs via slog
Both services    JWT RS256 (public API)        Authorization: Bearer on every /api/* endpoint
qoomlee-service  X-Internal-Token (`PUT /api/bookings/:ref/status`) 256-bit shared secret, no JWT on this route
```

---

## Team Setup

| | Team A | Team B |
|---|---|---|
| Approach | May create and use any `.md` skill files | Single code agent only — no skill files |
| Starting point | This skeleton (identical) | This skeleton (identical) |
| Time limit | 2 hours | 2 hours |

---

## Start Here

```bash
# 1. Get free Omise test keys
#    → https://dashboard.omise.co → sign up → API Keys → Test keys
#    Copy:  pkey_test_...   and   skey_test_...

# 2. Copy the environment template and fill in your keys
cp .env.example .env
# Edit .env:
#   - Set OMISE_PUBLIC_KEY and OMISE_SECRET_KEY
#   - Set INTERNAL_TOKEN to a random secret (e.g. openssl rand -hex 16)
#   - JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are pre-filled with test keys — leave as-is for testing

# 3. Start the stack
docker compose up --build

# 4. Get a JWT and verify the stack is up
make jwt-token     # prints a Bearer token — save it as TOKEN=...
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8082/api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1"
# Expected before implementation: HTTP 501
# Expected after implementation:  HTTP 200 with flights array
```

---

## Technology Stack

| Service | Language | Framework | Port |
|---|---|---|---|
| qoomlee-service | Go | Gin | 8082 |
| payment-service | Go | Gin + Omise SDK | 8084 |
| postgres-qoomlee | — | PostgreSQL 16 | 5433 (host) |
| postgres-qoomlee-payment | — | PostgreSQL 16 | 5434 (host) |

- **Unit tests:** `go test ./...` with `testify` + `testify/mock`
- **Integration tests:** `testcontainers-go` (real PostgreSQL container)
- **Load tests:** K6

---

## Service Architecture

Both Go services can follow a domain-oriented structure for better locality, encapsulation, and maintainability:

```
Domain Folder (e.g. flight/, booking/, payment/)
├── handler.go      — HTTP handlers for this domain
├── service.go      — business logic for this domain
├── repository.go   — database queries for this domain
└── models.go       — data structures for this domain
```

**Benefits of domain-oriented organization:**

- **Locality**: Related code (handlers, services, repositories) lives together
- **Encapsulation**: Each domain is self-contained with clear boundaries
- **Deletability**: Entire domains can be removed without affecting others
- **Onboarding**: New developers can focus on one domain at a time
- **Testability**: Each domain can be tested independently

Alternative three-layer pattern (by layer):

```
Layered approach:
├── handler/        — all HTTP handlers
├── service/        — all business logic
└── repository/     — all database queries
```

The domain-oriented approach is suggested but not required. Choose the structure that best fits your team's preferences and the problem complexity.

---

## The Database

Two isolated PostgreSQL databases — one per service. **Do not modify the schema or seed data.**

- **`postgres-qoomlee`** — owned by qoomlee-service. Holds `aircraft_types`, `routes`, `flights`, `seats`, `passengers`, `bookings`.
- **`postgres-qoomlee-payment`** — owned by payment-service. Holds `payments` only.

`payments.booking_id` and `bookings.confirmed_payment_id` are logical cross-DB references (plain `INT` columns, no FK constraints). Consistency is maintained at the application layer: payment-service calls `GET /api/bookings/:ref` before charging and `PUT /api/bookings/:ref/status` after a successful charge. It **never** queries the booking database directly.

### Seed Flights

**2026-06-15 — primary test date (use for all booking and payment tests)**

| DB id | Flight | Route | Departure (BKK local, UTC+7) | `basePriceMinor` (satang) | `currency` | `basePrice` (string) | Seats | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | QM101 | BKK → SIN | 08:00 | 350000 | THB | "3500.00" | 154 | 2 seats held by pre-seeded bookings |
| 2 | QM102 | BKK → SIN | 14:00 | 280000 | THB | "2800.00" | 30 | |
| 3 | SC201 | BKK → SIN | 10:00 | 220000 | THB | "2200.00" | 78 | |
| 4 | QM201 | BKK → HKG | 07:30 | 450000 | THB | "4500.00" | 200 | |
| 5 | QM301 | BKK → NRT | 23:55 | 980000 | THB | "9800.00" | 150 | Overnight — arrives 2026-06-16 |
| 6 | QM999 | BKK → SIN | 22:00 | 350000 | THB | "3500.00" | **0** | **SOLD OUT** — trigger `NO_SEATS_AVAILABLE` |
| 7 | QM401 | BKK → KUL | 06:15 | 129000 | THB | "1290.00" | 138 | 2 seats held by pre-seeded bookings |
| 8 | QM402 | BKK → KUL | 17:30 | 185000 | THB | "1850.00" | **12** | **Nearly full** — use for low-seats concurrent test |
| 9 | QM501 | BKK → CGK | 08:00 | 289000 | THB | "2890.00" | 179 | 1 seat held by pre-seeded booking |
| 10 | QM601 | BKK → MNL | 07:00 | 320000 | THB | "3200.00" | 249 | 1 seat held by pre-seeded booking |

**2026-06-16 — next-day flights (use to verify date filtering)**

| DB id | Flight | Route | Departure (BKK local, UTC+7) | `basePriceMinor` (satang) | `currency` | `basePrice` (string) | Seats | Notes |
|---|---|---|---|---|---|---|---|---|
| 11 | QM103 | BKK → SIN | 09:00 | 310000 | THB | "3100.00" | 160 | Must appear in `date=2026-06-16` search; must **not** appear in `date=2026-06-15` search |
| 12 | QM202 | BKK → HKG | 11:00 | 490000 | THB | "4900.00" | 200 | Must appear in `date=2026-06-16` search; must **not** appear in `date=2026-06-15` search |

> **QM999 will not appear in search results** (`available_seats=0` is filtered out) but can be targeted by `POST /api/bookings` to trigger a 409.

> Departure times are stored as `TIMESTAMPTZ` in UTC: 08:00 BKK (UTC+7) = 01:00 UTC.

### Pre-seeded Test Bookings and Payments

These records are ready-made in the DB from `02_seed.sql`. Use them in integration and contract tests to avoid building state from scratch.

**Bookings**

| booking_ref | Flight | Passenger | Status | `totalAmountMinor` | `currency` | `totalAmount` | Use for |
|---|---|---|---|---|---|---|---|
| `SEED01` | QM101 | Seed User | `CONFIRMED` | 350000 | THB | "3500.00" | Duplicate-payment guard — `POST /api/payments/charge` must return **409 `ALREADY_PAID`** |
| `SEED02` | QM101 | Seed User | `PENDING` | 350000 | THB | "3500.00" | Read tests — `GET /api/bookings/SEED02` returns 200 with nested flight + passenger |
| `MNKP23` | QM401 (BKK→KUL) | Wanchai Srisuk | `CONFIRMED` | 129000 | THB | "1290.00" | Multi-route confirmed booking reads; traceability check |
| `AKVWQ4` | QM501 (BKK→CGK) | Akira Tanaka | `CONFIRMED` | 289000 | THB | "2890.00" | Foreign-passenger confirmed booking reads |
| `NRPQ56` | QM401 (BKK→KUL) | Narumon Pattanakit | `PENDING` | 129000 | THB | "1290.00" | **Retry-payment test** — has a prior `FAILED` payment; charge again with success card |
| `FMXB89` | QM601 (BKK→MNL) | Ahmad Fauzi | `PENDING` | 320000 | THB | "3200.00" | **First-charge flow** — no prior payment attempt |

**Payments**

| booking_ref | Payment status | `amountMinor` | `currency` | `amount` | paymentProvider | providerChargeId | Use for |
|---|---|---|---|---|---|---|---|
| `SEED01` | `SUCCEEDED` | 350000 | THB | "3500.00" | `OMISE` | `chrg_test_5xkm2r9p8wqv3ntzy7au` | `GET /api/payments/SEED01` returns `status: "SUCCEEDED"` |
| `SEED02` | `FAILED` | 350000 | THB | "3500.00" | `OMISE` | `chrg_test_8jqw4n7k2xpm5vtzy1ar` | `GET /api/payments/SEED02` returns `status: "FAILED"`, `failureCode: "insufficient_fund"` |
| `MNKP23` | `SUCCEEDED` | 129000 | THB | "1290.00" | `OMISE` | `chrg_test_3aw9m6k5xpqr2nvtz8yu` | Read test for KUL route confirmed payment |
| `AKVWQ4` | `SUCCEEDED` | 289000 | THB | "2890.00" | `OMISE` | `chrg_test_7pn4w2m9xkqr6vtzy3au` | Read test for CGK route confirmed payment |
| `NRPQ56` | `FAILED` | 129000 | THB | "1290.00" | `OMISE` | `chrg_test_2mk8p3n7xwqr5vtzy9au` | Booking stays `PENDING`; use `NRPQ56` to retry with success card |

> **For unknown-ref tests** use any ref that doesn't exist, e.g. `XXXXXX` → must return 404.

### Key Tables

```
flights    — id, flight_number, route_id, departure_time, arrival_time,
             base_price_minor (BIGINT, satang), available_seats, status, currency
routes     — id, origin_iata, destination_iata
bookings   — id, booking_ref (6-char PNR), flight_id, passenger_id,
             status (PENDING|CONFIRMED), confirmed_payment_id (INT, logical ref to payment DB),
             total_amount_minor (BIGINT, satang), currency
passengers — id, first_name, last_name, email, phone,
             passport_number, date_of_birth, nationality
payments   — id, booking_ref, booking_id, payment_provider (OMISE|2C2P|…),
             provider_charge_id, amount_minor (BIGINT, satang), currency, status,
             failure_code, failure_message, paid_at
```

> **Monetary convention:** ALL money columns are BIGINT minor units (satang).
> 3,500 THB → stored as 350000. No NUMERIC/DECIMAL anywhere.
> Every monetary field in API requests and responses is a triple: `*Minor` (int64 satang), `currency`, and `*` (formatted display string, e.g. `"3500.00"`).
> Handlers compute `int64 ÷ 100` to produce the display string. Never use floats for money.

- Booking DB schema: `infra/db/qoomlee/01_schema.sql` — Seed: `infra/db/qoomlee/02_seed.sql`
- Payment DB schema: `infra/db/qoomlee-payment/01_schema.sql` — Seed: `infra/db/qoomlee-payment/02_seed.sql`

---

## How the Endpoints Connect

The 7 endpoints form a single flow. Implement them in this order:

```
Step 1 ── GET  /api/flights/search
           Search by origin, destination, date, passengers.
           Returns a list of matching flights.

Step 2 ── GET  /api/flights/:id
           Fetch one flight by its DB id.
           Client uses this to confirm details before booking.

Step 3 ── POST /api/bookings
           Create a booking for one passenger on one flight.
           Decrements available_seats inside a transaction.
           Returns a 6-char PNR (e.g. "QM7X2K") and a numeric bookingId.

Step 4 ── POST /api/payments/charge          ← needs an Omise token first (see below)
           Charge the card via Omise.
           On success: records SUCCEEDED payment, then calls Step 5 internally.
           On decline: records FAILED payment, returns 402. Booking stays PENDING.

Step 5 ── PUT  /api/bookings/:bookingRef/status    ← called by payment-service, not client
           Flip booking status from PENDING → CONFIRMED.
           Only called after a successful Omise charge.

Step 6 ── GET  /api/bookings/:bookingRef
           Returns the full booking with nested flight + passenger objects.
           Status should be CONFIRMED after a successful payment.

Step 7 ── GET  /api/payments/:bookingRef
           Returns the payment receipt with paymentProvider, providerChargeId, amount, paidAt.
```

---

## Endpoint Specifications

See `API_SPECS.md` for the complete request/response reference for every endpoint.
Below are the key implementation notes for each.

---

### 1. `GET /api/flights/search`

- **File:** `services/qoomlee/flight/handler.go` → `Search`
- **Repo:** `services/qoomlee/flight/repository.go` → `Search`

Query parameters: `origin`, `destination`, `date` (YYYY-MM-DD), `passengers` (default 1).

SQL to implement:

```sql
SELECT f.id, f.flight_number,
       r.origin_iata, r.destination_iata,
       f.departure_time, f.arrival_time,
       f.status, f.base_price_minor, f.currency, f.available_seats
FROM flights f
JOIN routes r ON r.id = f.route_id
WHERE r.origin_iata      = $1
  AND r.destination_iata = $2
  AND f.departure_time  >= $3        -- start of date (UTC)
  AND f.departure_time   < $4        -- end of date (UTC)
  AND f.available_seats >= $5
  AND f.status           = 'SCHEDULED'
ORDER BY f.departure_time
```

Compute `durationMinutes` from `arrival_time - departure_time` in Go.

---

### 2. `GET /api/flights/:id`

- **File:** `services/qoomlee/flight/handler.go` → `GetByID`
- **Repo:** `services/qoomlee/flight/repository.go` → `GetByID`

Same columns as search. If no row found, return `404 FLIGHT_NOT_FOUND`.

---

### 3. `POST /api/bookings`

- **File:** `services/qoomlee/booking/handler.go` → `Create`
- **Repo:** `services/qoomlee/booking/repository.go` → `InsertPassenger`, `InsertBooking`

Three steps in **one transaction** — use `SELECT … FOR UPDATE` to prevent overbooking under concurrent load:

```sql
BEGIN;

-- Step 1: lock the flight row and read current seat count
SELECT available_seats FROM flights WHERE id = $1 FOR UPDATE;
-- If available_seats = 0 → ROLLBACK and return 409 NO_SEATS_AVAILABLE

-- Step 2: insert passenger
INSERT INTO passengers (first_name, last_name, email, ...) RETURNING id;

-- Step 3: insert booking with total_amount_minor (copy from flights.base_price_minor)
INSERT INTO bookings (booking_ref, flight_id, passenger_id, total_amount_minor, currency, ...)
VALUES ($1, $2, $3, $4, $5, ...);

-- Step 4: decrement seat counter
UPDATE flights SET available_seats = available_seats - 1 WHERE id = $1;

COMMIT;
```

> `total_amount_minor` must be copied from `flights.base_price_minor` at booking time — it's the price the passenger agreed to pay. Storing it on the booking prevents price-change issues later.

Generate the 6-char PNR in Go before the transaction:

```go
const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
// Pick 6 random characters from chars
```

---

### 4. `POST /api/payments/charge`

- **File:** `services/payment/payment/handler.go` → `Charge`
- **Repo:** `services/payment/payment/repository.go` → `Insert`

#### How Omise Works (credit card, synchronous)

Omise credit card charges return the **final result immediately** — no webhook, no callback URL needed. This is why we scope to credit card only.

```
Client                         Your server                    Omise
  │                                │                             │
  │── POST /api/payments/charge ──►│                             │
  │   { omiseToken, amount, ... }  │── CreateCharge ────────────►│
  │                                │◄── charge.Status (sync) ───│
  │                                │   "successful" or "failed"  │
  │◄── 201 or 402 ─────────────────│                             │
```

#### Getting an Omise Token

The client must first call Omise's vault to tokenise the card. The token is single-use.

```bash
curl https://vault.omise.co/tokens \
  -u YOUR_OMISE_PUBLIC_KEY: \
  -d "card[number]=4242424242424242" \
  -d "card[expiration_month]=12" \
  -d "card[expiration_year]=2028" \
  -d "card[security_code]=123" \
  -d "card[name]=SOMCHAI JAIDEE"
# Response: { "id": "tokn_test_xxxx", ... }
```

#### Using the Omise Go SDK

```go
import (
    omise "github.com/omise/omise-go"
    "github.com/omise/omise-go/operations"
)

client, _ := omise.NewClient(
    os.Getenv("OMISE_PUBLIC_KEY"),
    os.Getenv("OMISE_SECRET_KEY"),
)

charge := &omise.Charge{}
err := client.Do(charge, &operations.CreateCharge{
    Amount:   req.Amount,   // in satang — see note below
    Currency: "THB",
    Card:     req.OmiseToken,
})

// err != nil            → network/auth error → status = "FAILED"
// charge.Status == "successful" → status = "SUCCEEDED", paidAt = now
// charge.Status == "failed"     → status = "FAILED", check charge.FailureCode
```

#### Amount Validation — Guard Against Mismatch

Before calling Omise, payment-service must fetch the booking and validate:

```go
if req.AmountMinor != booking.TotalAmountMinor || req.Currency != booking.Currency {
    c.JSON(400, gin.H{"error": "AMOUNT_MISMATCH",
        "message": "amount or currency does not match the booking"})
    return
}
```

This prevents a client from submitting a lower amount than the booking price.
`request.amount_minor` and `payments.amount_minor` are satang (BIGINT). `3,500 THB → 350000`.
**Do not accept NUMERIC/float for amounts anywhere in the codebase.**

#### After a Successful Charge

Call `PUT http://qoomlee-service:8082/api/bookings/{bookingRef}/status` with:

```json
{
  "status":            "CONFIRMED",
  "paymentId":         <id of the payments row just inserted>,
  "paymentProvider":   "OMISE",
  "providerChargeId":  <charge.ID from Omise response>
}
```

- Use `QOOMLEE_SERVICE_URL` env var (already set in docker-compose).
- Include the `X-Internal-Token: <INTERNAL_TOKEN>` header (qoomlee-service will reject the call without it).
- Do **not** send a JWT — this is a service-to-service call, not a user request.
- `paymentProvider` and `providerChargeId` are stored directly in the bookings row. `GET /api/bookings/:ref` returns them without any JOIN (the payment DB is not accessible from qoomlee-service).
- If this call fails: **do not return 500**. Log it and return 201 anyway — the charge already succeeded.

#### Guard: Reject Duplicate Payment

Before calling Omise, call `GET http://qoomlee-service:8082/api/bookings/{bookingRef}` (use `QOOMLEE_SERVICE_URL` env var). If booking `status == "CONFIRMED"`, return `409 ALREADY_PAID` without calling Omise.

This API call also validates the amount: compare `req.AmountMinor` against `booking.TotalAmountMinor` and `req.Currency` against `booking.Currency` before charging.

#### Test Cards

| Card number | Result | failureCode |
|---|---|---|
| `4242 4242 4242 4242` | Success | — |
| `4111 1111 1111 1111` | Decline | `insufficient_fund` |

Use any future expiry (e.g. `12/2028`), any 3-digit CVV, any cardholder name.

---

### 5. `PUT /api/bookings/:bookingRef/status`

- **File:** `services/qoomlee/booking/handler.go` → `UpdateStatus`
- **Repo:** `services/qoomlee/booking/repository.go` → `UpdateStatus`

Called **only by payment-service** after a successful charge. Not a public endpoint.

This route is **excluded from the JWT middleware** — there is no user to authenticate. Guard it with the `X-Internal-Token` middleware only:

```
X-Internal-Token: <INTERNAL_TOKEN env var>
```

Return `403` if the header is missing or wrong. No `401` on this route.

```sql
UPDATE bookings
SET status               = $1,
    confirmed_payment_id = $2,
    payment_provider     = $3,
    provider_charge_id   = $4,
    updated_at           = NOW()
WHERE booking_ref = $5
```

Only `CONFIRMED` is a valid value in this challenge. Return `400 INVALID_STATUS` for anything else.
If the booking_ref doesn't exist, return `404 BOOKING_NOT_FOUND`.

> Because payment-service has its own database, qoomlee-service cannot JOIN payments at read time. Instead, `PUT /api/bookings/:ref/status` must receive `paymentProvider` and `providerChargeId` in the request body and store them in the bookings row. `GET /api/bookings/:ref` returns these values directly without any JOIN.

---

### 6. `GET /api/bookings/:bookingRef`

- **File:** `services/qoomlee/booking/handler.go` → `GetByRef`
- **Repo:** `services/qoomlee/booking/repository.go` → `GetByRef`

Join bookings → passengers, flights → routes. `paymentProvider` and `providerChargeId` are stored directly on bookings when the status is updated to CONFIRMED:

```sql
SELECT b.id, b.booking_ref, b.status, b.total_amount_minor, b.currency, b.created_at,
       b.payment_provider, b.provider_charge_id,
       p.first_name, p.last_name, p.email, p.phone, p.passport_number, p.nationality,
       f.flight_number, r.origin_iata, r.destination_iata,
       f.departure_time, f.arrival_time
FROM bookings b
JOIN passengers p ON p.id = b.passenger_id
JOIN flights f    ON f.id = b.flight_id
JOIN routes r     ON r.id = f.route_id
WHERE b.booking_ref = $1
```

> Because payment-service has its own database, qoomlee-service cannot JOIN to the payments table. Instead, `PUT /api/bookings/:ref/status` receives `paymentProvider` and `providerChargeId` in its request body and stores them in the bookings row. Return them as `paymentProvider` and `providerChargeId` in the JSON response (both `null` for PENDING bookings).

Update the bookings schema to add these columns:

```sql
ALTER TABLE bookings
    ADD COLUMN payment_provider   VARCHAR(50),
    ADD COLUMN provider_charge_id VARCHAR(100);
```

(Already included in `infra/db/qoomlee/01_schema.sql`.)

---

### 7. `GET /api/payments/:bookingRef`

- **File:** `services/payment/payment/handler.go` → `GetByBookingRef`
- **Repo:** `services/payment/payment/repository.go` → `GetByBookingRef`

```sql
SELECT id, booking_ref, booking_id, payment_provider, provider_charge_id,
       amount, currency, status, failure_code, failure_message, paid_at, created_at
FROM payments
WHERE booking_ref = $1
ORDER BY created_at DESC
LIMIT 1
```

Return the most recent payment for the booking (there may be multiple attempts).

---

## Infrastructure Requirements

### Health Check Endpoints

Two endpoints per service — **do not use a single `/health` for both**. They serve different purposes:

| Endpoint | Checks | Returns | Used by |
|---|---|---|---|
| `GET /health/live` | Nothing — just proves the process is running | Always `200` | Docker healthcheck |
| `GET /health/ready` | `db.PingContext` with 2 s timeout | `200` OK / `503` degraded | Docker healthcheck |

```go
r.GET("/health/live",  h.HealthLive)
r.GET("/health/ready", h.HealthReady)

func (h *Handler) HealthLive(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "qoomlee-service"})  // or "payment-service"
}

func (h *Handler) HealthReady(c *gin.Context) {
    ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
    defer cancel()
    if err := h.db.PingContext(ctx); err != nil {
        slog.Error("readiness check failed", "err", err)
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "status": "degraded", "service": "qoomlee-service", "error": "database ping failed",
        })
        return
    }
    c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "qoomlee-service"})
}
```

---

### Rate Limiting

Apply per-IP rate limiting using `golang.org/x/time/rate`. Use an in-memory store (map of IP → `rate.Limiter`).

| Endpoint | Requests per minute | Burst | Reason |
|---|---|---|---|
| `GET /api/flights/search` | 100 | 20 | High-volume read |
| `POST /api/bookings` | 30 | 5 | Write operation |
| `POST /api/payments/charge` | 10 | 3 | Sensitive financial endpoint |
| `GET /health/live` | 30 | 10 | Unauthenticated — DDoS protection |
| `GET /health/ready` | 30 | 10 | Unauthenticated — DDoS protection |

> Health endpoints are unauthenticated by design, which makes them reachable without a token — and therefore a potential DDoS vector. Rate limiting them prevents an attacker from flooding the service with health requests to exhaust resources.

On limit exceeded return **429 Too Many Requests**:

```json
{ "error": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please try again later." }
```

---

### Graceful Shutdown

Replace the bare `r.Run()` call in every service with a proper shutdown sequence:

```go
srv := &http.Server{Addr: ":" + port, Handler: r}

go func() {
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatalf("listen: %v", err)
    }
}()

quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
if err := srv.Shutdown(ctx); err != nil {
    log.Fatalf("forced shutdown: %v", err)
}
db.Close()
```

---

### Authentication (JWT RS256)

All API endpoints (except `/health/*`) require a valid **JWT RS256** bearer token.

```
Authorization: Bearer <token>
```

**How it works:**
- Tokens are signed with an RSA **private key** (`JWT_PRIVATE_KEY` — **test tooling only**, never loaded by any service at runtime).
- All three services verify incoming tokens using the RSA **public key** (`JWT_PUBLIC_KEY`).
- Algorithm: `RS256`. Required claims: `sub`, `exp`.
- Missing or invalid token → `401 UNAUTHORIZED`

> **`PUT /api/bookings/:ref/status` is excluded from JWT** — it's a service-to-service call with no user. See the `X-Internal-Token` section below.

```go
import "github.com/golang-jwt/jwt/v5"

// Middleware — parse and verify token
func JWTMiddleware(publicKeyPEM string) gin.HandlerFunc {
    key, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(publicKeyPEM))
    return func(c *gin.Context) {
        tokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
        token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
                return nil, fmt.Errorf("unexpected signing method")
            }
            return key, nil
        })
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "UNAUTHORIZED", "message": "missing or invalid token",
            })
            return
        }
        c.Next()
    }
}
```

Apply it globally in `main.go`:

```go
r.Use(middleware.JWTMiddleware(os.Getenv("JWT_PUBLIC_KEY")))
r.GET("/health/live", ...)   // health endpoints registered BEFORE the middleware
r.GET("/health/ready", ...)
```

> **Tip:** Use router groups to separate JWT-protected routes from unprotected ones:
> ```go
> // No JWT — health probes + internal service endpoint
> open := r.Group("/")
> open.GET("/health/live", ...)
> open.GET("/health/ready", ...)
> open.PUT("/api/bookings/:ref/status", middleware.InternalToken(...), h.UpdateStatus)
>
> // JWT required — all public API endpoints
> api := r.Group("/")
> api.Use(middleware.JWTMiddleware(os.Getenv("JWT_PUBLIC_KEY")))
> api.GET("/api/flights/search", ...)
> api.POST("/api/bookings", ...)
> // etc.
> ```

**For testing** — generate a token: `make jwt-token` (prints a Bearer token valid for 1 h, signed with `JWT_PRIVATE_KEY` from `.env`).

**For the internal `PUT /api/bookings/:ref/status` call** — this endpoint sits **outside** the JWT middleware. qoomlee-service guards it with `InternalTokenMiddleware` only. payment-service sends `X-Internal-Token: <INTERNAL_TOKEN>`, no JWT.

```go
import "crypto/subtle"

// Internal-token middleware (qoomlee-service only, on PUT /api/bookings/:ref/status route)
// Uses constant-time comparison to prevent timing attacks.
func InternalTokenMiddleware(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        got := c.GetHeader("X-Internal-Token")
        if subtle.ConstantTimeCompare([]byte(got), []byte(secret)) != 1 {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
                "error": "FORBIDDEN", "message": "internal token required",
            })
            return
        }
        c.Next()
    }
}
```

> **Security model:** `X-Internal-Token` proves the caller *knows the secret* — not that it is specifically payment-service. This is sufficient here because `qoomlee-service:8082` is only reachable within the Docker Compose internal network (no `ports:` mapping for external access). The network boundary is the primary isolation; the token is a guard against accidental miscalls from other containers.
>
> **Token strength matters.** Generate it with `openssl rand -hex 32` (256 bits of entropy). A weak or default value makes the guard worthless. qoomlee-service should refuse to start if `INTERNAL_TOKEN` is empty:
> ```go
> secret := os.Getenv("INTERNAL_TOKEN")
> if secret == "" {
>     slog.Error("INTERNAL_TOKEN is required")
>     os.Exit(1)
> }
> ```

---

### Structured Logging (JSON)

Replace all `log.Printf` with `slog` (Go stdlib since 1.21). JSON output is required.

```go
// main.go — set once at startup
slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stderr, nil)))

// In handlers
slog.Error("GetFlightByID failed", "id", id, "err", err)
slog.Info("charge succeeded", "bookingRef", req.BookingRef, "chargeId", charge.ID)
```

Add a Gin middleware that logs one JSON line per request with `method`, `path`, `status`, `latency_ms`.

---

## Implementation Requirements

### Requirement 1 — Always Return JSON

Every response (including errors) must have `Content-Type: application/json`. Never return raw text.

### Requirement 2 — Error Response Shape

```json
{ "error": "ERROR_CODE", "message": "Human-readable explanation." }
```

- `error` — `UPPER_SNAKE_CASE` machine-readable code
- `message` — plain English; never a raw Go error or SQL message

### Requirement 3 — Correct HTTP Status Codes

| Situation | Status |
|---|---|
| Successful retrieval | `200 OK` |
| Successful creation | `201 Created` |
| Missing or invalid field | `400 Bad Request` |
| Missing or invalid JWT | `401 Unauthorized` |
| Card declined | `402 Payment Required` |
| Wrong `X-Internal-Token` | `403 Forbidden` |
| Resource not found | `404 Not Found` |
| Business rule conflict (already paid, no seats) | `409 Conflict` |
| Rate limit exceeded | `429 Too Many Requests` |
| Unexpected server error | `500 Internal Server Error` |

### Requirement 4 — Log Internally, Hide Externally

```go
if err != nil {
    slog.Error("GetFlightByID failed", "id", id, "err", err)   // full detail in logs
    c.JSON(500, gin.H{"error": "INTERNAL_ERROR", "message": "An unexpected error occurred."})
    return
}
```

### Requirement 5 — Never Swallow Errors

Every `err` return value must be checked. Ignoring an error and continuing is a bug.

### Requirement 6 — Payment-service Must Never Access the Booking Database

Payment-service connects to `postgres-qoomlee-payment` only. It physically cannot access the booking database — there are no credentials, no host, no `DB_*` env vars pointing to `postgres-qoomlee`.

Booking status changes go exclusively through `PUT http://qoomlee-service:8082/api/bookings/:ref/status`.

This is enforced by topology (separate DB instances), not just convention. Any attempt to hardcode booking DB connection strings in payment-service is a failing criterion.

### Requirement 7 — Payment→Booking Failure

After a successful Omise charge, if `PUT /api/bookings/:ref/status` call fails:

- **Do not** return 500
- **Do** log the failure with the charge ID and `bookingRef`
- **Do** return 201 with the charge result — the money was taken, the client must know

### Requirement 8 — All Money Is Minor Units (satang); No Floats in Business Logic

- Every monetary column in the DB is `BIGINT` (`_minor` suffix): `base_price_minor`, `total_amount_minor`, `amount_minor`
- Every monetary variable in Go is `int64`
- Conversion to/from THB (`÷100` / `×100`) happens **only in handlers** when reading request bodies or writing JSON responses
- Never pass `float64` for an amount through a service or repository function
- Every monetary field in API requests and responses is a triple: `*Minor` (int64 satang), `currency`, and `*` (formatted display string, e.g. `"3500.00"`); never return or accept a JSON float for a monetary amount
- `booking.total_amount_minor` must equal `payment.amount_minor` — payment-service validates this before calling Omise (`400 AMOUNT_MISMATCH` if they differ)

### Requirement 9 — Concurrent Booking Must Use SELECT FOR UPDATE

`CreateBooking` must lock the flights row before checking and decrementing `available_seats`:

```sql
SELECT available_seats FROM flights WHERE id = $1 FOR UPDATE
```

Without this lock, two concurrent requests on a 1-seat flight can both read `available_seats = 1`, both pass the check, and both insert — resulting in overbooking. The integration test for concurrent booking validates this.

### Requirement 10 — `PUT /api/bookings/:ref/status` Happy Path Must Be Contract-tested

The internal status endpoint must be verified end-to-end (not just the 403 rejection):

- A valid `X-Internal-Token` + `{status: CONFIRMED, paymentId: N}` → 200, booking flips to CONFIRMED
- This is required in Layer 3 contract tests running against the live stack

### Error Code Reference

**All services (applied by JWT middleware)**

| Scenario | Status | `error` |
|---|---|---|
| Missing or invalid `Authorization` header / expired JWT | 401 | `UNAUTHORIZED` |

**qoomlee-service only — `PUT /api/bookings/:ref/status` (no JWT, internal-token middleware only)**

| Scenario | Status | `error` |
|---|---|---|
| Missing or wrong `X-Internal-Token` | 403 | `FORBIDDEN` |

**qoomlee-service — flight endpoints**

| Scenario | Status | `error` |
|---|---|---|
| `origin`, `destination`, or `date` missing | 400 | `MISSING_REQUIRED_FIELD` |
| `date` not valid YYYY-MM-DD | 400 | `INVALID_DATE_FORMAT` |
| `passengers` not a positive integer | 400 | `INVALID_FIELD` |
| Flight `:id` not found | 404 | `FLIGHT_NOT_FOUND` |
| DB error | 500 | `INTERNAL_ERROR` |

**qoomlee-service — booking endpoints**

| Scenario | Status | `error` |
|---|---|---|
| `flightId`, `passenger.firstName/lastName/email` missing | 400 | `MISSING_REQUIRED_FIELD` |
| `available_seats` is 0 | 409 | `NO_SEATS_AVAILABLE` |
| Booking `:bookingRef` not found | 404 | `BOOKING_NOT_FOUND` |
| PUT status value not `CONFIRMED` | 400 | `INVALID_STATUS` |
| DB error | 500 | `INTERNAL_ERROR` |

**payment-service**

| Scenario | Status | `error` |
|---|---|---|
| `bookingRef`, `bookingId`, `omiseToken`, `amountMinor` missing | 400 | `MISSING_REQUIRED_FIELD` |
| `amountMinor` ≤ 0 | 400 | `INVALID_FIELD` |
| `amountMinor` or `currency` does not match booking | 400 | `AMOUNT_MISMATCH` |
| Booking already `CONFIRMED` | 409 | `ALREADY_PAID` |
| Card declined by Omise | 402 | `payment_failed` (lowercase — matches Omise vocabulary) |
| No payment found for `:bookingRef` | 404 | `PAYMENT_NOT_FOUND` |
| DB error | 500 | `INTERNAL_ERROR` |

---

## Testing Requirements

### Layer 1 — Unit Tests

`go test ./...` in each service. All DB and HTTP calls mocked with `testify/mock`.
Define a repository **interface**, implement it in production, mock it in tests.

| Service | Method | Cases to cover |
|---|---|---|
| qoomlee-service | `SearchFlights` | valid params → flights; no match → empty slice; blank origin → error |
| qoomlee-service | `GetFlightByID` | valid id → flight; unknown id → ErrNotFound |
| qoomlee-service | `CreateBooking` | PNR is 6 chars; passenger insert called; booking insert called with correct `flightId` and `total_amount_minor` copied from flight; repo mock verifies `SELECT FOR UPDATE` called before decrement |
| qoomlee-service | `GetBookingByRef` | returns nested flight+passenger+paymentProvider+providerChargeId (non-nil when CONFIRMED); unknown ref → ErrNotFound |
| qoomlee-service | `UpdateBookingStatus` | updates status + paymentProvider + providerChargeId; unknown ref → ErrNotFound |
| payment-service | `Charge` — amount mismatch | qoomlee-service mock returns booking; `req.amountMinor != booking.total_amount_minor`; Omise **never called**; returns 400 `AMOUNT_MISMATCH` |
| payment-service | `Charge` — success | qoomlee-service mock returns PENDING booking; Omise mock returns successful; DB insert with `status=SUCCEEDED`, `amount_minor` matching booking; qoomlee-service mock `PUT /api/bookings/:ref/status` called once with `{status:CONFIRMED, paymentId:X, paymentProvider:OMISE, providerChargeId:chrg_...}`; returns 201 |
| payment-service | `Charge` — decline | qoomlee-service mock returns PENDING booking; Omise mock returns failed; DB insert with `status=FAILED`; qoomlee-service `PUT /api/bookings/:ref/status` **never called**; returns 402 with `failureCode` |
| payment-service | `Charge` — already paid | qoomlee-service mock `GET /api/bookings/:ref` returns `CONFIRMED`; Omise **never called**; qoomlee-service `PUT /api/bookings/:ref/status` **never called**; returns 409 `ALREADY_PAID` |
| payment-service | `Charge` — PUT fails | qoomlee-service mock returns PENDING booking; Omise mock returns successful; DB insert with SUCCEEDED; qoomlee-service mock returns error on `PUT /api/bookings/:ref/status`; **still returns 201** (charge succeeded); error logged |
| payment-service | `GetByBookingRef` | returns 200 with `paymentProvider` + `providerChargeId`; unknown ref → 404 |
| middleware | `JWTMiddleware` | valid token → passes through; missing token → 401; expired token → 401; wrong algorithm → 401 |
| middleware | `InternalTokenMiddleware` | correct token → passes through; missing header → 403; wrong value → 403 |

### Layer 2 — Integration Tests

`go test ./... -tags=integration`. Use `testcontainers-go` — start a real PostgreSQL container, apply the schema and seed SQL, then run tests against it.

| Service | What to test |
|---|---|
| qoomlee-service | Search returns ≥1 flight for BKK→SIN `date=2026-06-15`; empty slice for unknown route; `GetByID(1)` correct; `GetByID(99999)` ErrNotFound |
| qoomlee-service | `CreateBooking()` writes to `passengers` + `bookings`; PNR is unique; `total_amount_minor` equals `flights.base_price_minor`; `GetByRef("SEED02")` returns full join (uses pre-seeded PENDING booking) |
| qoomlee-service | Concurrent `CreateBooking()` — run 2 goroutines simultaneously on a flight with 1 seat; exactly 1 succeeds (201) and 1 returns 409 `NO_SEATS_AVAILABLE`; `available_seats` ends at 0 |
| payment-service | `Insert()` writes to `payments` with correct `amount_minor`; `FindByBookingRef("SEED01")` returns SUCCEEDED record with matching `amount_minor`; unknown ref → ErrNotFound |

### Layer 3 — Contract Tests

Run against live `docker compose` stack. All requests must include `Authorization: Bearer $TOKEN` (see `make jwt-token`).

| Test | Pass condition |
|---|---|
| `GET /api/flights/search` — missing origin | 400 `MISSING_REQUIRED_FIELD` |
| `GET /api/flights/1` | 200 with `id`, `flightNumber`, `origin`, `destination`, `durationMinutes` |
| `GET /api/flights/99999` | 404 `FLIGHT_NOT_FOUND` |
| `POST /api/bookings` — valid body, `flightId=1` | 201; `bookingRef` exactly 6 chars; `bookingId` integer |
| `POST /api/bookings` — `flightId=6` (QM999 SOLD OUT) | 409 `NO_SEATS_AVAILABLE` |
| `GET /api/bookings/SEED01` | 200; `status=CONFIRMED`; `paymentProvider=OMISE`; `providerChargeId=chrg_test_5xkm2r9p8wqv3ntzy7au` (traceability check) |
| `GET /api/bookings/SEED02` | 200; `bookingRef`, `status`, `flight`, `passenger` all present; `paymentProvider=null`, `providerChargeId=null` (PENDING) |
| `GET /api/bookings/XXXXXX` | 404 `BOOKING_NOT_FOUND` |
| `POST /api/payments/charge` — `bookingRef=SEED01` (CONFIRMED) | 409 `ALREADY_PAID` (no Omise call — pure DB guard) |
| `POST /api/payments/charge` — success card `4242…` | 201; `providerChargeId` present; `paymentProvider=OMISE`; subsequent `GET /api/bookings/:ref` returns `status=CONFIRMED` and matching `providerChargeId` |
| `POST /api/payments/charge` — decline card `4111…` | 402; `failureCode` present; booking stays `PENDING` |
| `GET /api/payments/SEED01` | 200; `status=SUCCEEDED`; `paymentProvider=OMISE`; `providerChargeId` non-empty |
| `GET /api/payments/SEED02` | 200; `status=FAILED`; `failureCode=insufficient_fund` |
| `GET /api/flights/search` — no `Authorization` header | 401 `UNAUTHORIZED` |
| `PUT /api/bookings/SEED02/status` — valid `X-Internal-Token`, body `{status:CONFIRMED, paymentId:1}` | 200; subsequent `GET /api/bookings/SEED02` returns `status=CONFIRMED` |
| `PUT /api/bookings/SEED01/status` — no `X-Internal-Token` | 403 `FORBIDDEN` (no JWT required on this route) |
| `POST /api/payments/charge` — `amountMinor` differs from booking | 400 `AMOUNT_MISMATCH`; Omise not called |
| `GET /health/live` + `GET /health/ready` — no `Authorization` header | 200 on both services (health endpoints are unprotected) |

### Layer 4 — Load Tests (K6)

```bash
k6 run tests/k6/search.js         # 50 VUs × 30 s
k6 run tests/k6/booking-flow.js   # 20 VUs × 60 s
```

| Script | Threshold |
|---|---|
| `search.js` | p95 < 500 ms, error rate < 1% |
| `booking-flow.js` | p95 < 3000 ms, error rate < 2% |

---

## Constraints

- Do not modify files under `infra/db/qoomlee/` or `infra/db/qoomlee-payment/`
- Do not change service ports or the core `docker-compose.yml` structure
- Omise must be in **test mode only** — never use live keys
- `bookingRef` must be exactly 6 uppercase alphanumeric characters
- `.env` must not be committed (it is in `.gitignore`)
- Rate limiting must be per-IP (not global)
- Payment is **credit card only** — do not add webhook handlers
- `INTERNAL_TOKEN` must be a high-entropy random value (`openssl rand -hex 32`); qoomlee-service must refuse to start if it is empty
- `JWT_PRIVATE_KEY` must never be loaded by any running service — test tooling only
- Use `crypto/subtle.ConstantTimeCompare` for all secret comparisons (never `==`)
- No hardcoded secrets in `.go` files (`go vet` and `grep` checks will catch `skey_test` / `pkey_test`)

---

## Scoring

See `SCORECARD.md` for the full rubric.

| Pillar | Points |
|---|---|
| Working Software — all 7 endpoints return correct responses end-to-end | 25 |
| Testing — unit + integration + contract + K6 | 35 |
| Code Quality — layered arch, error handling, clean Go | 20 |
| Infrastructure & Security — health probes, rate limiting, graceful shutdown, logs, JWT auth, internal token | 20 |

---

## FAQ

**Q: Where do I start?**

Implement endpoints in order: Search → GetFlight → CreateBooking → Charge → UpdateStatus → GetBooking → GetPayment. Each one builds on the previous. qoomlee-service owns the first 5 endpoints; payment-service owns the last 2.

**Q: What is satang?**

Omise requires amounts in the smallest currency unit (like Stripe's cents). 1 THB = 100 satang. 3,500 THB = `350000`. The `payments.amount_minor` column stores satang. Pass satang when creating a charge. `request.amountMinor` must equal `booking.total_amount_minor` — validate before calling Omise.

**Q: Why do I need both `bookingRef` and `bookingId` for payment?**

`bookingRef` is the 6-char PNR used as a human-readable identifier. `bookingId` is the numeric DB row id. Omise doesn't know about either — you just need them to link the payment record back to the booking.

**Q: My payment succeeded but GET /api/bookings still shows PENDING.**

The payment service must call `PUT /api/bookings/{ref}/status` internally after a successful charge. If you haven't implemented that PUT handler yet, or haven't wired the HTTP call in payment-service, the status won't update.

**Q: How does payment-service call qoomlee-service?**

Via HTTP using the `QOOMLEE_SERVICE_URL` env var (already `http://qoomlee-service:8082` in docker-compose). Make an HTTP PUT call in the Charge handler after recording the SUCCEEDED payment.

**Q: Do I need a public URL for Omise callbacks?**

No. Credit card charges are synchronous — Omise returns the result in the same API call. No webhook, no public URL needed.

**Q: Do I need authentication?**

Yes, but differently per caller type. Client-facing endpoints (`/api/*` except `PUT /api/bookings/:ref/status`) require `Authorization: Bearer <jwt>` (RS256, verified by `JWT_PUBLIC_KEY`). The internal `PUT /api/bookings/:ref/status` endpoint is excluded from JWT — it only accepts `X-Internal-Token`. Use `make jwt-token` to generate a test token for curl.

**Q: Can I add packages to go.mod?**

Yes. The existing `go.mod` for payment-service already includes Gin, `lib/pq`, and the Omise SDK. Add anything you need.

**Q: What is `PUT /api/bookings/:ref/status`? Users don't call it?**

Correct. It's called internally by payment-service after a successful charge to flip the booking from PENDING to CONFIRMED. It's not exposed to end users but it must exist for the end-to-end flow to work.

**Q: What does booking `status` mean?**

`PENDING` = booked, not yet paid. `CONFIRMED` = paid successfully. Payment-service is responsible for calling qoomlee-service to set CONFIRMED.

**Q: Should I build a checkin-service or touch the `checkins` table?**

No. Ignore them entirely — out of scope.
