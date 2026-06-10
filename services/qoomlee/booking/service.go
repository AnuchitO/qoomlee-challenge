package booking

import (
	"context"
	"math/rand/v2"
)

// Service is the business-logic interface for the booking domain.
type Service interface {
	Create(ctx context.Context, req CreateRequest) (*Booking, error)
	GetByRef(ctx context.Context, ref string) (*Booking, error)
	UpdateStatus(ctx context.Context, ref string, req UpdateStatusRequest) error
}

type service struct {
	repo Repository
}

// NewService creates a booking Service backed by the given Repository.
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Create(ctx context.Context, req CreateRequest) (*Booking, error) {
	pnr := generatePNR()
	return s.repo.Create(ctx, req.FlightID, req.Passenger, pnr)
}

func (s *service) GetByRef(ctx context.Context, ref string) (*Booking, error) {
	return s.repo.GetByRef(ctx, ref)
}

func (s *service) UpdateStatus(ctx context.Context, ref string, req UpdateStatusRequest) error {
	return s.repo.UpdateStatus(ctx, ref, req)
}

// generatePNR creates a random 6-character booking reference using an
// unambiguous character set (no 0/O/I/1 confusion).
func generatePNR() string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = chars[rand.IntN(len(chars))] //nolint:gosec // PNR is a human-facing reference code, not a security token
	}
	return string(b)
}
