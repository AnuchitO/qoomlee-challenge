package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gitlab.com/arise-by-infinitas/qoomlee/payment-service/db"
	"gitlab.com/arise-by-infinitas/qoomlee/payment-service/handler"
	"gitlab.com/arise-by-infinitas/qoomlee/payment-service/repository"
)

func main() {
	database, err := db.Connect()
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer database.Close()

	repo := repository.NewPaymentRepository(database)
	h, err := handler.NewPaymentHandler(repo)
	if err != nil {
		log.Fatalf("failed to init payment handler: %v", err)
	}

	r := gin.Default()
	h.RegisterRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}
	log.Printf("payment-service listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
