package flight

import (
	"context"
	"fmt"
	"time"
)

var bkkLoc = time.FixedZone("UTC+7", 7*60*60)

// Service is the business layer interface for flight operations.
type Service interface {
	Search(ctx context.Context, params SearchParams) ([]Flight, error)
	GetByID(ctx context.Context, id int64) (*Flight, error)
}

type service struct {
	repo Repository
}

// NewService creates a new flight Service wrapping the given Repository.
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Search(ctx context.Context, params SearchParams) ([]Flight, error) {
	flights, err := s.repo.Search(ctx, params)
	if err != nil {
		return nil, err
	}
	if flights == nil {
		flights = []Flight{}
	}
	for i := range flights {
		enrichFlight(&flights[i])
	}
	return flights, nil
}

func (s *service) GetByID(ctx context.Context, id int64) (*Flight, error) {
	f, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	enrichFlight(f)
	return f, nil
}

// bkkDateToUTCRange converts a local BKK (UTC+7) date to a [start, end) UTC window.
func bkkDateToUTCRange(date time.Time) (start, end time.Time) {
	startBKK := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, bkkLoc)
	return startBKK.UTC(), startBKK.Add(24 * time.Hour).UTC()
}

// enrichFlight computes derived display fields in-place.
// BasePriceMinor (satang) → BasePrice ("3500.00"), departure-arrival diff → DurationMinutes.
func enrichFlight(f *Flight) {
	f.BasePrice = fmt.Sprintf("%.2f", float64(f.BasePriceMinor)/100)
	f.DurationMinutes = int(f.ArrivalTime.Sub(f.DepartureTime).Minutes())
}
