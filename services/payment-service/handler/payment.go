package handler

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	omise "github.com/omise/omise-go"
	"gitlab.com/arise-by-infinitas/qoomlee/payment-service/repository"
)

type PaymentHandler struct {
	repo        *repository.PaymentRepository
	omiseClient *omise.Client
}

func NewPaymentHandler(repo *repository.PaymentRepository) (*PaymentHandler, error) {
	client, err := omise.NewClient(
		os.Getenv("OMISE_PUBLIC_KEY"),
		os.Getenv("OMISE_SECRET_KEY"),
	)
	if err != nil {
		return nil, err
	}
	return &PaymentHandler{repo: repo, omiseClient: client}, nil
}

// RegisterRoutes wires handler methods to a gin.Engine.
func (h *PaymentHandler) RegisterRoutes(r *gin.Engine) {
	r.GET("/health/live",  h.HealthLive)
	r.GET("/health/ready", h.HealthReady)

	api := r.Group("/api/payments")
	api.POST("/charge", h.Charge)
	api.GET("/:bookingRef", h.GetByBookingRef)
}

func (h *PaymentHandler) HealthLive(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "payment-service"})
}

// HealthReady checks the DB connection.
// TODO: inject *sql.DB so you can call db.PingContext here.
func (h *PaymentHandler) HealthReady(c *gin.Context) {
	// TODO: implement — ping DB, return 503 if unreachable
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "payment-service"})
}

// Charge — POST /api/payments/charge
//
// Flow:
//  1. Parse and validate request (bookingRef, bookingId, omiseToken, amount)
//  2. Check booking is not already CONFIRMED → 409 ALREADY_PAID
//  3. Call Omise CreateCharge with amount (satang) + omiseToken
//  4. Record the payment in the DB (SUCCEEDED or FAILED)
//  5. If SUCCEEDED: call PUT /api/bookings/:ref/status {"status":"CONFIRMED"}
//     (if this call fails: log it, but still return 201)
//  6. If FAILED: return 402 with failureCode and failureMessage
//     (booking status stays PENDING — the client can retry with a new token)
//
// See CHALLENGE.md for Omise SDK usage and the satang explanation.
//
// Response 201: ChargeResponse
// Response 400: MISSING_REQUIRED_FIELD / INVALID_FIELD
// Response 402: payment_failed (card declined)
// Response 409: ALREADY_PAID
//
// TODO: implement
func (h *PaymentHandler) Charge(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

// GetByBookingRef — GET /api/payments/:bookingRef
//
// Returns the most recent payment record for a booking.
//
// Response 200: Payment
// Response 404: { "error": "PAYMENT_NOT_FOUND", ... }
//
// TODO: implement
func (h *PaymentHandler) GetByBookingRef(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
