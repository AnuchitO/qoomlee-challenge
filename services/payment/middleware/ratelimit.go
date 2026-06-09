package middleware

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type ipLimiterStore struct {
	mu       sync.Mutex
	limiters map[string]*rate.Limiter
	r        rate.Limit
	b        int
}

func newIPLimiterStore(r rate.Limit, b int) *ipLimiterStore {
	return &ipLimiterStore{
		limiters: make(map[string]*rate.Limiter),
		r:        r,
		b:        b,
	}
}

func (s *ipLimiterStore) get(ip string) *rate.Limiter {
	s.mu.Lock()
	defer s.mu.Unlock()
	lim, ok := s.limiters[ip]
	if !ok {
		lim = rate.NewLimiter(s.r, s.b)
		s.limiters[ip] = lim
	}
	return lim
}

// RateLimit returns per-IP rate-limiting middleware.
// r = sustained requests/second; b = burst size.
func RateLimit(r rate.Limit, b int) gin.HandlerFunc {
	store := newIPLimiterStore(r, b)
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !store.get(ip).Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "RATE_LIMIT_EXCEEDED",
				"message": "too many requests — please slow down",
			})
			return
		}
		c.Next()
	}
}
