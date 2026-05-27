package booking

import (
	"context"
	"errors"
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
	return nil, errors.New("not implemented")
}

func (s *service) GetByRef(ctx context.Context, ref string) (*Booking, error) {
	return nil, errors.New("not implemented")
}

func (s *service) UpdateStatus(ctx context.Context, ref string, req UpdateStatusRequest) error {
	return errors.New("not implemented")
}
