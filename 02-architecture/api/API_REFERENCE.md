# Qoomlee API Reference

> Auto-generated from the actual running codebase. See [API_SPECS.md](../../API_SPECS.md) for the full contract with examples.

## Services

| Service | Language | Port | Auth |
|---------|----------|------|------|
| qoomlee-service | Go + Gin | 9988 | Session token (Bearer) on most routes; public search |
| payment-service | Go + Gin | 9984 | Session token (Bearer) |

---

## qoomlee-service (port 9988)

### Public — no auth

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health/live` | Liveness probe |
| `GET` | `/health/ready` | Readiness probe (DB ping) |
| `GET` | `/api/flights/search` | Search flights by origin, destination, date, passengers |

### Authenticated — Bearer token required

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/flights/:id` | Get flight detail by ID |
| `POST` | `/api/bookings` | Create booking (with optional `?bookingToken=` for dedup) |
| `GET` | `/api/bookings` | List all bookings |
| `GET` | `/api/bookings/:bookingRef` | Get booking detail (lazy expiry on read) |

### Internal — X-Internal-Token required

| Method | Path | Description |
|--------|------|-------------|
| `PUT` | `/api/bookings/:bookingRef/status` | Update booking status to CONFIRMED (called by payment-service) |

---

## payment-service (port 9984)

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health/live` | Liveness probe |
| `GET` | `/health/ready` | Readiness probe (DB ping) |

### Authenticated — Bearer token required

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/payments/charge` | Charge a card via Omise (rate-limited: 10 req/s) |
| `GET` | `/api/payments/:bookingRef` | Get payment receipt for a booking |

---

## Auth Details

- **Session token**: Opaque Bearer token extracted from `Authorization` header. Set as `userSub` in Gin context.
- **Internal token**: Shared secret in `X-Internal-Token` header. Used for service-to-service calls (`PUT /api/bookings/:ref/status`). Compared with `crypto/subtle.ConstantTimeCompare`.
- **Flight search** is public — no auth required.

## Error Response Format

All `4xx` and `5xx` responses:
```json
{ "error": "ERROR_CODE", "message": "Human-readable description." }
```

## Booking Status Lifecycle

```
PENDING ──── charge succeeds ───► CONFIRMED
PENDING ──── charge fails ──────► PENDING (can retry)
PENDING ──── expires (15 min) ──► EXPIRED (lazy, on read)
```

## Data Flow: Payment

```
payment-service
  1. GET /api/bookings/:ref (qoomlee-service) → fetch booking details
  2. Validate amount matches booking.totalAmountMinor
  3. Create charge via Omise API
  4. INSERT into payments table
  5. PUT /api/bookings/:ref/status (qoomlee-service) → set CONFIRMED
```

## Related Documents

- [API_SPECS.md](../../API_SPECS.md) — Full request/response examples and error codes
- [CHALLENGE.md](../../CHALLENGE.md) — Story descriptions and acceptance criteria
- [ROADMAP.md](../../01-documentation/ROADMAP.md) — Feature status and priorities