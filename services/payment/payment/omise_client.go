package payment

import (
	"context"

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

func (o *OmiseClient) CreateCharge(_ context.Context, token string, amount int64, currency string) (*ChargeResult, error) {
	charge := &omise.Charge{}
	if err := o.client.Do(charge, &operations.CreateCharge{
		Amount:   amount,
		Currency: currency,
		Card:     token,
	}); err != nil {
		return nil, err
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
