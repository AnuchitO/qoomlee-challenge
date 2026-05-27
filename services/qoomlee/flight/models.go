package flight

import "time"

// Flight represents a single flight with all details needed by the API.
type Flight struct {
	ID              int64     `json:"id"`
	FlightNumber    string    `json:"flightNumber"`
	Origin          string    `json:"origin"`
	Destination     string    `json:"destination"`
	DepartureTime   time.Time `json:"departureTime"`
	ArrivalTime     time.Time `json:"arrivalTime"`
	Status          string    `json:"status"`
	BasePriceMinor  int64     `json:"basePriceMinor"`
	BasePrice       string    `json:"basePrice"`
	Currency        string    `json:"currency"`
	AvailableSeats  int       `json:"availableSeats"`
	DurationMinutes int       `json:"durationMinutes"`
}

// SearchParams carries validated query parameters for the repository.
type SearchParams struct {
	Origin      string
	Destination string
	DateFrom    time.Time // UTC start of the requested BKK date
	DateTo      time.Time // UTC end of the requested BKK date (exclusive)
	Passengers  int
}
