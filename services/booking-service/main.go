package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gitlab.com/arise-by-infinitas/qoomlee/booking-service/db"
	"gitlab.com/arise-by-infinitas/qoomlee/booking-service/handler"
	"gitlab.com/arise-by-infinitas/qoomlee/booking-service/repository"
)

func main() {
	database, err := db.Connect()
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer database.Close()

	repo := repository.NewBookingRepository(database)
	h := handler.NewBookingHandler(repo)

	r := gin.Default()
	h.RegisterRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	log.Printf("booking-service listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
