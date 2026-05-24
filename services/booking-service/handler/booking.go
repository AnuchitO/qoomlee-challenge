package handler

import (
	"log"
	"math/rand"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gitlab.com/arise-by-infinitas/qoomlee/booking-service/model"
	"gitlab.com/arise-by-infinitas/qoomlee/booking-service/repository"
)

const pnrChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

type BookingHandler struct {
	repo *repository.BookingRepository
}

func NewBookingHandler(repo *repository.BookingRepository) *BookingHandler {
	return &BookingHandler{repo: repo}
}

// RegisterRoutes wires handler methods to a gin.Engine.
func (h *BookingHandler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/bookings")
	api.POST("", h.Create)
	api.GET("/:bookingRef", h.GetByRef)
	api.PUT("/:bookingRef/status", h.UpdateStatus)
}

// Create — WORKING: creates passenger + booking in one transaction, returns PNR.
//
// POST /api/bookings
func (h *BookingHandler) Create(c *gin.Context) {
	var req model.CreateBookingRequest
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

	passengerID, err := h.repo.InsertPassenger(&req.Passenger)
	if err != nil {
		log.Printf("ERROR Create InsertPassenger: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "INTERNAL_ERROR",
			"message": "An unexpected error occurred.",
		})
		return
	}

	booking := &model.Booking{
		BookingRef:  generatePNR(),
		FlightID:    req.FlightID,
		PassengerID: passengerID,
		TotalAmount: req.TotalAmount,
		Currency:    req.Currency,
	}

	saved, err := h.repo.InsertBooking(booking)
	if err != nil {
		if strings.Contains(err.Error(), "no seats available") {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "NO_SEATS_AVAILABLE",
				"message": "No seats available on this flight.",
			})
			return
		}
		log.Printf("ERROR Create InsertBooking: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "INTERNAL_ERROR",
			"message": "An unexpected error occurred.",
		})
		return
	}

	c.JSON(http.StatusCreated, model.CreateBookingResponse{
		BookingRef: saved.BookingRef,
		BookingID:  saved.ID,
		Status:     saved.Status,
		Message:    "Booking created. Proceed to payment.",
	})
}

// GetByRef — TODO: implement.
//
// GET /api/bookings/:bookingRef
// Response: full Booking object
func (h *BookingHandler) GetByRef(c *gin.Context) {
	bookingRef := strings.ToUpper(c.Param("bookingRef"))
	if len(bookingRef) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "INVALID_FIELD",
			"message": "bookingRef must be exactly 6 characters",
		})
		return
	}

	// TODO: implement
	_ = bookingRef
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

// UpdateStatus — TODO: implement (called internally by payment-service after charge).
//
// PUT /api/bookings/:bookingRef/status
// Body: {"status": "CONFIRMED"}
func (h *BookingHandler) UpdateStatus(c *gin.Context) {
	bookingRef := strings.ToUpper(c.Param("bookingRef"))

	var req model.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "MISSING_REQUIRED_FIELD",
			"message": "status is required",
		})
		return
	}

	allowed := map[string]bool{"CONFIRMED": true, "CANCELLED": true, "PENDING": true}
	if !allowed[req.Status] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "INVALID_STATUS",
			"message": "status must be one of: PENDING, CONFIRMED, CANCELLED",
		})
		return
	}

	// TODO: implement — look up booking, update status, return updated booking
	_ = bookingRef
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

func generatePNR() string {
	b := make([]byte, 6)
	for i := range b {
		b[i] = pnrChars[rand.Intn(len(pnrChars))]
	}
	return string(b)
}
