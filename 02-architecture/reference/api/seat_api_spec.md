# SEAT SERVICE — API SPECIFICATION

> ⚠️ **Aspirational** — The seat module does not exist yet. See `01-documentation/ROADMAP.md` for the long-term plan.

## Overview
All endpoints are served under `/api/v1/seats`. Authentication via Bearer JWT is required for all endpoints. Admin-only endpoints additionally require the `admin` or `ops_admin` role enforced by the API Gateway RBAC.

Standard response envelopes (same as all Qoomlee services):

```json
// Success
{
  "data": {},
  "success": true,
  "message": "Human-readable description",
  "correlationId": "uuid"
}

// Error
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": []
  },
  "success": false,
  "correlationId": "uuid"
}
```

---

## SEAT CONFIGURATION (Admin)

### POST /api/v1/seats/config
Create a seat configuration entry for an aircraft type.

**Required Role:** `admin` / `ops_admin`

#### Request
```json
{
  "aircraftTypeId": "ac_boeing737",
  "seatNumber": "12A",
  "rowNumber": 12,
  "columnLetter": "A",
  "seatType": "WINDOW",
  "fareClass": "ECONOMY",
  "features": ["EXTRA_LEGROOM"]
}
```

### GET /api/v1/seats/config/:aircraftTypeId
Get all seat configurations for an aircraft type.

### DELETE /api/v1/seats/config/:id
Delete a seat configuration entry.

---

## SEAT INVENTORY (Internal)

### POST /api/v1/seats/inventory/init
Initialize seat inventory for a flight. Called by Flight Service when a flight is created.

### GET /api/v1/seats/flight/:flightId
Get the full seat map for a flight with live availability.

#### Response
```json
{
  "data": {
    "flightId": 1,
    "flightNumber": "QM101",
    "seatMap": {
      "rows": [
        {
          "rowNumber": 1,
          "seats": [
            {
              "seatNumber": "1A",
              "seatType": "WINDOW",
              "fareClass": "BUSINESS",
              "status": "AVAILABLE",
              "features": [],
              "price": 22500
            }
          ]
        }
      ]
    }
  }
}
```

---

## SEAT LOCK MANAGEMENT (Booking flow)

### POST /api/v1/seats/lock
Place an 8-minute TTL lock on a seat during the booking session.

#### Request
```json
{
  "flightId": 1,
  "seatNumber": "12A",
  "bookingId": 42,
  "ttlSeconds": 480
}
```

### POST /api/v1/seats/confirm
Confirm a locked seat after payment succeeds. Transitions LOCKED → BOOKED.

### POST /api/v1/seats/release
Release a locked seat (booking cancelled or TTL expired). Transitions LOCKED → AVAILABLE.

---

## SEAT ASSIGNMENT (Check-in)

### POST /api/v1/seats/assign
Assign a seat during check-in. Can change seat if already assigned.

### POST /api/v1/seats/checkin-confirm
Mark seat as CHECKED_IN after passenger completes check-in.

---

## SEAT BLOCK MANAGEMENT (Admin)

### POST /api/v1/seats/block
Block a seat (CREW, MAINTENANCE, VIP, WEIGHT_BALANCE).

### POST /api/v1/seats/unblock
Remove a block from a seat.

---

## Seat Status State Machine

```
AVAILABLE → LOCKED → BOOKED → CHECKED_IN → BOARDED
                ↓         ↓
            (release)  (cancel → refund)
                ↓         ↓
            AVAILABLE  AVAILABLE
```

## Error Codes

| Code | Status | When |
|------|--------|------|
| `SEAT_NOT_FOUND` | 404 | Seat number doesn't exist for this aircraft type |
| `SEAT_NOT_AVAILABLE` | 409 | Seat is already locked, booked, or blocked |
| `SEAT_LOCK_EXPIRED` | 409 | The 8-minute TTL has expired |
| `SEAT_ALREADY_BOOKED` | 409 | Attempting to lock an already booked seat |
| `INVALID_STATE_TRANSITION` | 409 | Invalid state machine transition |
| `BLOCK_REASON_REQUIRED` | 400 | Block reason is missing |