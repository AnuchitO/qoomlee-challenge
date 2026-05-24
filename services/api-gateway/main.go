package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	routes := map[string]string{
		"/api/flights":  mustGetenv("FLIGHT_SERVICE_URL", "http://localhost:8081"),
		"/api/bookings": mustGetenv("BOOKING_SERVICE_URL", "http://localhost:8082"),
		"/api/payments": mustGetenv("PAYMENT_SERVICE_URL", "http://localhost:8084"),
	}

	r := gin.Default()

	r.GET("/health/live", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "api-gateway"})
	})
	r.GET("/health/ready", func(c *gin.Context) {
		// api-gateway has no DB — ready when the process is running
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "api-gateway"})
	})

	for prefix, target := range routes {
		targetURL, err := url.Parse(target)
		if err != nil {
			log.Fatalf("invalid target URL for %s: %v", prefix, err)
		}
		proxy := httputil.NewSingleHostReverseProxy(targetURL)
		r.Any(prefix+"/*path", gin.WrapH(proxy))
	}

	port := mustGetenv("PORT", "8080")
	log.Printf("api-gateway listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func mustGetenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
