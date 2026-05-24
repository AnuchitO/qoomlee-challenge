package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
)

func main() {
	routes := map[string]string{
		"/api/flights":  mustGetenv("FLIGHT_SERVICE_URL", "http://localhost:8081"),
		"/api/bookings": mustGetenv("BOOKING_SERVICE_URL", "http://localhost:8082"),
		"/api/payments": mustGetenv("PAYMENT_SERVICE_URL", "http://localhost:8084"),
	}

	mux := http.NewServeMux()

	for prefix, target := range routes {
		prefix := prefix // capture loop variable
		targetURL, err := url.Parse(target)
		if err != nil {
			log.Fatalf("invalid target URL for %s: %v", prefix, err)
		}
		proxy := httputil.NewSingleHostReverseProxy(targetURL)
		mux.HandleFunc(prefix+"/", withCORS(proxy))
		mux.HandleFunc(prefix, withCORS(proxy))
	}

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`)) //nolint:errcheck
	})

	port := mustGetenv("PORT", "8080")
	log.Printf("api-gateway listening on :%s", port)
	log.Printf("routes: %v", routeKeys(routes))
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func withCORS(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		h.ServeHTTP(w, r)
	}
}

func mustGetenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func routeKeys(m map[string]string) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}


