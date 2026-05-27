package flight

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

var bkkLoc = time.FixedZone("UTC+7", 7*60*60)

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

	dateFrom, dateTo := bkkDateToUTCRange(date)

	params := SearchParams{
		Origin:      origin,
		Destination: destination,
		DateFrom:    dateFrom,
		DateTo:      dateTo,
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

	if flights == nil {
		flights = []Flight{}
	}
	for i := range flights {
		enrichFlight(&flights[i])
	}

	c.JSON(http.StatusOK, gin.H{"flights": flights})
}

// bkkDateToUTCRange converts a local BKK date to a [start, end) UTC window.
func bkkDateToUTCRange(date time.Time) (start, end time.Time) {
	startBKK := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, bkkLoc)
	return startBKK.UTC(), startBKK.Add(24 * time.Hour).UTC()
}

// enrichFlight computes derived fields (BasePrice, DurationMinutes) in-place.
func enrichFlight(f *Flight) {
	f.BasePrice = fmt.Sprintf("%.2f", float64(f.BasePriceMinor)/100)
	f.DurationMinutes = int(f.ArrivalTime.Sub(f.DepartureTime).Minutes())
}
