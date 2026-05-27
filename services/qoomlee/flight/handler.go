package flight

import (
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// Handler holds dependencies for flight HTTP handlers.
type Handler struct {
	svc Service
}

// NewHandler creates a new flight Handler.
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// Search handles GET /api/flights/search
func (h *Handler) Search(c *gin.Context) {
	origin := c.Query("origin")
	destination := c.Query("destination")
	dateStr := c.Query("date")
	passengersStr := c.DefaultQuery("passengers", "1")

	if origin == "" || destination == "" || dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "MISSING_REQUIRED_FIELD",
			"message": "origin, destination, and date are required",
		})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "INVALID_DATE_FORMAT",
			"message": "date must be in YYYY-MM-DD format",
		})
		return
	}

	passengers, err := strconv.Atoi(passengersStr)
	if err != nil || passengers < 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "INVALID_FIELD",
			"message": "passengers must be a positive integer",
		})
		return
	}

	dateFrom, dateTo := bkkDateToUTCRange(date)

	flights, err := h.svc.Search(c.Request.Context(), SearchParams{
		Origin:      origin,
		Destination: destination,
		DateFrom:    dateFrom,
		DateTo:      dateTo,
		Passengers:  passengers,
	})
	if err != nil {
		slog.Error("search flights failed", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "INTERNAL_ERROR",
			"message": "An unexpected error occurred.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"flights": flights})
}

// GetByID handles GET /api/flights/:id
func (h *Handler) GetByID(c *gin.Context) {
	// TODO: implement in GREEN phase
	c.JSON(http.StatusNotImplemented, gin.H{"error": "NOT_IMPLEMENTED", "message": "not yet implemented"})
}
