# ====================================================================================
# Qoomlee Airline — Development Makefile
# ====================================================================================
#
# Quick start:
#   make setup       <- first time only (copy .env, download deps)
#   make up          <- start everything
#   make score       <- run all automated checks
#   make walk        <- print the full happy-path curl sequence
#
# ====================================================================================

SHELL   := /bin/bash
.DEFAULT_GOAL := help

# ── Detect docker compose (V2 plugin vs V1 standalone) ──────────────────────
COMPOSE := $(shell \
  if docker compose version >/dev/null 2>&1; then \
    echo "docker compose"; \
  elif docker-compose version >/dev/null 2>&1; then \
    echo "docker-compose"; \
  else \
    echo ""; \
  fi)

# ── Config ───────────────────────────────────────────────────────────────────
QOOMLEE_SERVICE_URL ?= http://localhost:8082
PAYMENT_SERVICE_URL ?= http://localhost:8084
FRONTEND_URL        ?= http://localhost:3000
DATE      ?= 2026-06-15
SERVICES  := qoomlee payment
SVC_DIR   := services

# ── Colors ───────────────────────────────────────────────────────────────────
BOLD   := \033[1m
DIM    := \033[2m
GREEN  := \033[32m
CYAN   := \033[36m
YELLOW := \033[33m
RED    := \033[31m
RESET  := \033[0m

# ====================================================================================
# HELP
# ====================================================================================
.PHONY: help # Show this help message
help:
	@grep -E '^\.PHONY:\s+[^_][^#]*(#.*)?' $(MAKEFILE_LIST) \
	  | sort \
	  | cut -d ':' -f 2 \
	  | awk 'BEGIN {FS = "#"}; {printf "\033[36m%-28s\033[0m %s\n", $$1, $$2}'

# ====================================================================================
# SETUP
# ====================================================================================
.PHONY: setup # First-time setup — copy .env, download Go deps, install tools, bun install
setup: _check-compose deps
	@echo -e "$(BOLD)Setting up Qoomlee Airline...$(RESET)"
	@[ -f .env ] || (cp .env.example .env && \
	  echo -e "  $(YELLOW)⚠  .env created from .env.example$(RESET)" && \
	  echo -e "  $(YELLOW)   Edit .env and add your Omise test keys before running 'make up'$(RESET)")
	@[ -f .env ] && echo -e "  $(GREEN)✓$(RESET)  .env exists"
	@echo -e "$(BOLD)Checking optional tooling...$(RESET)"
	@command -v govulncheck >/dev/null 2>&1 && echo -e "  $(GREEN)✓$(RESET)  govulncheck already installed" || \
	  (echo -e "  $(CYAN)→$(RESET)  installing govulncheck" && \
	   go install golang.org/x/vuln/cmd/govulncheck@latest && \
	   echo -e "  $(GREEN)✓$(RESET)  govulncheck installed")
	@command -v golangci-lint >/dev/null 2>&1 && echo -e "  $(GREEN)✓$(RESET)  golangci-lint already installed" || \
	  (echo -e "  $(CYAN)→$(RESET)  installing golangci-lint" && \
	   brew install golangci-lint 2>/dev/null && echo -e "  $(GREEN)✓$(RESET)  golangci-lint installed" || \
	   echo -e "  $(YELLOW)⚠  install golangci-lint manually: https://golangci-lint.run/welcome/install/$(RESET)")
	@command -v gitleaks >/dev/null 2>&1 && echo -e "  $(GREEN)✓$(RESET)  gitleaks already installed" || \
	  (echo -e "  $(CYAN)→$(RESET)  installing gitleaks" && \
	   brew install gitleaks 2>/dev/null && echo -e "  $(GREEN)✓$(RESET)  gitleaks installed" || \
	   echo -e "  $(YELLOW)⚠  install gitleaks manually: brew install gitleaks$(RESET)")
	@[ -d app/web/node_modules ] && echo -e "  $(GREEN)✓$(RESET)  app/web/node_modules already installed" || \
	  (echo -e "  $(CYAN)→$(RESET)  running bun install (app/web)" && \
	   cd app/web && bun install && echo -e "  $(GREEN)✓$(RESET)  app/web dependencies installed")
	@command -v pre-commit >/dev/null 2>&1 && echo -e "  $(GREEN)✓$(RESET)  pre-commit already installed" || \
	  (echo -e "  $(CYAN)→$(RESET)  installing pre-commit" && \
	   brew install pre-commit 2>/dev/null && echo -e "  $(GREEN)✓$(RESET)  pre-commit installed" || \
	   echo -e "  $(YELLOW)⚠  install pre-commit manually: brew install pre-commit$(RESET)")
	@pre-commit install --install-hooks && \
	  echo -e "  $(GREEN)✓$(RESET)  pre-commit hooks installed" || \
	  echo -e "  $(YELLOW)⚠  pre-commit install failed — run: pre-commit install$(RESET)"
	@echo -e "  $(GREEN)✓$(RESET)  Setup complete — run $(BOLD)make up$(RESET) to start, or $(BOLD)make doctor$(RESET) to verify"

.PHONY: doctor # Check development environment readiness (Flutter-doctor style)
doctor:
	@bash scripts/doctor.sh

.PHONY: deps # Download Go module dependencies for all services
deps:
	@echo -e "$(BOLD)Downloading Go dependencies...$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  $$svc"; \
	  (cd $(SVC_DIR)/$$svc && go mod download) || exit 1; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  All Go dependencies downloaded"

.PHONY: install-tools # Install optional tools — k6
install-tools:
	@echo -e "$(BOLD)Installing optional tools...$(RESET)"
	@command -v k6 >/dev/null 2>&1 && \
	  echo -e "  $(GREEN)✓$(RESET)  k6 already installed" || \
	  (echo -e "  Installing k6..." && \
	   brew install k6 2>/dev/null || \
	   echo -e "  $(YELLOW)⚠  Install k6 manually: https://k6.io/docs/get-started/installation/$(RESET)")
	@command -v jq >/dev/null 2>&1 && \
	  echo -e "  $(GREEN)✓$(RESET)  jq already installed" || \
	  echo -e "  $(YELLOW)⚠  jq not found — install for pretty curl output: brew install jq$(RESET)"

# ====================================================================================
# DEVELOPMENT
# ====================================================================================
.PHONY: up # Build and start all services, run migrations, then follow logs
up: up-d
	$(COMPOSE) logs -f

.PHONY: up-d # Build and start all services (background) and run migrations
up-d: _check-compose _check-env
	$(COMPOSE) up --build -d
	@$(MAKE) db-migrate
	@echo ""
	@echo -e "  $(GREEN)✓$(RESET)  All services started"
	@echo -e "  $(CYAN)→$(RESET)  qoomlee-service $(QOOMLEE_SERVICE_URL)"
	@echo -e "  $(CYAN)→$(RESET)  payment-service $(PAYMENT_SERVICE_URL)"
	@echo -e "  $(CYAN)→$(RESET)  frontend        $(FRONTEND_URL)"
	@echo -e "  $(CYAN)→$(RESET)  Logs         make logs"
	@echo -e "  $(CYAN)→$(RESET)  Smoke test   make check-smoke"

.PHONY: down # Stop all services (preserves data)
down: _check-compose
	$(COMPOSE) down
	@echo -e "  $(GREEN)✓$(RESET)  All services stopped"

.PHONY: restart # Restart all services without rebuilding
restart: _check-compose
	$(COMPOSE) restart
	@echo -e "  $(GREEN)✓$(RESET)  All services restarted"

.PHONY: rebuild # Rebuild and restart one service  e.g. make rebuild svc=qoomlee-service
rebuild: _check-compose
	@[ -n "$(svc)" ] || (echo -e "$(RED)Usage: make rebuild svc=<service-name>$(RESET)" && exit 1)
	$(COMPOSE) up --build -d $(svc)
	@echo -e "  $(GREEN)✓$(RESET)  $(svc) rebuilt and restarted"

.PHONY: logs # Follow logs from all services
logs: _check-compose
	$(COMPOSE) logs -f

.PHONY: logs-% # Follow logs from one service  e.g. make logs-payment-service
logs-%: _check-compose
	$(COMPOSE) logs -f $*

.PHONY: ps # Show running containers and health status
ps: _check-compose
	$(COMPOSE) ps

# ====================================================================================
# FRONTEND
# ====================================================================================
.PHONY: frontend # Start the Next.js frontend dev server (app/web)
frontend:
	@echo -e "$(BOLD)Starting frontend dev server...$(RESET)"
	cd app/web && bun run dev

# ====================================================================================
# BUILD
# ====================================================================================
.PHONY: build # Build all Docker images
build: _check-compose
	$(COMPOSE) build

.PHONY: build-% # Build one service  e.g. make build-qoomlee-service
build-%: _check-compose
	$(COMPOSE) build $*
	@echo -e "  $(GREEN)✓$(RESET)  $* image built"

.PHONY: go-build # Compile all Go services locally (no Docker)
go-build:
	@echo -e "$(BOLD)Building Go services...$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  $$svc"; \
	  (cd $(SVC_DIR)/$$svc && go build ./...) || exit 1; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  All services compile cleanly"

# ====================================================================================
# TESTING
# ====================================================================================
.PHONY: test # Run all unit + integration tests (Go services + frontend)
test: test-unit test-integration

.PHONY: test-unit # Run unit tests for all services + frontend (no DB or server required)
test-unit: test-frontend
	@echo -e "$(BOLD)Running Go unit tests...$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  $$svc"; \
	  (cd $(SVC_DIR)/$$svc && go test ./... -count=1) || exit 1; \
	done
	@echo -e "\n  $(GREEN)✓$(RESET)  Unit tests complete"

.PHONY: test-frontend # Run frontend unit tests (Vitest — no server required)
test-frontend:
	@echo -e "$(BOLD)Running frontend unit tests (Vitest)...$(RESET)"
	cd app/web && bun run test
	@echo -e "  $(GREEN)✓$(RESET)  Frontend unit tests complete"

.PHONY: test-e2e # Run frontend E2E tests (Playwright — requires running stack on :3000)
test-e2e:
	@echo -e "$(BOLD)Running frontend E2E tests (Playwright)...$(RESET)"
	@echo -e "  $(DIM)Note: requires 'make up' and frontend dev server on :3000$(RESET)"
	cd app/web && bun run test:e2e

.PHONY: test-integration # Run integration tests with real DB (testcontainers-go, requires Docker)
test-integration:
	@echo -e "$(BOLD)Running integration tests (testcontainers-go)...$(RESET)"
	@echo -e "  $(DIM)Note: Docker must be running — pulls postgres:16-alpine on first run$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  $$svc"; \
	  (cd $(SVC_DIR)/$$svc && go test ./... -tags=integration -v -count=1) || exit 1; \
	done
	@echo -e "\n  $(GREEN)✓$(RESET)  Integration tests complete"

.PHONY: test-qoomlee # Run qoomlee-service unit tests only
test-qoomlee:
	@echo -e "$(BOLD)qoomlee-service unit tests$(RESET)"
	cd $(SVC_DIR)/qoomlee && go test ./... -v -count=1

.PHONY: test-qoomlee-integration # Run qoomlee-service integration tests (requires Docker)
test-qoomlee-integration:
	@echo -e "$(BOLD)qoomlee-service integration tests$(RESET)"
	cd $(SVC_DIR)/qoomlee && go test ./... -tags=integration -v -count=1

.PHONY: test-payment # Run payment-service unit tests only
test-payment:
	@echo -e "$(BOLD)payment-service unit tests$(RESET)"
	cd $(SVC_DIR)/payment && go test ./... -v -count=1

.PHONY: test-payment-integration # Run payment-service integration tests (requires Docker)
test-payment-integration:
	@echo -e "$(BOLD)payment-service integration tests$(RESET)"
	cd $(SVC_DIR)/payment && go test ./... -tags=integration -v -count=1

.PHONY: test-cover # Run unit tests with coverage report for all services
test-cover:
	@echo -e "$(BOLD)Running tests with coverage...$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  $$svc"; \
	  (cd $(SVC_DIR)/$$svc && go test ./... -count=1 -coverprofile=coverage.out && go tool cover -func=coverage.out | tail -1) || exit 1; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  Coverage reports generated"

.PHONY: test-visual # Run Playwright visual regression screenshot tests
test-visual:
	@echo -e "$(BOLD)Running visual regression tests...$(RESET)"
	cd app/web && bunx playwright test e2e/visual

.PHONY: test-mutation # Run go-mutesting on the payment package
test-mutation:
	@command -v go-mutesting >/dev/null 2>&1 || \
	  (echo -e "$(RED)go-mutesting not installed — run: go install github.com/avito-tech/go-mutesting/cmd/go-mutesting@latest$(RESET)" && exit 1)
	cd $(SVC_DIR)/payment && go-mutesting ./payment/...

.PHONY: test-security # OWASP ZAP baseline scan against the running stack + dependency audits
test-security: _require-stack lint-security
	@echo -e "$(BOLD)Running ZAP baseline scans...$(RESET)"
	@command -v docker >/dev/null 2>&1 || (echo -e "$(RED)Docker required for ZAP$(RESET)" && exit 1)
	docker run --rm -t -v "$(CURDIR):/zap/wrk:rw" --network=host ghcr.io/zaproxy/zaproxy:stable \
	  zap-baseline.py -t $(QOOMLEE_SERVICE_URL) -r zap-report-qoomlee.html || true
	docker run --rm -t -v "$(CURDIR):/zap/wrk:rw" --network=host ghcr.io/zaproxy/zaproxy:stable \
	  zap-baseline.py -t $(PAYMENT_SERVICE_URL) -r zap-report-payment.html || true
	docker run --rm -t -v "$(CURDIR):/zap/wrk:rw" --network=host ghcr.io/zaproxy/zaproxy:stable \
	  zap-baseline.py -t $(FRONTEND_URL) -r zap-report-web.html || true
	@echo -e "  $(GREEN)✓$(RESET)  ZAP baseline scans complete — see zap-report-*.html"

# ====================================================================================
# SCORE AND QUALITY CHECKS
# ====================================================================================
.PHONY: score # Run ALL automated checks and print the full score report
score:
	@bash scripts/check-all.sh

.PHONY: score-offline # Run static checks only (go build, go vet, secret scan) — no stack needed
score-offline:
	@bash scripts/check-all.sh --offline

.PHONY: score-no-perf # Run all checks except K6 load tests
score-no-perf:
	@bash scripts/check-all.sh --no-perf

.PHONY: check-smoke # Smoke test — verify every endpoint responds correctly
check-smoke: _require-stack
	@bash scripts/smoke/check-smoke.sh

.PHONY: check-contract # API contract and cross-service consistency checks
check-contract: _require-stack
	@bash scripts/contract/check-contracts.sh

.PHONY: check-perf # K6 load tests (requires k6 + running stack)
check-perf: _require-stack
	@command -v k6 >/dev/null 2>&1 || \
	  (echo -e "$(RED)k6 not installed — run: make install-tools$(RESET)" && exit 1)
	@K6_JWT=$$($(MAKE) jwt-token -s 2>/dev/null || echo ""); \
	  echo -e "$(BOLD)K6: Flight Search — 50 VUs × 30s$(RESET)"; \
	  k6 run -e K6_JWT=$$K6_JWT tests/k6/search.js; \
	  echo -e "$(BOLD)K6: Full Booking Flow — 20 VUs × 60s$(RESET)"; \
	  k6 run -e K6_JWT=$$K6_JWT tests/k6/booking-flow.js

# ====================================================================================
# LINT AND FORMAT
# ====================================================================================
.PHONY: lint # go vet all services
lint: lint-go

.PHONY: lint-go # Run go vet on all Go services
lint-go:
	@echo -e "$(BOLD)Linting Go services...$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  $$svc"; \
	  (cd $(SVC_DIR)/$$svc && go vet ./...) || exit 1; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  go vet passed"

.PHONY: fmt # Run gofmt on all Go services
fmt:
	@echo -e "$(BOLD)Formatting Go services...$(RESET)"
	@for svc in $(SERVICES); do \
	  gofmt -w $(SVC_DIR)/$$svc/; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  Go code formatted"

.PHONY: fmt-check # Check formatting (gofmt + prettier) without modifying files — for CI
fmt-check:
	@echo -e "$(BOLD)Checking formatting...$(RESET)"
	@for svc in $(SERVICES); do \
	  unformatted=$$(gofmt -l $(SVC_DIR)/$$svc); \
	  if [ -n "$$unformatted" ]; then \
	    echo -e "$(RED)gofmt: files not formatted:$(RESET)"; echo "$$unformatted"; exit 1; \
	  fi; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  gofmt clean"
	@(cd app/web && bunx prettier --check .) || \
	  (echo -e "$(RED)prettier: formatting issues found — run: cd app/web && bunx prettier --write .$(RESET)" && exit 1)
	@echo -e "  $(GREEN)✓$(RESET)  prettier clean"

.PHONY: lint-security # Run gosec, govulncheck, gitleaks, and bun audit
lint-security:
	@echo -e "$(BOLD)Security scans...$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  gosec $$svc"; \
	  (cd $(SVC_DIR)/$$svc && golangci-lint run --enable-only=gosec ./...) || exit 1; \
	done
	@if command -v govulncheck >/dev/null 2>&1; then \
	  for svc in $(SERVICES); do \
	    echo -e "  $(CYAN)→$(RESET)  govulncheck $$svc"; \
	    (cd $(SVC_DIR)/$$svc && govulncheck ./...) || exit 1; \
	  done; \
	else \
	  echo -e "  $(YELLOW)⚠  govulncheck not installed — run: make setup$(RESET)"; \
	fi
	@if command -v gitleaks >/dev/null 2>&1; then \
	  echo -e "  $(CYAN)→$(RESET)  gitleaks"; \
	  gitleaks detect --source . --redact -v || exit 1; \
	else \
	  echo -e "  $(YELLOW)⚠  gitleaks not installed — run: make setup$(RESET)"; \
	fi
	@echo -e "  $(CYAN)→$(RESET)  bun audit (app/web)"
	@(cd app/web && bun audit) || true
	@echo -e "  $(GREEN)✓$(RESET)  Security scans complete"

.PHONY: lint-docker # Run hadolint on all Dockerfiles
lint-docker:
	@command -v hadolint >/dev/null 2>&1 || \
	  (echo -e "$(RED)hadolint not installed — brew install hadolint$(RESET)" && exit 1)
	@for f in $(SVC_DIR)/*/Dockerfile; do \
	  echo -e "  $(CYAN)→$(RESET)  $$f"; \
	  hadolint $$f || exit 1; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  Dockerfiles pass hadolint"

.PHONY: ci # Full CI pipeline — fmt-check, lint, security, unit + integration tests, coverage
ci: fmt-check lint lint-security test-unit test-integration test-cover test-e2e
	@echo -e "  $(GREEN)✓$(RESET)  CI pipeline passed"

# ====================================================================================
# DATABASE
# ====================================================================================
.PHONY: db-migrate # Apply pending schema migrations to the qoomlee database (idempotent — safe to run repeatedly)
db-migrate: _check-compose
	@echo -e "$(BOLD)Applying schema migrations...$(RESET)"
	@for f in $$(ls infra/db/qoomlee/[0-9][0-9]_*.sql 2>/dev/null | sort | awk 'NR>2'); do \
	  echo -e "  $(CYAN)→$(RESET)  $$f"; \
	  $(COMPOSE) exec -T postgres-qoomlee psql -U qoomlee -d qoomlee < "$$f" || exit 1; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  Migrations applied"

.PHONY: db-shell-qoomlee # Open a psql shell in the booking database
db-shell-qoomlee: _check-compose
	$(COMPOSE) exec postgres-qoomlee psql -U qoomlee -d qoomlee

.PHONY: db-shell-payment # Open a psql shell in the payment database
db-shell-payment: _check-compose
	$(COMPOSE) exec postgres-qoomlee-payment psql -U qoomlee -d qoomlee_payment

.PHONY: db-reset # Drop and recreate both databases with schema + seed (all data lost)
db-reset: _check-compose
	@echo -e "$(YELLOW)⚠  This will delete all data. Press Ctrl-C to cancel, Enter to continue...$(RESET)"
	@read _confirm
	$(COMPOSE) stop postgres-qoomlee postgres-qoomlee-payment
	$(COMPOSE) rm -f postgres-qoomlee postgres-qoomlee-payment
	docker volume rm $$(docker volume ls -q | grep qoomlee) 2>/dev/null || true
	$(COMPOSE) up -d postgres-qoomlee postgres-qoomlee-payment
	@echo -e "  $(GREEN)✓$(RESET)  Databases reset — schema and seed data applied"

.PHONY: db-seed-qoomlee # Re-apply booking seed data against the running booking database
db-seed-qoomlee: _check-compose
	$(COMPOSE) exec -T postgres-qoomlee psql -U qoomlee -d qoomlee < infra/db/qoomlee/02_seed.sql
	@echo -e "  $(GREEN)✓$(RESET)  Booking seed data applied"

.PHONY: db-seed-payment # Re-apply payment seed data against the running payment database
db-seed-payment: _check-compose
	$(COMPOSE) exec -T postgres-qoomlee-payment psql -U qoomlee -d qoomlee_payment < infra/db/qoomlee-payment/02_seed.sql
	@echo -e "  $(GREEN)✓$(RESET)  Payment seed data applied"

.PHONY: db-dump-qoomlee # Dump booking database to booking-backup.sql
db-dump-qoomlee: _check-compose
	$(COMPOSE) exec postgres-qoomlee pg_dump -U qoomlee qoomlee > booking-backup.sql
	@echo -e "  $(GREEN)✓$(RESET)  Booking database dumped to booking-backup.sql"

.PHONY: db-dump-payment # Dump payment database to payment-backup.sql
db-dump-payment: _check-compose
	$(COMPOSE) exec postgres-qoomlee-payment pg_dump -U qoomlee qoomlee_payment > payment-backup.sql
	@echo -e "  $(GREEN)✓$(RESET)  Payment database dumped to payment-backup.sql"

# ====================================================================================
# CLEAN
# ====================================================================================
.PHONY: clean # Remove local Go build cache and temp files
clean:
	@echo -e "$(BOLD)Cleaning build artifacts...$(RESET)"
	@rm -f /tmp/*-cover.out
	@for svc in $(SERVICES); do \
	  [ -d $$svc/tmp ] && rm -rf $$svc/tmp || true; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  Build artifacts removed"

.PHONY: clean-docker # Remove containers and volumes (all data lost)
clean-docker: _check-compose
	@echo -e "$(YELLOW)⚠  This removes all containers and volumes. Press Ctrl-C to cancel...$(RESET)"
	@read _confirm
	$(COMPOSE) down -v --remove-orphans
	@echo -e "  $(GREEN)✓$(RESET)  Containers and volumes removed"

# ====================================================================================
# QUICK CURL HELPERS  (require running stack — make up-d first)
# ====================================================================================
.PHONY: curl-search # Search flights BKK→SIN  (override: make curl-search DATE=2026-07-01)
curl-search: _require-stack
	@curl -s "$(QOOMLEE_SERVICE_URL)/api/flights/search?origin=BKK&destination=SIN&date=$(DATE)&passengers=1" | jq .

.PHONY: curl-flight # Get flight detail  e.g. make curl-flight FLIGHT_ID=1
curl-flight: _require-stack
	@[ -n "$(FLIGHT_ID)" ] || (echo -e "$(RED)Usage: make curl-flight FLIGHT_ID=1$(RESET)" && exit 1)
	@curl -s "$(QOOMLEE_SERVICE_URL)/api/flights/$(FLIGHT_ID)" | jq .

.PHONY: curl-book # Create a test booking  e.g. make curl-book FLIGHT_ID=1
curl-book: _require-stack
	@[ -n "$(FLIGHT_ID)" ] || (echo -e "$(RED)Usage: make curl-book FLIGHT_ID=1$(RESET)" && exit 1)
	@curl -s -X POST "$(QOOMLEE_SERVICE_URL)/api/bookings" \
	  -H "Content-Type: application/json" \
	  -d '{"flightId":$(FLIGHT_ID),"passenger":{"firstName":"Test","lastName":"Dev","email":"dev@test.com","passportNumber":"TD000001","nationality":"TH"},"totalAmountMinor":350000,"currency":"THB"}' \
	  | jq .

.PHONY: curl-booking # Get booking detail  e.g. make curl-booking PNR=QM7X2K
curl-booking: _require-stack
	@[ -n "$(PNR)" ] || (echo -e "$(RED)Usage: make curl-booking PNR=QM7X2K$(RESET)" && exit 1)
	@curl -s "$(QOOMLEE_SERVICE_URL)/api/bookings/$(PNR)" | jq .

.PHONY: curl-payment # Get payment status  e.g. make curl-payment PNR=QM7X2K
curl-payment: _require-stack
	@[ -n "$(PNR)" ] || (echo -e "$(RED)Usage: make curl-payment PNR=QM7X2K$(RESET)" && exit 1)
	@curl -s "$(PAYMENT_SERVICE_URL)/api/payments/$(PNR)" | jq .

.PHONY: jwt-token # Generate a short-lived RS256 JWT for API testing  requires JWT_PRIVATE_KEY in .env
jwt-token:
	@[ -f .env ] || (echo -e "$(RED).env not found — run: make setup$(RESET)" && exit 1)
	@set -a; source .env; set +a; \
	 [ -n "$$JWT_PRIVATE_KEY" ] || \
	   (echo -e "$(RED)JWT_PRIVATE_KEY not set in .env$(RESET)" && exit 1); \
	 TMPKEY=$$(mktemp); \
	 printf '%b' "$$JWT_PRIVATE_KEY" > $$TMPKEY; \
	 B64H=$$(printf '{"alg":"RS256","typ":"JWT"}' | openssl base64 -A | tr '+/' '-_' | tr -d '='); \
	 NOW=$$(date +%s); EXP=$$((NOW + 3600)); \
	 B64P=$$(printf '{"sub":"test-user","iat":%d,"exp":%d}' $$NOW $$EXP \
	          | openssl base64 -A | tr '+/' '-_' | tr -d '='); \
	 SIG=$$(printf '%s.%s' $$B64H $$B64P \
	         | openssl dgst -sha256 -sign $$TMPKEY \
	         | openssl base64 -A | tr '+/' '-_' | tr -d '='); \
	 rm -f $$TMPKEY; \
	 echo "$$B64H.$$B64P.$$SIG"

.PHONY: omise-token # Get an Omise test token (success card)  requires OMISE_PUBLIC_KEY in .env
omise-token:
	@[ -f .env ] || (echo -e "$(RED).env not found — run: make setup$(RESET)" && exit 1)
	@PKEY=$$(grep OMISE_PUBLIC_KEY .env | cut -d= -f2); \
	 [ -n "$$PKEY" ] && [ "$$PKEY" != "pkey_test_xxxxxxxxxxxxxxxxxxxxxx" ] || \
	   (echo -e "$(RED)Set a real OMISE_PUBLIC_KEY in .env first$(RESET)" && exit 1); \
	 curl -s https://vault.omise.co/tokens \
	   -u "$$PKEY": \
	   -d "card[number]=4242424242424242" \
	   -d "card[expiration_month]=12" \
	   -d "card[expiration_year]=2028" \
	   -d "card[security_code]=123" \
	   -d "card[name]=TEST USER" | jq '{token: .id, expires: .used}'

.PHONY: walk # Print the full happy-path curl walkthrough
walk:
	@echo ""
	@echo -e "$(BOLD)━━━ Happy Path Walkthrough ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 0 — Get a JWT token (required for all API calls)$(RESET)"
	@echo -e '  TOKEN=$$(make jwt-token -s)'
	@echo -e "  $(DIM)→ use \$$TOKEN in all curl commands below$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 1 — Search flights$(RESET)"
	@echo -e '  curl -H "Authorization: Bearer \$$TOKEN" "$(QOOMLEE_SERVICE_URL)/api/flights/search?origin=BKK&destination=SIN&date=$(DATE)&passengers=1"'
	@echo -e "  $(DIM)→ note the flight \"id\", \"basePriceMinor\", and \"basePrice\"$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 2 — View flight detail$(RESET)"
	@echo -e '  curl -H "Authorization: Bearer \$$TOKEN" "$(QOOMLEE_SERVICE_URL)/api/flights/1"'
	@echo -e "  $(DIM)→ confirm durationMinutes is present$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 3 — Create booking (set totalAmountMinor = basePriceMinor)$(RESET)"
	@echo -e '  curl -X POST $(QOOMLEE_SERVICE_URL)/api/bookings \'
	@echo -e '    -H "Authorization: Bearer \$$TOKEN" \'
	@echo -e '    -H "Content-Type: application/json" \'
	@echo -e '    -d '"'"'{"flightId":1,"passenger":{"firstName":"Somchai","lastName":"Jaidee","email":"somchai@example.com","phone":"+66812345678","passportNumber":"AA123456","dateOfBirth":"1990-05-15","nationality":"TH"},"totalAmountMinor":350000,"currency":"THB"}'"'"
	@echo -e "  $(DIM)→ save bookingRef (PNR) and bookingId from response$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 4a — Get Omise test token  (or run: make omise-token)$(RESET)"
	@echo -e '  curl https://vault.omise.co/tokens \'
	@echo -e '    -u YOUR_PKEY_TEST_HERE: \'
	@echo -e '    -d "card[number]=4242424242424242" -d "card[expiration_month]=12" \'
	@echo -e '    -d "card[expiration_year]=2028" -d "card[security_code]=123" -d "card[name]=TEST USER"'
	@echo -e "  $(DIM)→ copy the \"id\" field: tokn_test_xxxx$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 4b — Pay  (3500 THB × 100 = 350000 satang)$(RESET)"
	@echo -e '  curl -X POST $(PAYMENT_SERVICE_URL)/api/payments/charge \'
	@echo -e '    -H "Authorization: Bearer \$$TOKEN" \'
	@echo -e '    -H "Content-Type: application/json" \'
	@echo -e '    -d '"'"'{"bookingRef":"QM7X2K","amountMinor":350000,"currency":"THB","omiseToken":"tokn_test_xxxx"}'"'"
	@echo -e "  $(DIM)→ expect status SUCCEEDED and omiseChargeId$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 5 — View booking confirmation (must show CONFIRMED)$(RESET)"
	@echo -e '  curl -H "Authorization: Bearer \$$TOKEN" "$(QOOMLEE_SERVICE_URL)/api/bookings/QM7X2K"'
	@echo ""
	@echo -e "$(CYAN)Step 6 — View payment receipt$(RESET)"
	@echo -e '  curl -H "Authorization: Bearer \$$TOKEN" "$(PAYMENT_SERVICE_URL)/api/payments/QM7X2K"'
	@echo ""
	@echo -e "$(DIM)Replace QM7X2K / tokn_test_xxxx with your actual values.$(RESET)"
	@echo ""

# ====================================================================================
# UTILITIES
# ====================================================================================
.PHONY: versions # Show installed tool versions
versions:
	@echo -e "$(BOLD)Tool versions:$(RESET)"
	@echo -e "  docker    $$(docker --version 2>/dev/null | head -1 || echo 'not found')"
	@echo -e "  compose   $$($(COMPOSE) version 2>/dev/null | head -1 || echo 'not found')"
	@echo -e "  go        $$(go version 2>/dev/null || echo 'not found')"
	@echo -e "  k6        $$(k6 version 2>/dev/null | head -1 || echo 'not installed — make install-tools')"
	@echo -e "  jq        $$(jq --version 2>/dev/null || echo 'not found — brew install jq')"
	@echo -e "  d2        $$(d2 --version 2>/dev/null || echo 'not installed — brew install d2')"

.PHONY: diagrams # Render D2 diagrams to SVG  (requires: brew install d2)
diagrams:
	@command -v d2 >/dev/null 2>&1 || \
	  (echo -e "$(RED)d2 not installed — run: brew install d2$(RESET)" && exit 1)
	@echo -e "$(BOLD)Rendering diagrams...$(RESET)"
	@d2 diagrams/use-case.d2              diagrams/use-case.svg
	@d2 diagrams/sequence-happy-path.d2   diagrams/sequence-happy-path.svg
	@d2 diagrams/sequence-payment-failure.d2 diagrams/sequence-payment-failure.svg
	@echo -e "  $(GREEN)✓$(RESET)  SVGs written to diagrams/"

# ====================================================================================
# INTERNAL — not shown in help (no # description after .PHONY)
# ====================================================================================
.PHONY: _check-compose
_check-compose:
	@[ -n "$(COMPOSE)" ] || \
	  (echo -e "$(RED)ERROR: docker compose not found.$(RESET)" && \
	   echo -e "       Install Docker Desktop: https://docs.docker.com/get-docker/" && \
	   exit 1)

.PHONY: _check-env
_check-env:
	@[ -f .env ] || \
	  (echo -e "$(RED)ERROR: .env not found.$(RESET)" && \
	   echo -e "       Run: $(BOLD)make setup$(RESET)" && \
	   exit 1)
	@grep -q 'OMISE_PUBLIC_KEY=pkey_test_xxx' .env 2>/dev/null && \
	  echo -e "$(YELLOW)⚠  .env still has placeholder Omise keys — payment tests will fail$(RESET)" || true
	@grep -qE '^INTERNAL_TOKEN=$$' .env 2>/dev/null && \
	  (echo -e "$(RED)ERROR: INTERNAL_TOKEN is empty in .env$(RESET)" && \
	   echo -e "       Run: $(BOLD)openssl rand -hex 32$(RESET) and set the value" && \
	   exit 1) || true

.PHONY: _require-stack
_require-stack:
	@curl -sf "$(QOOMLEE_SERVICE_URL)/api/flights/search?origin=BKK&destination=SIN&date=$(DATE)&passengers=1" \
	  >/dev/null 2>&1 || \
	  (echo -e "$(RED)ERROR: qoomlee-service not reachable at $(QOOMLEE_SERVICE_URL)$(RESET)" && \
	   echo -e "       Run: $(BOLD)make up-d$(RESET)" && \
	   exit 1)
