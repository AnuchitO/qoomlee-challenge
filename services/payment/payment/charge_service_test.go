package payment

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// --- mock BookingClient ---

type mockBookingClient struct {
	booking          *BookingDetail
	getErr           error
	confirmErr       error
	confirmedRef     string
	confirmedRequest ConfirmRequest
}

func (m *mockBookingClient) GetBooking(_ context.Context, _ string) (*BookingDetail, error) {
	return m.booking, m.getErr
}

func (m *mockBookingClient) ConfirmBooking(_ context.Context, ref string, req ConfirmRequest) error {
	m.confirmedRef = ref
	m.confirmedRequest = req
	return m.confirmErr
}

// --- mock Omiser ---

type mockOmiser struct {
	result *ChargeResult
	err    error
}

func (m *mockOmiser) CreateCharge(_ context.Context, _ ChargeRequest) (*ChargeResult, error) {
	return m.result, m.err
}

// --- mock Repository ---

type mockRepository struct {
	inserted   *Payment
	err        error
	getPayment *Payment
	getErr     error
}

func (m *mockRepository) Insert(_ context.Context, p *Payment) (*Payment, error) {
	if m.err != nil {
		return nil, m.err
	}
	p.ID = 1
	m.inserted = p
	return p, nil
}

func (m *mockRepository) GetByBookingRef(_ context.Context, _ string) (*Payment, error) {
	return m.getPayment, m.getErr
}

// --- fixtures ---

var pendingBooking = &BookingDetail{
	BookingRef:       "QM7X2K",
	Status:           "PENDING",
	TotalAmountMinor: 350000,
	Currency:         "THB",
}

var successCharge = &ChargeResult{
	ProviderChargeID: "chrg_test_5fzddg8p5j3qhp1w5jg",
	Status:           "successful",
}

var declinedCharge = &ChargeResult{
	ProviderChargeID: "chrg_test_declined",
	Status:           "failed",
	FailureCode:      "insufficient_fund",
	FailureMessage:   "The card has insufficient funds.",
}

var validReq = ChargeRequest{
	BookingRef:      "QM7X2K",
	CardName:        "John Doe",
	CardNumber:      "4242424242424242",
	ExpirationMonth: 12,
	ExpirationYear:  2028,
	SecurityCode:    "123",
	AmountMinor:     350000,
	Currency:        "THB",
}

// --- service tests ---

func TestServiceCharge(t *testing.T) {
	t.Run("happy path — successful charge persists payment and confirms booking", func(t *testing.T) {
		bc := &mockBookingClient{booking: pendingBooking}
		om := &mockOmiser{result: successCharge}
		repo := &mockRepository{}
		svc := NewService(bc, om, repo)

		p, err := svc.Charge(context.Background(), validReq)

		require.NoError(t, err)
		assert.Equal(t, "SUCCEEDED", p.Status)
		assert.Equal(t, "OMISE", p.PaymentProvider)
		assert.Equal(t, "chrg_test_5fzddg8p5j3qhp1w5jg", p.ProviderChargeID)
		assert.EqualValues(t, 350000, p.AmountMinor)
		assert.Equal(t, "THB", p.Currency)
		assert.False(t, p.PaidAt.IsZero())
		assert.Equal(t, "QM7X2K", bc.confirmedRef)
		assert.EqualValues(t, 1, bc.confirmedRequest.PaymentID)
		assert.Equal(t, "OMISE", bc.confirmedRequest.PaymentProvider)
		assert.Equal(t, "chrg_test_5fzddg8p5j3qhp1w5jg", bc.confirmedRequest.ProviderChargeID)
	})

	t.Run("already confirmed booking returns ErrAlreadyPaid", func(t *testing.T) {
		bc := &mockBookingClient{booking: &BookingDetail{
			BookingRef: "QM7X2K", Status: "CONFIRMED",
			TotalAmountMinor: 350000, Currency: "THB",
		}}
		svc := NewService(bc, &mockOmiser{}, &mockRepository{})

		p, err := svc.Charge(context.Background(), validReq)

		assert.ErrorIs(t, err, ErrAlreadyPaid)
		assert.Nil(t, p)
	})

	t.Run("amount mismatch returns ErrAmountMismatch", func(t *testing.T) {
		bc := &mockBookingClient{booking: &BookingDetail{
			BookingRef: "QM7X2K", Status: "PENDING",
			TotalAmountMinor: 999999, Currency: "THB",
		}}
		svc := NewService(bc, &mockOmiser{}, &mockRepository{})

		p, err := svc.Charge(context.Background(), validReq)

		assert.ErrorIs(t, err, ErrAmountMismatch)
		assert.Nil(t, p)
	})

	t.Run("currency mismatch returns ErrAmountMismatch", func(t *testing.T) {
		bc := &mockBookingClient{booking: &BookingDetail{
			BookingRef: "QM7X2K", Status: "PENDING",
			TotalAmountMinor: 350000, Currency: "USD",
		}}
		svc := NewService(bc, &mockOmiser{}, &mockRepository{})

		p, err := svc.Charge(context.Background(), validReq)

		assert.ErrorIs(t, err, ErrAmountMismatch)
		assert.Nil(t, p)
	})

	t.Run("card declined — persists FAILED record and returns FailedError", func(t *testing.T) {
		bc := &mockBookingClient{booking: pendingBooking}
		om := &mockOmiser{result: declinedCharge}
		repo := &mockRepository{}
		svc := NewService(bc, om, repo)

		p, err := svc.Charge(context.Background(), validReq)

		var pfe *FailedError
		require.ErrorAs(t, err, &pfe)
		assert.Equal(t, "insufficient_fund", pfe.FailureCode)
		assert.Nil(t, p)
		require.NotNil(t, repo.inserted)
		assert.Equal(t, "FAILED", repo.inserted.Status)
		assert.Equal(t, "insufficient_fund", repo.inserted.FailureCode)
	})

	t.Run("GetBooking error propagates", func(t *testing.T) {
		bc := &mockBookingClient{getErr: errors.New("service unavailable")}
		svc := NewService(bc, &mockOmiser{}, &mockRepository{})

		p, err := svc.Charge(context.Background(), validReq)

		assert.EqualError(t, err, "service unavailable")
		assert.Nil(t, p)
	})

	t.Run("Omise network error propagates", func(t *testing.T) {
		bc := &mockBookingClient{booking: pendingBooking}
		om := &mockOmiser{err: errors.New("omise timeout")}
		svc := NewService(bc, om, &mockRepository{})

		p, err := svc.Charge(context.Background(), validReq)

		assert.EqualError(t, err, "omise timeout")
		assert.Nil(t, p)
	})

	t.Run("repository insert error propagates", func(t *testing.T) {
		bc := &mockBookingClient{booking: pendingBooking}
		om := &mockOmiser{result: successCharge}
		repo := &mockRepository{err: errors.New("db down")}
		svc := NewService(bc, om, repo)

		p, err := svc.Charge(context.Background(), validReq)

		assert.EqualError(t, err, "db down")
		assert.Nil(t, p)
	})

	t.Run("ConfirmBooking error propagates", func(t *testing.T) {
		bc := &mockBookingClient{booking: pendingBooking, confirmErr: errors.New("qoomlee unreachable")}
		om := &mockOmiser{result: successCharge}
		repo := &mockRepository{}
		svc := NewService(bc, om, repo)

		p, err := svc.Charge(context.Background(), validReq)

		assert.EqualError(t, err, "qoomlee unreachable")
		assert.Nil(t, p)
	})

	// QML-008: duplicate payment prevention via repo check
	t.Run("repo has SUCCEEDED payment → ErrAlreadyPaid without calling Omise", func(t *testing.T) {
		repo := &mockRepository{getPayment: &Payment{Status: "SUCCEEDED", BookingRef: "QM7X2K"}}
		svc := NewService(&mockBookingClient{booking: pendingBooking}, &mockOmiser{}, repo)

		p, err := svc.Charge(context.Background(), validReq)

		assert.ErrorIs(t, err, ErrAlreadyPaid)
		assert.Nil(t, p)
	})

	t.Run("repo has FAILED payment → charge retry is permitted", func(t *testing.T) {
		repo := &mockRepository{getPayment: &Payment{Status: "FAILED", BookingRef: "QM7X2K"}}
		svc := NewService(&mockBookingClient{booking: pendingBooking}, &mockOmiser{result: successCharge}, repo)

		p, err := svc.Charge(context.Background(), validReq)

		require.NoError(t, err)
		assert.Equal(t, "SUCCEEDED", p.Status)
	})

	t.Run("repo.GetByBookingRef unknown error propagates", func(t *testing.T) {
		repo := &mockRepository{getErr: errors.New("db timeout")}
		svc := NewService(&mockBookingClient{booking: pendingBooking}, &mockOmiser{}, repo)

		p, err := svc.Charge(context.Background(), validReq)

		assert.EqualError(t, err, "db timeout")
		assert.Nil(t, p)
	})

	// QML-043: a lapsed seat hold must never be charged
	t.Run("EXPIRED booking returns ErrBookingExpired without calling Omise", func(t *testing.T) {
		bc := &mockBookingClient{booking: &BookingDetail{
			BookingRef: "QM7X2K", Status: "EXPIRED",
			TotalAmountMinor: 350000, Currency: "THB",
		}}
		om := &mockOmiser{result: successCharge}
		svc := NewService(bc, om, &mockRepository{})

		p, err := svc.Charge(context.Background(), validReq)

		assert.ErrorIs(t, err, ErrBookingExpired)
		assert.Nil(t, p)
	})
}
