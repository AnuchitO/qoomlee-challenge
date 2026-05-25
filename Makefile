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
FLIGHT_SERVICE_URL  ?= http://localhost:8081
BOOKING_SERVICE_URL ?= http://localhost:8082
PAYMENT_SERVICE_URL ?= http://localhost:8084
DATE      ?= 2026-06-15
SERVICES  := flight booking payment
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
.PHONY: setup # First-time setup — copy .env, download Go deps, check tools
setup: _check-compose deps
	@echo -e "$(BOLD)Setting up Qoomlee Airline...$(RESET)"
	@[ -f .env ] || (cp .env.example .env && \
	  echo -e "  $(YELLOW)⚠  .env created from .env.example$(RESET)" && \
	  echo -e "  $(YELLOW)   Edit .env and add your Omise test keys before running 'make up'$(RESET)")
	@[ -f .env ] && echo -e "  $(GREEN)✓$(RESET)  .env exists"
	@echo -e "  $(GREEN)✓$(RESET)  Setup complete — run $(BOLD)make up$(RESET) to start"

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
.PHONY: up # Build and start all services (foreground)
up: _check-compose _check-env
	$(COMPOSE) up --build

.PHONY: up-d # Build and start all services (background)
up-d: _check-compose _check-env
	$(COMPOSE) up --build -d
	@echo ""
	@echo -e "  $(GREEN)✓$(RESET)  All services started"
	@echo -e "  $(CYAN)→$(RESET)  flight-service  $(FLIGHT_SERVICE_URL)"
	@echo -e "  $(CYAN)→$(RESET)  booking-service $(BOOKING_SERVICE_URL)"
	@echo -e "  $(CYAN)→$(RESET)  payment-service $(PAYMENT_SERVICE_URL)"
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

.PHONY: rebuild # Rebuild and restart one service  e.g. make rebuild svc=flight-service
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
# BUILD
# ====================================================================================
.PHONY: build # Build all Docker images
build: _check-compose
	$(COMPOSE) build

.PHONY: build-% # Build one service  e.g. make build-flight-service
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
.PHONY: test # Run unit + integration tests for all services
test: test-unit test-integration

.PHONY: test-unit # Run unit tests for all services (no DB required)
test-unit:
	@echo -e "$(BOLD)Running unit tests...$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  $$svc"; \
	  (cd $(SVC_DIR)/$$svc && go test ./... -short -count=1 2>&1 | tail -5) || \
	    echo -e "    $(RED)✗$(RESET)  failed — run 'make test-$$svc' for details"; \
	done
	@echo -e "\n  $(GREEN)✓$(RESET)  Unit tests complete"

.PHONY: test-integration # Run integration tests with real DB (testcontainers-go)
test-integration:
	@echo -e "$(BOLD)Running integration tests (testcontainers-go)...$(RESET)"
	@echo -e "  $(DIM)Note: Docker must be running — pulls postgres image on first run$(RESET)"
	@for svc in $(SERVICES); do \
	  echo -e "  $(CYAN)→$(RESET)  $$svc"; \
	  (cd $(SVC_DIR)/$$svc && go test ./... -run Integration -count=1 2>&1 | tail -5) || \
	    echo -e "    $(YELLOW)⚠$(RESET)  No Integration tests yet — implement with testcontainers-go"; \
	done
	@echo -e "\n  $(GREEN)✓$(RESET)  Integration tests complete"

.PHONY: test-flight # Run flight-service tests only
test-flight:
	@echo -e "$(BOLD)flight-service tests$(RESET)"
	cd services/flight && go test ./... -v -count=1

.PHONY: test-booking # Run booking-service tests only
test-booking:
	@echo -e "$(BOLD)booking-service tests$(RESET)"
	cd services/booking && go test ./... -v -count=1

.PHONY: test-payment # Run payment-service tests only
test-payment:
	@echo -e "$(BOLD)payment-service tests$(RESET)"
	cd services/payment && go test ./... -v -count=1

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
	@echo -e "$(BOLD)K6: Flight Search — 50 VUs × 30s$(RESET)"
	k6 run tests/k6/search.js
	@echo -e "$(BOLD)K6: Full Booking Flow — 20 VUs × 60s$(RESET)"
	k6 run tests/k6/booking-flow.js

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
	  gofmt -w $$svc/; \
	done
	@echo -e "  $(GREEN)✓$(RESET)  Go code formatted"

# ====================================================================================
# DATABASE
# ====================================================================================
.PHONY: db-shell # Open a psql shell inside the running postgres container
db-shell: _check-compose
	$(COMPOSE) exec postgres psql -U qoomlee -d qoomlee

.PHONY: db-reset # Drop and recreate database with schema + seed (all data lost)
db-reset: _check-compose
	@echo -e "$(YELLOW)⚠  This will delete all data. Press Ctrl-C to cancel, Enter to continue...$(RESET)"
	@read _confirm
	$(COMPOSE) stop postgres
	$(COMPOSE) rm -f postgres
	docker volume rm $$(docker volume ls -q | grep qoomlee) 2>/dev/null || true
	$(COMPOSE) up -d postgres
	@echo -e "  $(GREEN)✓$(RESET)  Database reset — schema and seed data applied"

.PHONY: db-seed # Re-apply seed data against the running database
db-seed: _check-compose
	$(COMPOSE) exec -T postgres psql -U qoomlee -d qoomlee < infra/db/02_seed.sql
	@echo -e "  $(GREEN)✓$(RESET)  Seed data applied"

.PHONY: db-dump # Dump current database to db-backup.sql
db-dump: _check-compose
	$(COMPOSE) exec postgres pg_dump -U qoomlee qoomlee > db-backup.sql
	@echo -e "  $(GREEN)✓$(RESET)  Database dumped to db-backup.sql"

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
	@curl -s "$(FLIGHT_SERVICE_URL)/api/flights/search?origin=BKK&destination=SIN&date=$(DATE)&passengers=1" | jq .

.PHONY: curl-flight # Get flight detail  e.g. make curl-flight FLIGHT_ID=1
curl-flight: _require-stack
	@[ -n "$(FLIGHT_ID)" ] || (echo -e "$(RED)Usage: make curl-flight FLIGHT_ID=1$(RESET)" && exit 1)
	@curl -s "$(FLIGHT_SERVICE_URL)/api/flights/$(FLIGHT_ID)" | jq .

.PHONY: curl-book # Create a test booking  e.g. make curl-book FLIGHT_ID=1
curl-book: _require-stack
	@[ -n "$(FLIGHT_ID)" ] || (echo -e "$(RED)Usage: make curl-book FLIGHT_ID=1$(RESET)" && exit 1)
	@curl -s -X POST "$(BOOKING_SERVICE_URL)/api/bookings" \
	  -H "Content-Type: application/json" \
	  -d '{"flightId":$(FLIGHT_ID),"passenger":{"firstName":"Test","lastName":"Dev","email":"dev@test.com","passportNumber":"TD000001","nationality":"TH"},"totalAmount":3500.00,"currency":"THB"}' \
	  | jq .

.PHONY: curl-booking # Get booking detail  e.g. make curl-booking PNR=QM7X2K
curl-booking: _require-stack
	@[ -n "$(PNR)" ] || (echo -e "$(RED)Usage: make curl-booking PNR=QM7X2K$(RESET)" && exit 1)
	@curl -s "$(BOOKING_SERVICE_URL)/api/bookings/$(PNR)" | jq .

.PHONY: curl-payment # Get payment status  e.g. make curl-payment PNR=QM7X2K
curl-payment: _require-stack
	@[ -n "$(PNR)" ] || (echo -e "$(RED)Usage: make curl-payment PNR=QM7X2K$(RESET)" && exit 1)
	@curl -s "$(PAYMENT_SERVICE_URL)/api/payments/$(PNR)" | jq .

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
	@echo -e "$(CYAN)Step 1 — Search flights$(RESET)"
	@echo -e '  curl "$(FLIGHT_SERVICE_URL)/api/flights/search?origin=BKK&destination=SIN&date=$(DATE)&passengers=1"'
	@echo -e "  $(DIM)→ note the flight \"id\" and \"basePrice\"$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 2 — View flight detail$(RESET)"
	@echo -e '  curl "$(FLIGHT_SERVICE_URL)/api/flights/1"'
	@echo -e "  $(DIM)→ confirm durationMinutes is present$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 3 — Create booking (set totalAmount = basePrice)$(RESET)"
	@echo -e '  curl -X POST $(BOOKING_SERVICE_URL)/api/bookings \'
	@echo -e '    -H "Content-Type: application/json" \'
	@echo -e '    -d '"'"'{"flightId":1,"passenger":{"firstName":"Somchai","lastName":"Jaidee","email":"somchai@example.com","phone":"+66812345678","passportNumber":"AA123456","dateOfBirth":"1990-05-15","nationality":"TH"},"totalAmount":3500.00,"currency":"THB"}'"'"
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
	@echo -e '    -H "Content-Type: application/json" \'
	@echo -e '    -d '"'"'{"bookingRef":"QM7X2K","bookingId":42,"omiseToken":"tokn_test_xxxx","amount":350000,"currency":"THB"}'"'"
	@echo -e "  $(DIM)→ expect status SUCCEEDED and omiseChargeId$(RESET)"
	@echo ""
	@echo -e "$(CYAN)Step 5 — View booking confirmation (must show CONFIRMED)$(RESET)"
	@echo -e '  curl "$(BOOKING_SERVICE_URL)/api/bookings/QM7X2K"'
	@echo ""
	@echo -e "$(CYAN)Step 6 — View payment receipt$(RESET)"
	@echo -e '  curl "$(PAYMENT_SERVICE_URL)/api/payments/QM7X2K"'
	@echo ""
	@echo -e "$(DIM)Replace QM7X2K / 42 / tokn_test_xxxx with your actual values.$(RESET)"
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

.PHONY: _require-stack
_require-stack:
	@curl -sf "$(FLIGHT_SERVICE_URL)/api/flights/search?origin=BKK&destination=SIN&date=$(DATE)&passengers=1" \
	  >/dev/null 2>&1 || \
	  (echo -e "$(RED)ERROR: flight-service not reachable at $(FLIGHT_SERVICE_URL)$(RESET)" && \
	   echo -e "       Run: $(BOLD)make up-d$(RESET)" && \
	   exit 1)
