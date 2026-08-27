# QOOMLEE AIRLINE SYSTEM - API DOCUMENTATION

> ⚠️ **Aspirational** — These endpoints describe a future multi-service architecture. The current system has 7 endpoints across 2 services. See `02-architecture/api/API_REFERENCE.md` for actual endpoints.

## OVERVIEW
This document describes all API endpoints for the Qoomlee Airline System, following the C4 architecture model. All endpoints are versioned under `/api/v1` prefix.

## AUTHENTICATION
All API requests require authentication via Bearer JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## BASE RESPONSE FORMAT
All responses follow this structure:
```json
{
  "data": {},
  "success": true,
  "message": "Success description",
  "correlationId": "uuid"
}
```

Error responses:
```json
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

## EPIC 1: AUTHENTICATION API

### POST /api/v1/auth/register
User registration endpoint.

#### Request
```json
{
  "email": "john.doe@airline.com",
  "password": "Str0ngP@ssw0rd!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ground_agent"
}
```

### POST /api/v1/auth/login
User login endpoint. Returns JWT token.

### POST /api/v1/auth/refresh
Refresh an expired JWT token.

### POST /api/v1/auth/forgot-password
Send password reset email.

---

## EPIC 2: FLIGHT MANAGEMENT API

### GET /api/v1/flights
List flights with filtering and pagination.

### POST /api/v1/flights
Create a new flight (Admin only).

### GET /api/v1/flights/:id
Get flight details.

### PUT /api/v1/flights/:id
Update flight details (Admin only).

### DELETE /api/v1/flights/:id
Cancel a flight (Admin only).

### GET /api/v1/flights/:flightNumber/status
Get real-time flight status.

---

## EPIC 3: BOOKING API

### POST /api/v1/bookings
Create a new booking.

### GET /api/v1/bookings/:bookingRef
Get booking details.

### PUT /api/v1/bookings/:bookingRef
Modify an existing booking.

### DELETE /api/v1/bookings/:bookingRef
Cancel a booking.

### GET /api/v1/bookings
List all bookings for the authenticated user.

---

## EPIC 4: PAYMENT API

### POST /api/v1/payments/charge
Charge a credit card.

### GET /api/v1/payments/:bookingRef
Get payment receipt.

### POST /api/v1/payments/:bookingRef/refund
Refund a payment (internal).

---

## EPIC 5: CHECK-IN API

### POST /api/v1/checkins
Perform online check-in.

### GET /api/v1/checkins/:bookingRef
Get check-in status.

### GET /api/v1/checkins/:bookingRef/boarding-pass
Get boarding pass.

---

## EPIC 6: SEAT API

### GET /api/v1/seats/flight/:flightId
Get seat map for a flight.

### POST /api/v1/seats/lock
Lock a seat during booking.

### POST /api/v1/seats/confirm
Confirm a seat after payment.

### POST /api/v1/seats/release
Release a locked seat.

### POST /api/v1/seats/config
Create seat configuration (Admin).

---

## EPIC 7: PASSENGER API

### GET /api/v1/passengers/:id
Get passenger profile.

### PUT /api/v1/passengers/:id
Update passenger profile.

### POST /api/v1/passengers/:id/documents
Upload passenger document (passport, visa).

---

## EPIC 8: NOTIFICATION API

### POST /api/v1/notifications/send
Send a notification (internal).

### GET /api/v1/notifications/status/:id
Check notification delivery status.

---

> **Note:** Full request/response bodies for each endpoint were in the original 2,213-line document.
> This is a skeletal reconstruction. The original detailed spec was lost when the file was deleted.
> See `02-architecture/reference/api/seat_api_spec.md` for the full seat API spec which was partially recovered.