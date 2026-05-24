package handler

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gitlab.com/arise-by-infinitas/qoomlee/flight-service/model"
	"gitlab.com/arise-by-infinitas/qoomlee/flight-service/repository"
)

type FlightHandler struct {
	repo *repository.FlightRepository
}

func NewFlightHandler(repo *repository.FlightRepository) *FlightHandler {
	return &FlightHandler{repo: repo}
}

// RegisterRoutes wires handler methods to a gin.Engine.
func (h *FlightHandler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/flights")
	api.GET("/search", h.Search)
	api.GET("/:id", h.GetByID)
}

// Search — WORKING: queries DB, returns list of matching flights.
//
// GET /api/flights/search?origin=BKK&destination=SIN&date=2026-06-15&passengers=1
func (h *FlightHandler) Search(c *gin.Context) {
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

	flights, err := h.repo.Search(origin, destination, date, passengers)
	if err != nil {
		log.Printf("ERROR Search origin=%s destination=%s date=%s: %v", origin, destination, dateStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "INTERNAL_ERROR",
			"message": "An unexpected error occurred.",
		})
		return
	}

	if flights == nil {
		flights = []model.Flight{}
	}
	c.JSON(http.StatusOK, model.FlightSearchResponse{Flights: flights})
}

// GetByID — TODO: implement.
//
// GET /api/flights/:id
// Response: single Flight object (same fields as search result)
func (h *FlightHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "INVALID_FIELD",
			"message": "id must be an integer",
		})
		return
	}

	// TODO: implement
	_ = id
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
