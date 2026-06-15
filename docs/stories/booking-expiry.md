# Booking hold expiry & status visibility

## Context

`POST /api/bookings` already creates a `PENDING` booking row and decrements
`flights.available_seats` immediately - the "seat hold" already exists in
Postgres. The only thing missing is a server-side expiry: the 15-minute
countdown on `/payment` is pure client state (`useState(900)`), so refreshing
the page resets it and an abandoned booking holds its seat forever.

This doc adds a third booking status, `EXPIRED`, and a server-derived
countdown, then wires the `/bookings` list page to real data.

## Domain model changes

- `bookings.expires_at TIMESTAMPTZ NOT NULL` - set to `created_at + 15
  minutes` at creation time.
- `bookings.status` gains `EXPIRED` alongside the existing `PENDING` /
  `CONFIRMED`.
- `bookings.user_sub VARCHAR(255) NOT NULL` - the JWT `sub` claim of the
  customer who created the booking, used to scope "My Bookings".
- **Expiry is enforced lazily**: any read of a `PENDING` booking whose
  `expires_at` has passed transitions it to `EXPIRED` and increments
  `flights.available_seats` back by one, in the same transaction. There is
  no background sweeper - the transition happens on the next read.

## Full status x action matrix

| Status (on read)        | `GET /bookings/:ref`                                  | `PUT /bookings/:ref/status` (CONFIRMED) | payment-service charge attempt |
|--------------------------|--------------------------------------------------------|-------------------------------------------|---------------------------------|
| `PENDING`, not expired   | 200, `PENDING` + `expiresAt`                            | 200 -> becomes `CONFIRMED`                | proceeds to Omise charge        |
| `PENDING`, expired       | lazily -> `EXPIRED`, seat released, 200 returns `EXPIRED` | 409 `booking_expired`                      | 409 `booking_expired`           |
| `EXPIRED`                | 200, `EXPIRED`                                          | 409 `booking_expired`                      | 409 `booking_expired`           |
| `CONFIRMED`              | 200, `CONFIRMED` (no `expiresAt`)                       | 409 `already_confirmed`                    | 409 `already_paid` (existing)   |
| not found                | 404 (existing)                                          | 404 (existing)                             | 404 (existing)                  |

## Stories

### Story 1 - Record the seat-hold expiry at booking creation

As the booking service, when a booking is created I record when its seat
hold expires, so the hold is not tied to client-side state.

- AC1: `infra/db/qoomlee/01_schema.sql` adds `expires_at TIMESTAMPTZ NOT
  NULL` and `user_sub VARCHAR(255) NOT NULL` to `bookings`, and extends the
  `status` check constraint to allow `EXPIRED`.
- AC2: `POST /api/bookings` sets `expires_at = NOW() + 15 minutes` (extract
  the 15-minute constant) and `user_sub` from the JWT `sub` claim.
- AC3: The `201` response includes `expiresAt` (RFC3339).
- AC4: `02_seed.sql` is updated so seeded `PENDING` bookings have a
  `user_sub` and a future `expires_at`, so seed data isn't immediately
  treated as expired.

### Story 2 - Lazily expire stale PENDING bookings on read

As the booking service, when anything reads a `PENDING` booking past its
`expires_at`, I flip it to `EXPIRED` and give the seat back.

- AC1: `GetByRef` checks `status == PENDING && expires_at < NOW()`; if true,
  in one transaction it sets `status = EXPIRED`, increments the flight's
  `available_seats` by one, and returns the booking with `status =
  EXPIRED`.
- AC2: A `PENDING`, non-expired booking is returned unchanged, including
  `expiresAt`.
- AC3: An already-`EXPIRED` or `CONFIRMED` booking is returned unchanged
  (no extra seat increment, no `expiresAt` for `CONFIRMED`).
- AC4: Covers all four rows of the status matrix above for `GET
  /bookings/:ref`.

### Story 3 - Reject confirmation and charges for expired bookings

- AC1: `PUT /api/bookings/:ref/status` (internal, called by
  payment-service) applies the same lazy-expiry check from Story 2 before
  attempting the `PENDING -> CONFIRMED` transition. If the booking is (or
  just became) `EXPIRED`, return `409 {"error":"booking_expired"}` and do
  not change status.
- AC2: If the booking is already `CONFIRMED`, return `409
  {"error":"already_confirmed"}` (idempotency guard).
- AC3: `services/payment`'s `BookingClient.GetBooking` surfaces the
  `EXPIRED` status; `payment.Service.Charge` returns a new
  `ErrBookingExpired` when status is `EXPIRED`, mapped to `409
  booking_expired` in the HTTP handler (alongside the existing
  `ErrAlreadyPaid` -> `already_paid` mapping).
- AC4: Covers all four matrix rows for both the status-update endpoint and
  the charge endpoint.

### Story 4 - Server-derived countdown on the payment page

- AC1: `/bookings/new` passes the real `bookingRef` returned by `POST
  /api/bookings` to `/payment` as a query param (replacing the client-side
  `generateBookingRef()` used after payment).
- AC2: On mount, `/payment` calls `GET /api/bookings/:ref` and computes
  `secondsRemaining = max(0, expiresAt - now)`. The visible countdown still
  ticks down once per second client-side, but its starting value comes from
  the server, so a page refresh recomputes it from `expiresAt` instead of
  resetting to 15:00.
- AC2: If the fetched booking is `PENDING` and not expired -> render the
  countdown + payment form as today.
- AC3: If the fetched booking is `EXPIRED` (including a `PENDING` booking
  that the GET itself just lazily expired) -> render a "Your booking hold
  has expired" panel, hide the payment form, link back to flight search.
  No countdown shown.
- AC4: If the fetched booking is `CONFIRMED` -> redirect immediately to
  `/bookings/confirmation?ref=...` (e.g. user pressed back after paying).
- AC5: If the ref is missing or `GET` returns 404 -> redirect to
  `/bookings/new`.

### Story 5 - Handle expiry that happens mid-submit

- AC1: If the user submits payment in the brief window where the hold
  expires server-side first, `payment-service` returns `409
  booking_expired` (Story 3). The payment page catches this specific error
  and switches to the same "booking hold has expired" panel from Story 4
  AC3, instead of a generic payment-failure message.

### Story 6 - "My Bookings" backed by real data

- AC1: New `GET /api/bookings` (authenticated) returns every booking whose
  `user_sub` matches the caller's JWT `sub`, each with: `bookingRef`,
  status (`PENDING|CONFIRMED|EXPIRED`), `expiresAt` (omitted/null unless
  `PENDING`), route, flight number, departure date, passenger count, total
  amount + currency. Applies the same lazy-expiry transition per row as
  Story 2.
- AC2: `/bookings` page fetches this endpoint instead of
  `lib/booking/mock.ts` and renders status badges:
  - `CONFIRMED` -> "Confirmed" (green, existing style)
  - `PENDING` -> "Awaiting payment" with "expires in Xm" (amber)
  - `EXPIRED` -> "Expired" (grey)
- AC3: Empty state ("No bookings yet") when the list is empty.
- AC4: Remove `lib/booking/mock.ts` and its usages once the page is wired
  to the real endpoint.

## Sequencing

1 -> 2 -> 3 (backend, `services/qoomlee` then `services/payment`) -> 4 -> 5
-> 6 (frontend). Each story is its own TDG red/green/refactor cycle(s).
