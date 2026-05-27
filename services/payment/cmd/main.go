package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func getting(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "payment"})
}

func main() {
	router := gin.Default()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}

	router.GET("/health/live", getting)
	router.GET("/health/ready", getting)
	router.Run(":" + port)
}
