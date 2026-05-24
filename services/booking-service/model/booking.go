package model

import "time"

// ── DB row models ──────────────────────────────────────────────────────────

type Booking struct {
	ID          int64     `json:"id"`
	BookingRef  string    `json:"bookingRef"`
	FlightID    int64     `json:"flightId"`
	PassengerID int64     `json:"passengerId"`
	SeatID      *int64    `json:"seatId,omitempty"`
	Status      string    `json:"status"`
	TotalAmount float64   `json:"totalAmount"`
	Currency    string    `json:"currency"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// BookingDetail is the denormalised view returned by GET /api/bookings/:ref.
// Populate it from a JOIN across bookings, passengers, flights, and routes.
type BookingDetail struct {
	BookingRef  string          `json:"bookingRef"`
	Status      string          `json:"status"`
	TotalAmount float64         `json:"totalAmount"`
	Currency    string          `json:"currency"`
	CreatedAt   time.Time       `json:"createdAt"`
	Flight      FlightSummary   `json:"flight"`
	Passenger   PassengerSummary `json:"passenger"`
}

type FlightSummary struct {
	ID            int64     `json:"id"`
	FlightNumber  string    `json:"flightNumber"`
	Origin        string    `json:"origin"`
	Destination   string    `json:"destination"`
	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`
}

type PassengerSummary struct {
	FirstName      string  `json:"firstName"`
	LastName       string  `json:"lastName"`
	Email          string  `json:"email"`
	Phone          *string `json:"phone,omitempty"`
	PassportNumber *string `json:"passportNumber,omitempty"`
	Nationality    *string `json:"nationality,omitempty"`
}

// ── Request / Response DTOs ────────────────────────────────────────────────

// CreateBookingRequest is the POST /api/bookings request body.
type CreateBookingRequest struct {
	FlightID    int64            `json:"flightId"    binding:"required"`
	Passenger   PassengerRequest `json:"passenger"   binding:"required"`
	TotalAmount float64          `json:"totalAmount" binding:"required"`
	Currency    string           `json:"currency"`
}

type PassengerRequest struct {
	FirstName      string  `json:"firstName"     binding:"required"`
	LastName       string  `json:"lastName"      binding:"required"`
	Email          string  `json:"email"         binding:"required"`
	Phone          *string `json:"phone"`
	PassportNumber *string `json:"passportNumber"`
	DateOfBirth    *string `json:"dateOfBirth"`  // YYYY-MM-DD
	Nationality    *string `json:"nationality"`
}

// CreateBookingResponse is the 201 response body for POST /api/bookings.
type CreateBookingResponse struct {
	BookingRef string `json:"bookingRef"`
	BookingID  int64  `json:"bookingId"`
	Status     string `json:"status"`
	Message    string `json:"message"`
}

// UpdateStatusRequest is the PUT /api/bookings/:ref/status request body.
type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required"`
}
