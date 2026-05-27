package flight

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

const bkkOffset = 7 * 60 * 60 // UTC+7 in seconds

// Handler holds dependencies for flight HTTP handlers.
type Handler struct {
	repo Repository
}

// NewHandler creates a new flight Handler.
func NewHandler(repo Repository) *Handler {
	return &Handler{repo: repo}
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

	// Convert BKK (UTC+7) date to UTC range [start, end)
	bkkLoc := time.FixedZone("UTC+7", bkkOffset)
	startBKK := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, bkkLoc)
	endBKK := startBKK.Add(24 * time.Hour)

	params := SearchParams{
		Origin:      origin,
		Destination: destination,
		DateFrom:    startBKK.UTC(),
		DateTo:      endBKK.UTC(),
		Passengers:  passengers,
	}

	flights, err := h.repo.Search(c.Request.Context(), params)
	if err != nil {
		slog.Error("search flights failed", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "INTERNAL_ERROR",
			"message": "An unexpected error occurred.",
		})
		return
	}

	// Ensure we return an empty array (not null) when there are no results.
	if flights == nil {
		flights = []Flight{}
	}

	// Compute money display string and durationMinutes for each flight.
	for i := range flights {
		flights[i].BasePrice = fmt.Sprintf("%.2f", float64(flights[i].BasePriceMinor)/100)
		flights[i].DurationMinutes = int(flights[i].ArrivalTime.Sub(flights[i].DepartureTime).Minutes())
	}

	c.JSON(http.StatusOK, gin.H{"flights": flights})
}
