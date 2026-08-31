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
// @Summary Get payment receipt by booking reference
// @Description Returns the payment record for a booking reference. Covers both succeeded and failed payment states: failureCode/failureMessage are populated (omitempty) only for a failed payment, and paidAt is non-null only once the payment has succeeded.
// @Tags Payments
// @Produce json
// @Security BearerAuth
// @Param bookingRef path string true "Booking reference"
// @Success 200 {object} payment.ReceiptResponse
// @Failure 401 {object} object{error=string,message=string} "UNAUTHORIZED"
// @Failure 404 {object} object{error=string,message=string} "NOT_FOUND — no payment record exists for this booking reference"
// @Router /api/payments/{bookingRef} [get]
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
// @Summary Charge a booking with a card
// @Description Charges the given booking by tokenizing and charging the supplied raw card fields server-side via Omise, then marks the booking confirmed on success. Rate limited per client IP to 10 requests/second sustained with a burst of 20; requests beyond that are rejected with 429. Test cards: 4242424242424242 (success), 4111111111111111 (decline, insufficient_fund).
// @Tags Payments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body payment.ChargeRequest true "Charge request (raw card fields — tokenized server-side, never sent to the client)"
// @Success 201 {object} payment.ChargeResponse
// @Failure 400 {object} object{error=string,message=string} "MISSING_REQUIRED_FIELD (bookingRef, cardNumber, expirationMonth/expirationYear, or amountMinor missing) or AMOUNT_MISMATCH (amountMinor/currency does not match the booking total)"
// @Failure 401 {object} object{error=string,message=string} "UNAUTHORIZED"
// @Failure 402 {object} object{error=string,failureCode=string,failureMessage=string} "PAYMENT_FAILED — card declined by the provider"
// @Failure 409 {object} object{error=string,message=string} "Two distinct shapes: booking_expired -> {\"error\":\"booking_expired\"} (no message field, seat hold expired); ALREADY_PAID -> {\"error\":\"ALREADY_PAID\",\"message\":...} (booking already paid)"
// @Failure 429 {object} object{error=string,message=string} "RATE_LIMIT_EXCEEDED — per-IP limit of 10 req/s (burst 20) exceeded"
// @Failure 500 {object} object{error=string,message=string} "INTERNAL_ERROR"
// @Router /api/payments/charge [post]
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
