package booking

import (
	"errors"
	"time"
)

var (
	// ErrNotFound is returned when no booking exists for the given reference.
	ErrNotFound = errors.New("booking not found")
	// ErrNoSeatsAvailable is returned when a flight has no remaining seats.
	ErrNoSeatsAvailable = errors.New("no seats available")
	// ErrBookingExpired is returned when a status update is attempted on an
	// EXPIRED booking (or a PENDING booking that has just lazily expired).
	ErrBookingExpired = errors.New("booking expired")
	// ErrAlreadyConfirmed is returned when a status update is attempted on a
	// booking that is already CONFIRMED.
	ErrAlreadyConfirmed = errors.New("booking already confirmed")
)

// Passenger holds personal details for one traveller.
type Passenger struct {
	ID             int64  `json:"id,omitempty"`
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
	Email          string `json:"email"`
	Phone          string `json:"phone,omitempty"`
	PassportNumber string `json:"passportNumber,omitempty"`
	DateOfBirth    string `json:"dateOfBirth,omitempty"` // YYYY-MM-DD
	Nationality    string `json:"nationality,omitempty"`
}

// FlightSummary is the denormalised flight snapshot embedded in a Booking response.
type FlightSummary struct {
	FlightNumber  string    `json:"flightNumber"`
	Origin        string    `json:"origin"`
	Destination   string    `json:"destination"`
	DepartureTime time.Time `json:"departureTime"`
	ArrivalTime   time.Time `json:"arrivalTime"`
}

// Booking is the canonical booking entity returned by the service / repository.
type Booking struct {
	ID               int64          `json:"bookingId"`
	BookingRef       string         `json:"bookingRef"`
	Status           string         `json:"status"`
	TotalAmountMinor int64          `json:"totalAmountMinor"`
	TotalAmount      string         `json:"totalAmount"` // formatted, e.g. "3500.00"
	Currency         string         `json:"currency"`
	CreatedAt        time.Time      `json:"createdAt"`
	PaymentProvider  *string        `json:"paymentProvider"`     // nil when PENDING
	ProviderChargeID *string        `json:"providerChargeId"`    // nil when PENDING
	ExpiresAt        *time.Time     `json:"expiresAt,omitempty"` // seat-hold deadline; nil once CONFIRMED/EXPIRED
	Passenger        Passenger      `json:"passenger"`
	Flight           FlightSummary  `json:"flight"`
	ReturnFlight     *FlightSummary `json:"returnFlight,omitempty"`
}

// Summary is a row in the "My Bookings" list response.
type Summary struct {
	BookingRef          string     `json:"bookingRef"`
	Status              string     `json:"status"`
	ExpiresAt           *time.Time `json:"expiresAt,omitempty"` // present only when PENDING
	FlightNumber        string     `json:"flightNumber"`
	Origin              string     `json:"origin"`
	Destination         string     `json:"destination"`
	DepartureTime       time.Time  `json:"departureTime"`
	ArrivalTime         time.Time  `json:"arrivalTime"`
	ReturnFlightNumber  string     `json:"returnFlightNumber,omitempty"`
	ReturnOrigin        string     `json:"returnOrigin,omitempty"`
	ReturnDestination   string     `json:"returnDestination,omitempty"`
	ReturnDepartureTime *time.Time `json:"returnDepartureTime,omitempty"`
	ReturnArrivalTime   *time.Time `json:"returnArrivalTime,omitempty"`
	Passengers          int        `json:"passengers"`
	TotalAmount         string     `json:"totalAmount"`
	Currency            string     `json:"currency"`
}

// CreateRequest is the decoded body of POST /api/bookings.
type CreateRequest struct {
	FlightID       int64     `json:"flightId"`
	ReturnFlightID *int64    `json:"returnFlightId,omitempty"`
	Passenger      Passenger `json:"passenger"`
	UserSub        string    `json:"-"` // JWT sub claim of the caller; not part of the request body
	BookingToken   string    `json:"-"` // from ?bookingToken= query param; prevents duplicate bookings on back-navigation
}

// UpdateStatusRequest is the decoded body of PUT /api/bookings/:ref/status.
type UpdateStatusRequest struct {
	Status           string `json:"status"`
	PaymentID        int64  `json:"paymentId"`
	PaymentProvider  string `json:"paymentProvider"`
	ProviderChargeID string `json:"providerChargeId"`
}
