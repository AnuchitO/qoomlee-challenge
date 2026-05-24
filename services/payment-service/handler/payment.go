package handler

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	omise "github.com/omise/omise-go"
	"github.com/omise/omise-go/operations"
	"gitlab.com/arise-by-infinitas/qoomlee/payment-service/model"
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
	api := r.Group("/api/payments")
	api.POST("/charge", h.Charge)
	api.GET("/:bookingRef", h.GetByBookingRef)
}

// Charge — WORKING: calls real Omise test API, records payment in DB.
//
// POST /api/payments/charge
func (h *PaymentHandler) Charge(c *gin.Context) {
	var req model.ChargeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "MISSING_REQUIRED_FIELD",
			"message": err.Error(),
		})
		return
	}
	if req.Currency == "" {
		req.Currency = "THB"
	}

	// Create charge via Omise
	charge := &omise.Charge{}
	err := h.omiseClient.Do(charge, &operations.CreateCharge{
		Amount:   req.Amount,
		Currency: req.Currency,
		Card:     req.OmiseToken,
	})

	// Record payment attempt regardless of outcome
	status := "PENDING"
	var paidAt *time.Time
	var failureCode, failureMessage string

	if err != nil {
		status = "FAILED"
		if omiseErr, ok := err.(*omise.Error); ok {
			failureCode = omiseErr.Code
			failureMessage = omiseErr.Message
		} else {
			failureMessage = err.Error()
		}
	} else if charge.Status == "successful" {
		status = "SUCCEEDED"
		now := time.Now()
		paidAt = &now
	} else {
		status = "FAILED"
		failureCode = charge.FailureCode
		failureMessage = charge.FailureMessage
	}

	payment, dbErr := h.repo.Insert(&model.Payment{
		BookingRef:     req.BookingRef,
		BookingID:      req.BookingID,
		Amount:         req.Amount,
		Currency:       req.Currency,
		Status:         status,
		OmiseChargeID:  charge.ID,
		FailureCode:    failureCode,
		FailureMessage: failureMessage,
		PaidAt:         paidAt,
	})
	if dbErr != nil {
		log.Printf("ERROR Charge db insert bookingRef=%s: %v", req.BookingRef, dbErr)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "INTERNAL_ERROR",
			"message": "An unexpected error occurred.",
		})
		return
	}

	if status == "FAILED" {
		c.JSON(http.StatusPaymentRequired, model.ChargeErrorResponse{
			Error:          "payment_failed",
			FailureCode:    failureCode,
			FailureMessage: failureMessage,
		})
		return
	}

	c.JSON(http.StatusCreated, model.ChargeResponse{
		PaymentID:     payment.ID,
		OmiseChargeID: charge.ID,
		Status:        status,
		Amount:        req.Amount,
		Currency:      req.Currency,
		PaidAt:        paidAt,
	})
}

// GetByBookingRef — TODO: implement.
//
// GET /api/payments/:bookingRef
// Response: Payment object
func (h *PaymentHandler) GetByBookingRef(c *gin.Context) {
	bookingRef := c.Param("bookingRef")
	if bookingRef == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "MISSING_REQUIRED_FIELD",
			"message": "bookingRef is required",
		})
		return
	}

	// TODO: implement
	_ = bookingRef
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
