# Qoomlee System — Technology Stack

> All services use **Go + Gin**. No other languages or frameworks.

## Backend Services

| Service | Language | Framework | Port |
|---------|----------|-----------|------|
| flight-service | Go | Gin | 8081 |
| booking-service | Go | Gin | 8082 |
| payment-service | Go | Gin + Omise SDK | 8084 |

## Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL 16 | Single shared DB for all services |
| Container | Docker Compose | `docker compose up --build` |

## Testing Stack

| Layer | Tool | Command |
|-------|------|---------|
| Unit tests | Go `testing` + `testify/assert` + `testify/mock` | `go test ./...` |
| Integration tests | `testcontainers-go` (real PostgreSQL) | `go test ./... -tags=integration` |
| Contract / API tests | `curl` or Go `net/http` | against live `docker compose` stack |
| Load tests | K6 | `k6 run tests/k6/search.js` |

## Key Go Dependencies

```
github.com/gin-gonic/gin                       — HTTP router and middleware (all services)
github.com/golang-jwt/jwt/v5                   — JWT RS256 verification middleware (all services)
github.com/lib/pq                              — PostgreSQL driver (all services)
github.com/omise/omise-go                      — Omise payment SDK (payment-service only)
github.com/stretchr/testify                    — Test assertions and mocks
github.com/testcontainers/testcontainers-go    — Real PostgreSQL containers for integration tests
golang.org/x/time/rate                         — Token-bucket rate limiter
log/slog                                       — Structured JSON logging (Go stdlib ≥ 1.21)
```

## Go Service Structure

Every service follows the same layout:

```
services/{name}/
  main.go             — Gin engine setup, dependency wiring, graceful shutdown
  handler/
    {domain}.go       — HTTP layer: parse request → call repo → write JSON response
  repository/
    {domain}.go       — SQL layer: all queries; returns domain structs
  model/
    {domain}.go       — Shared struct definitions (request DTOs, response DTOs, DB models)
  db/
    postgres.go       — DB connection helper (reads env vars)
  go.mod / go.sum
  Dockerfile
```

No `service/` layer is required — for these endpoint sizes, handler → repository is sufficient.
Add a `service/` layer if your business logic grows complex enough to warrant it.

## Environment Variables

| Variable | Used by | Value in docker-compose |
|---|---|---|
| `PORT` | All services | 8081 / 8082 / 8084 |
| `DB_HOST` | All services | `postgres` |
| `DB_PORT` | All services | `5432` |
| `DB_NAME` | All services | `qoomlee` |
| `DB_USER` | All services | `qoomlee` |
| `DB_PASS` | All services | `qoomlee` (override in `.env`) |
| `OMISE_PUBLIC_KEY` | payment-service | `pkey_test_...` — set in `.env` |
| `OMISE_SECRET_KEY` | payment-service | `skey_test_...` — set in `.env` |
| `BOOKING_SERVICE_URL` | payment-service | `http://booking-service:8082` |
| `JWT_PUBLIC_KEY` | All services | RSA public key PEM — verifies incoming user JWTs |
| `JWT_PRIVATE_KEY` | **Test tooling only** (`make jwt-token`) | RSA private key PEM — never loaded by any service at runtime |
| `INTERNAL_TOKEN` | booking-service, payment-service | 256-bit random shared secret (`openssl rand -hex 32`) for `PUT /api/bookings/:ref/status`; compared with `crypto/subtle.ConstantTimeCompare` |

## Go Patterns Used in This Project

**Gin handler:**
```go
func (h *FlightHandler) Search(c *gin.Context) {
    origin := c.Query("origin")
    if origin == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   "MISSING_REQUIRED_FIELD",
            "message": "origin is required",
        })
        return
    }
    flights, err := h.repo.Search(origin, ...)
    if err != nil {
        slog.Error("Search failed", "err", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "INTERNAL_ERROR", "message": "An unexpected error occurred.",
        })
        return
    }
    c.JSON(http.StatusOK, gin.H{"flights": flights})
}
```

**Repository with sentinel error:**
```go
var ErrNotFound = errors.New("not found")

func (r *FlightRepository) GetByID(id int64) (*model.Flight, error) {
    var f model.Flight
    err := r.db.QueryRow(`SELECT ... WHERE id = $1`, id).Scan(&f.ID, ...)
    if err == sql.ErrNoRows {
        return nil, ErrNotFound
    }
    if err != nil {
        return nil, fmt.Errorf("GetByID: %w", err)
    }
    return &f, nil
}
```

**Handler mapping sentinel error to HTTP status:**
```go
flight, err := h.repo.GetByID(id)
if errors.Is(err, repository.ErrNotFound) {
    c.JSON(http.StatusNotFound, gin.H{
        "error":   "FLIGHT_NOT_FOUND",
        "message": fmt.Sprintf("Flight %d not found", id),
    })
    return
}
if err != nil {
    slog.Error("GetByID failed", "id", id, "err", err)
    c.JSON(http.StatusInternalServerError, gin.H{
        "error": "INTERNAL_ERROR", "message": "An unexpected error occurred.",
    })
    return
}
```

**Graceful shutdown:**
```go
srv := &http.Server{Addr: ":" + port, Handler: r}
go func() { srv.ListenAndServe() }()

quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
srv.Shutdown(ctx)
db.Close()
```
