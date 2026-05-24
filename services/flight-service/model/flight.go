package model

import "time"

type Flight struct {
	ID             int64     `json:"id"`
	FlightNumber   string    `json:"flightNumber"`
	Origin         string    `json:"origin"`
	Destination    string    `json:"destination"`
	DepartureTime  time.Time `json:"departureTime"`
	ArrivalTime    time.Time `json:"arrivalTime"`
	Status         string    `json:"status"`
	BasePrice      float64   `json:"basePrice"`
	Currency       string    `json:"currency"`
	AvailableSeats int       `json:"availableSeats"`
	DurationMinutes int      `json:"durationMinutes"`
}

type FlightSearchResponse struct {
	Flights []Flight `json:"flights"`
}
