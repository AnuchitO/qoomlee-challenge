package flight

import (
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// Search handles GET /api/flights/search
//
// @Summary Search flights
// @Description Public endpoint — searches flights by origin, destination, and date (interpreted as a Bangkok/BKK calendar day). No authentication required.
// @Tags Flights
// @Produce json
// @Param origin query string true "Origin IATA code"
// @Param destination query string true "Destination IATA code"
// @Param date query string true "Travel date, YYYY-MM-DD (interpreted in BKK time)"
// @Param passengers query int false "Number of passengers, must be >= 1" default(1)
// @Success 200 {object} object{flights=[]flight.Flight}
// @Failure 400 {object} object{error=string,message=string} "MISSING_REQUIRED_FIELD (origin/destination/date missing), INVALID_DATE_FORMAT (date not YYYY-MM-DD), or INVALID_FIELD (passengers not a positive integer)"
// @Router /api/flights/search [get]
func (h *Handler) Search(c *gin.Context) {
	origin := c.Query("origin")
	destination := c.Query("destination")
	dateStr := c.Query("date")
	passengersStr := c.DefaultQuery("passengers", "1")

	if origin == "" || destination == "" || dateStr == "" {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "origin, destination, and date are required"))
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, apiErr("INVALID_DATE_FORMAT", "date must be in YYYY-MM-DD format"))
		return
	}

	passengers, err := strconv.Atoi(passengersStr)
	if err != nil || passengers < 1 {
		c.JSON(http.StatusBadRequest, apiErr("INVALID_FIELD", "passengers must be a positive integer"))
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
		c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		return
	}

	c.JSON(http.StatusOK, gin.H{"flights": flights})
}
