package payment

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Handler holds dependencies for payment HTTP handlers.
type Handler struct {
	svc Service
}

// NewHandler creates a new payment Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func apiErr(code, message string) gin.H {
	return gin.H{"error": code, "message": message}
}

// GetByBookingRef handles GET /api/payments/:bookingRef
func (h *Handler) GetByBookingRef(c *gin.Context) {
	ref := c.Param("bookingRef")

	p, err := h.svc.GetByBookingRef(c.Request.Context(), ref)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			c.JSON(http.StatusNotFound, apiErr("NOT_FOUND", "payment not found for booking "+ref))
			return
		}
		slog.Error("get payment failed", "err", err)
		c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		return
	}

	resp := ReceiptResponse{
		BookingRef:       p.BookingRef,
		PaymentProvider:  p.PaymentProvider,
		ProviderChargeID: p.ProviderChargeID,
		Status:           p.Status,
		AmountMinor:      p.AmountMinor,
		Currency:         p.Currency,
		Amount:           fmt.Sprintf("%.2f", float64(p.AmountMinor)/100),
		FailureCode:      p.FailureCode,
		FailureMessage:   p.FailureMessage,
	}
	if !p.PaidAt.IsZero() {
		paidAt := p.PaidAt.UTC().Format(time.RFC3339)
		resp.PaidAt = &paidAt
	}

	c.JSON(http.StatusOK, resp)
}

// Charge handles POST /api/payments/charge
func (h *Handler) Charge(c *gin.Context) {
	var req ChargeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "invalid request body"))
		return
	}

	if req.BookingRef == "" {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "bookingRef is required"))
		return
	}
	if req.CardNumber == "" {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "cardNumber is required"))
		return
	}
	if req.ExpirationMonth == 0 || req.ExpirationYear == 0 {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "expirationMonth and expirationYear are required"))
		return
	}
	if req.AmountMinor == 0 {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "amountMinor is required"))
		return
	}

	p, err := h.svc.Charge(c.Request.Context(), req)
	if err != nil {
		var pfe *FailedError
		switch {
		case errors.Is(err, ErrBookingExpired):
			c.JSON(http.StatusConflict, gin.H{"error": "booking_expired"})
		case errors.Is(err, ErrAlreadyPaid):
			c.JSON(http.StatusConflict, apiErr("ALREADY_PAID", "booking "+req.BookingRef+" has already been paid"))
		case errors.Is(err, ErrAmountMismatch):
			c.JSON(http.StatusBadRequest, apiErr("AMOUNT_MISMATCH", "amount does not match booking total"))
		case errors.As(err, &pfe):
			c.JSON(http.StatusPaymentRequired, gin.H{
				"error":          "PAYMENT_FAILED",
				"failureCode":    pfe.FailureCode,
				"failureMessage": pfe.FailureMessage,
			})
		default:
			slog.Error("charge payment failed", "err", err)
			c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		}
		return
	}

	c.JSON(http.StatusCreated, ChargeResponse{
		PaymentID:        p.ID,
		PaymentProvider:  p.PaymentProvider,
		ProviderChargeID: p.ProviderChargeID,
		Status:           p.Status,
		AmountMinor:      p.AmountMinor,
		Currency:         p.Currency,
		Amount:           fmt.Sprintf("%.2f", float64(p.AmountMinor)/100),
		PaidAt:           p.PaidAt.UTC().Format(time.RFC3339),
	})
}
