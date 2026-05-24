package model

import "time"

type Passenger struct {
	ID             int64      `json:"id"`
	FirstName      string     `json:"firstName"`
	LastName       string     `json:"lastName"`
	Email          string     `json:"email"`
	Phone          *string    `json:"phone,omitempty"`
	PassportNumber *string    `json:"passportNumber,omitempty"`
	DateOfBirth    *time.Time `json:"dateOfBirth,omitempty"`
	Nationality    *string    `json:"nationality,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
}

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

// CreateBookingRequest is the POST /api/bookings request body.
type CreateBookingRequest struct {
	FlightID    int64            `json:"flightId"    binding:"required"`
	Passenger   PassengerRequest `json:"passenger"   binding:"required"`
	SeatNumber  *string          `json:"seatNumber"`
	TotalAmount float64          `json:"totalAmount" binding:"required"`
	Currency    string           `json:"currency"`
}

type PassengerRequest struct {
	FirstName      string  `json:"firstName"      binding:"required"`
	LastName       string  `json:"lastName"       binding:"required"`
	Email          string  `json:"email"          binding:"required"`
	Phone          *string `json:"phone"`
	PassportNumber *string `json:"passportNumber"`
	DateOfBirth    *string `json:"dateOfBirth"`   // YYYY-MM-DD
	Nationality    *string `json:"nationality"`
}

// CreateBookingResponse is the 201 response for POST /api/bookings.
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
