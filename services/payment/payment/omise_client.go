package payment

import (
	"context"
	"errors"
	"time"

	omise "github.com/omise/omise-go"
	"github.com/omise/omise-go/operations"
)

// OmiseClient is the live implementation of Omiser using the Omise Go SDK.
type OmiseClient struct {
	client *omise.Client
}

// NewOmiseClient creates an OmiseClient from env-supplied API keys.
func NewOmiseClient(publicKey, secretKey string) (*OmiseClient, error) {
	c, err := omise.NewClient(publicKey, secretKey)
	if err != nil {
		return nil, err
	}
	return &OmiseClient{client: c}, nil
}

func (o *OmiseClient) toFailedError(err error) error {
	var omiseErr *omise.Error
	if errors.As(err, &omiseErr) {
		return &FailedError{FailureCode: omiseErr.Code, FailureMessage: omiseErr.Message}
	}
	return err
}

// CreateCharge tokenizes the card details and then creates a charge with Omise.
// Callers never interact with Omise directly.
func (o *OmiseClient) CreateCharge(_ context.Context, req ChargeRequest) (*ChargeResult, error) {
	// Step 1: create a card token from raw card details
	token := &omise.Token{}
	if err := o.client.Do(token, &operations.CreateToken{
		Name:            req.CardName,
		Number:          req.CardNumber,
		ExpirationMonth: time.Month(req.ExpirationMonth),
		ExpirationYear:  req.ExpirationYear,
		SecurityCode:    req.SecurityCode,
	}); err != nil {
		return nil, o.toFailedError(err)
	}

	// Step 2: charge the token
	charge := &omise.Charge{}
	if err := o.client.Do(charge, &operations.CreateCharge{
		Amount:   req.AmountMinor,
		Currency: req.Currency,
		Card:     token.ID,
	}); err != nil {
		return nil, o.toFailedError(err)
	}

	result := &ChargeResult{
		ProviderChargeID: charge.ID,
		Status:           string(charge.Status),
	}
	if charge.FailureCode != nil {
		result.FailureCode = *charge.FailureCode
	}
	if charge.FailureMessage != nil {
		result.FailureMessage = *charge.FailureMessage
	}
	return result, nil
}
