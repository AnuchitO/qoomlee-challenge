package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
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
	r.GET("/health/live",  h.HealthLive)
	r.GET("/health/ready", h.HealthReady)

	api := r.Group("/api/flights")
	api.GET("/search", h.Search)
	api.GET("/:id", h.GetByID)
}

func (h *FlightHandler) HealthLive(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "flight-service"})
}

// HealthReady checks the DB connection.
// TODO: inject *sql.DB into the handler so you can call db.PingContext here.
func (h *FlightHandler) HealthReady(c *gin.Context) {
	// TODO: implement — ping DB, return 503 if unreachable
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "flight-service"})
}

// Search — GET /api/flights/search
//
// Required query params: origin, destination, date (YYYY-MM-DD)
// Optional query params: passengers (default 1)
//
// Response 200: { "flights": [ ...FlightDto ] }
//
// TODO: implement
func (h *FlightHandler) Search(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

// GetByID — GET /api/flights/:id
//
// Response 200: single FlightDto
// Response 404: { "error": "FLIGHT_NOT_FOUND", "message": "Flight 99 not found" }
//
// TODO: implement
func (h *FlightHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	_, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "INVALID_FIELD",
			"message": "id must be an integer",
		})
		return
	}

	// TODO: implement — call repo.GetByID, handle ErrNotFound → 404, other errors → 500
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}
