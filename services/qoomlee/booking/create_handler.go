package booking

import (
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Create handles POST /api/bookings
//
// @Summary Create a booking
// @Description Creates a booking for a flight (and optionally a return flight, for a round trip) on behalf of the caller's opaque session. The total amount is computed server-side from the flight's price; the client never supplies an amount. Pass ?bookingToken= to make retried submissions (e.g. back-navigation) idempotent. On success, expiresAt is present only when the created booking is PENDING (i.e. it has a seat-hold deadline); it is omitted once no hold applies.
// @Tags Bookings
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param bookingToken query string false "Idempotency token to prevent duplicate bookings on retry/back-navigation"
// @Param request body booking.CreateRequest true "Booking request (flightId, optional returnFlightId, passenger)"
// @Success 201 {object} object{bookingId=int64,bookingRef=string,expiresAt=string}
// @Failure 400 {object} object{error=string,message=string} "MISSING_REQUIRED_FIELD — invalid body, missing flightId, or missing passenger firstName/lastName/email"
// @Failure 401 {object} object{error=string,message=string} "UNAUTHORIZED — missing or malformed session token"
// @Failure 409 {object} object{error=string,message=string} "NO_SEATS_AVAILABLE"
// @Router /api/bookings [post]
func (h *Handler) Create(c *gin.Context) {
	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "invalid request body"))
		return
	}

	if req.FlightID == 0 {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "flightId is required"))
		return
	}
	if req.Passenger.FirstName == "" || req.Passenger.LastName == "" || req.Passenger.Email == "" {
		c.JSON(http.StatusBadRequest, apiErr("MISSING_REQUIRED_FIELD", "passenger firstName, lastName, and email are required"))
		return
	}

	req.UserSub = userSub(c)
	req.BookingToken = c.Query("bookingToken")

	b, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, ErrNoSeatsAvailable) {
			c.JSON(http.StatusConflict, apiErr("NO_SEATS_AVAILABLE", "no seats available on this flight"))
			return
		}
		slog.Error("create booking failed", "err", err)
		c.JSON(http.StatusInternalServerError, apiErr("INTERNAL_ERROR", "An unexpected error occurred."))
		return
	}

	resp := gin.H{
		"bookingId":  b.ID,
		"bookingRef": b.BookingRef,
	}
	if b.ExpiresAt != nil {
		resp["expiresAt"] = b.ExpiresAt.Format(time.RFC3339)
	}
	c.JSON(http.StatusCreated, resp)
}

// userSub returns the opaque session token set by middleware.SessionAuth,
// used to identify (and scope bookings to) an anonymous user, or "" if absent.
func userSub(c *gin.Context) string {
	return c.GetString("userSub")
}
