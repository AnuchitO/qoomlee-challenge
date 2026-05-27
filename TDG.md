# TDG Configuration

## Project Information
- Language: Go 1.26.1
- Framework: Gin
- Test Framework: go test + testify + testify/mock + testcontainers-go
- Services: `services/qoomlee` · `services/payment`

## Build Command
```bash
# Both services
make go-build

# Single service
cd services/qoomlee && go build ./...
cd services/payment && go build ./...
```

## Test Command
```bash
# All unit tests (both services)
make test-unit

# Single service
cd services/qoomlee && go test ./... -short -count=1
cd services/payment && go test ./... -short -count=1
```

## Single Test Command
```bash
# Run one specific test by name
cd services/qoomlee && go test ./... -run TestSearchFlights -v -count=1
cd services/payment && go test ./... -run TestCharge -v -count=1
```

## Coverage Command
```bash
cd services/qoomlee && go test ./... -cover -count=1
cd services/payment && go test ./... -cover -count=1
```

## Integration Test Command
```bash
# Requires Docker (testcontainers-go spins up real PostgreSQL)
make test-integration

# Single service
cd services/qoomlee && go test ./... -run Integration -count=1
cd services/payment && go test ./... -run Integration -count=1
```

## Test File Patterns
- Test files: `*_test.go`
- Unit tests: same directory as source (e.g. `flight/handler_test.go`)
- Integration tests: tagged with `//go:build integration` or named `*_integration_test.go`
- Test directory: co-located with source packages

---

## Frontend (app/web)

- Language: TypeScript
- Framework: Next.js 16 (App Router)
- Test Framework: Vitest + React Testing Library

### Build Command
```bash
cd app/web && bun run build
```

### Test Command
```bash
cd app/web && bun run test
```

### Single Test Command
```bash
cd app/web && bun run test -- useFlightSearch
```

### Coverage Command
```bash
cd app/web && bun run test:coverage
```

### Test File Patterns
- Test files: `*.test.ts` | `*.test.tsx`
- Co-located with source (e.g. `app/flights/hooks/useFlightSearch.test.ts`)
- Config: `vitest.config.mts`
