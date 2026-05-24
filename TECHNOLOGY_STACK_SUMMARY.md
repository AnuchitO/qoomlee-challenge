# Qoomlee System — Technology Stack

> Challenge scope: REST API only. All services use **Go + Gin**.

## Backend Services

| Service | Language | Framework | Port | Challenge scope |
|---------|----------|-----------|------|-----------------|
| API Gateway | Go | Gin | 8080 | Routes all `/api/*` — do not modify |
| flight-service | Go | Gin | 8081 | Implement `GET /api/flights/:id` |
| booking-service | Go | Gin | 8082 | Implement `GET /api/bookings/:ref` and `PUT /api/bookings/:ref/status` |
| payment-service | Go | Gin | 8084 | Implement `GET /api/payments/:ref` + duplicate-payment guard |
| checkin-service | Go | Gin | 8083 | **Out of scope — ignore** |

## Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL 16 | Single shared DB for all services |
| Cache | Redis 7 | Available but not required for this challenge |
| Container orchestration | Docker Compose | `docker compose up --build` starts everything |

## Testing Stack

| Layer | Tool | Command |
|-------|------|---------|
| Unit tests | Go `testing` + `testify/assert` + `testify/mock` | `go test ./...` |
| Integration tests | `testcontainers-go` (real PostgreSQL) | `go test ./... -tags=integration` |
| Contract / API tests | Go `net/http` or `curl` | against live `docker compose` stack |
| Load tests | **K6** | `k6 run tests/k6/search.js` |

## Key Dependencies (Go)

```
github.com/gin-gonic/gin          — HTTP router and middleware
github.com/lib/pq                 — PostgreSQL driver
github.com/omise/omise-go         — Omise payment SDK (payment-service only)
github.com/stretchr/testify       — Test assertions and mocks
github.com/testcontainers/testcontainers-go  — Integration test DB containers
```

## Go Service Structure Pattern

Every service follows the same layout:

```
services/{service-name}/
  main.go               — Gin setup, dependency wiring, route registration
  handler/
    {domain}.go         — HTTP handlers: parse request → call service → write response
  service/
    {domain}.go         — Business logic: validation, orchestration, PNR generation
  repository/
    {domain}.go         — SQL queries only; takes *sql.DB; returns domain structs
  model/
    {domain}.go         — Struct definitions shared across layers
  db/
    postgres.go         — DB connection helper (reads DATABASE_URL from env)
  go.mod / go.sum
  Dockerfile
```

## Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `POSTGRES_DB` | All services | Database name |
| `POSTGRES_USER` | All services | Database user |
| `POSTGRES_PASSWORD` | All services | Database password |
| `DATABASE_URL` | Go services | Full Postgres DSN |
| `OMISE_PUBLIC_KEY` | payment-service | Omise test public key (`pkey_test_...`) |
| `OMISE_SECRET_KEY` | payment-service | Omise test secret key (`skey_test_...`) |
| `BOOKING_SERVICE_URL` | payment-service | `http://booking-service:8082` |
| `FLIGHT_SERVICE_URL` | booking-service | `http://flight-service:8081` |
| `PORT` | Go services | Listening port |

## Development Guidelines

- **Go:** Follow [Effective Go](https://go.dev/doc/effective_go). Use `context.Context` for DB and HTTP calls. Return `(T, error)` not panic.
- **Gin:** Use `c.ShouldBindJSON()` for request parsing. Use `c.JSON(status, payload)` for responses.
- **Errors:** Define sentinel errors (`var ErrNotFound = errors.New("not found")`) in the repository layer. Map to HTTP status in the handler layer.
- **No ORM:** Use raw `database/sql` with `lib/pq`. Write SQL explicitly — it is clearer and easier to test.
- **Interfaces:** Define a repository interface in the service layer so unit tests can mock it.
