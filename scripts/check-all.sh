#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Qoomlee Challenge — Master Score Runner
# Runs all automated checks and prints a final report.
#
# Usage:
#   ./scripts/check-all.sh              # run everything
#   ./scripts/check-all.sh --no-perf   # skip K6 load tests
#   ./scripts/check-all.sh --offline   # skip live API tests (unit tests only)
#
# Requirements (live tests): docker compose up --build
# Optional tools:            k6 (https://k6.io/docs/get-started/installation/)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

source scripts/lib/common.sh

RUN_PERF=true
RUN_LIVE=true

for arg in "$@"; do
  case $arg in
    --no-perf)  RUN_PERF=false ;;
    --offline)  RUN_LIVE=false ;;
  esac
done

chmod +x scripts/smoke/check-smoke.sh
chmod +x scripts/contract/check-contracts.sh

# ─── Track pass/fail per pillar ───────────────────────────────────────────────
declare -A PILLAR_PASS
declare -A PILLAR_FAIL
declare -A PILLAR_WARN

run_pillar() {
  local name=$1 script=$2
  PASS_COUNT=0; FAIL_COUNT=0; WARN_COUNT=0
  bash "$script" 2>&1 || true
  PILLAR_PASS["$name"]=$PASS_COUNT
  PILLAR_FAIL["$name"]=$FAIL_COUNT
  PILLAR_WARN["$name"]=$WARN_COUNT
}

echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║        Qoomlee Challenge — Automated Score Report         ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
echo -e "  Team: _______________________   Date: $(date '+%Y-%m-%d %H:%M')"
echo ""

# ─── Pillar 1: Working Software (smoke tests) ─────────────────────────────────
if $RUN_LIVE; then
  run_pillar "smoke" "scripts/smoke/check-smoke.sh"
else
  echo -e "${YELLOW}Skipping smoke tests (--offline)${NC}"
  PILLAR_PASS["smoke"]=0; PILLAR_FAIL["smoke"]=0; PILLAR_WARN["smoke"]=0
fi

# ─── Pillar 2: Testing — Layer 3 contract checks ──────────────────────────────
if $RUN_LIVE; then
  run_pillar "contract" "scripts/contract/check-contracts.sh"
else
  PILLAR_PASS["contract"]=0; PILLAR_FAIL["contract"]=0; PILLAR_WARN["contract"]=0
fi

# ─── Pillar 2: Testing — Unit tests (go test ./...) ───────────────────────────
section "Unit + Integration Tests"
PASS_COUNT=0; FAIL_COUNT=0; WARN_COUNT=0

for svc in flight-service booking-service payment-service; do
  if [ -f "services/$svc/go.mod" ]; then
    echo "  Running: go test ./... in services/$svc"
    if (cd "services/$svc" && go test ./... 2>&1); then
      PASS_COUNT=$((PASS_COUNT + 1))
      pass "$svc: go test ./... passed"
    else
      FAIL_COUNT=$((FAIL_COUNT + 1))
      fail "$svc: go test ./... FAILED"
    fi
  else
    WARN_COUNT=$((WARN_COUNT + 1))
    warn "$svc: no go.mod found — skipping"
  fi
done

PILLAR_PASS["unit"]=$PASS_COUNT
PILLAR_FAIL["unit"]=$FAIL_COUNT
PILLAR_WARN["unit"]=$WARN_COUNT

# ─── Pillar 3: Code Quality (go vet, no secrets) ──────────────────────────────
section "Code Quality — go vet + secret scan"
PASS_COUNT=0; FAIL_COUNT=0; WARN_COUNT=0

for svc in flight-service booking-service payment-service; do
  if [ -f "services/$svc/go.mod" ]; then
    if (cd "services/$svc" && go vet ./... 2>&1); then
      PASS_COUNT=$((PASS_COUNT + 1))
      pass "$svc: go vet passed"
    else
      FAIL_COUNT=$((FAIL_COUNT + 1))
      fail "$svc: go vet FAILED"
    fi
  fi
done

# Secret scan
if grep -rn "skey_test\|pkey_test" services/ --include="*.go" 2>/dev/null | grep -v "_test.go" | grep -q .; then
  FAIL_COUNT=$((FAIL_COUNT + 1))
  fail "Secret scan: Omise keys found hardcoded in .go files"
else
  PASS_COUNT=$((PASS_COUNT + 1))
  pass "Secret scan: no hardcoded Omise keys in source"
fi

PILLAR_PASS["quality"]=$PASS_COUNT
PILLAR_FAIL["quality"]=$FAIL_COUNT
PILLAR_WARN["quality"]=$WARN_COUNT

# ─── Pillar 4: Shippable — build check ────────────────────────────────────────
section "Shippable — go build + .env check"
PASS_COUNT=0; FAIL_COUNT=0; WARN_COUNT=0

for svc in flight-service booking-service payment-service api-gateway; do
  if [ -f "services/$svc/go.mod" ]; then
    if (cd "services/$svc" && go build ./... 2>&1); then
      PASS_COUNT=$((PASS_COUNT + 1))
      pass "$svc: go build passed"
    else
      FAIL_COUNT=$((FAIL_COUNT + 1))
      fail "$svc: go build FAILED"
    fi
  fi
done

if [ -f ".env" ]; then
  if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    FAIL_COUNT=$((FAIL_COUNT + 1))
    fail ".env is tracked by git — must be in .gitignore"
  else
    PASS_COUNT=$((PASS_COUNT + 1))
    pass ".env exists but is not committed (correct)"
  fi
else
  WARN_COUNT=$((WARN_COUNT + 1))
  warn ".env does not exist — copy .env.example and fill in Omise keys"
fi

PILLAR_PASS["ship"]=$PASS_COUNT
PILLAR_FAIL["ship"]=$FAIL_COUNT
PILLAR_WARN["ship"]=$WARN_COUNT

# ─── Pillar 2: Testing — Layer 4 K6 load tests ────────────────────────────────
if $RUN_PERF && $RUN_LIVE; then
  if require_tool "k6" "https://k6.io/docs/get-started/installation/"; then
    header "K6 Load Tests (Layer 4)"
    echo ""
    echo "  Running: Flight Search — 50 VUs × 30s"
    k6 run tests/k6/search.js --quiet 2>&1 | tail -10
    echo ""
    echo "  Running: Full Booking Flow — 20 VUs × 60s"
    k6 run tests/k6/booking-flow.js --quiet 2>&1 | tail -10
  fi
fi

# ─── Final Report ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  AUTOMATED CHECK SUMMARY${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

print_pillar() {
  local label=$1 key=$2
  local p=${PILLAR_PASS[$key]:-0}
  local f=${PILLAR_FAIL[$key]:-0}
  local w=${PILLAR_WARN[$key]:-0}
  printf "  %-40s  ${GREEN}%2d passed${NC}  ${RED}%2d failed${NC}  ${YELLOW}%2d skipped${NC}\n" \
    "$label" "$p" "$f" "$w"
}

print_pillar "Pillar 1 — Smoke (Working Software)"    "smoke"
print_pillar "Pillar 2 — Contracts (Layer 3)"         "contract"
print_pillar "Pillar 2 — Unit/Integration (Layers 1+2)" "unit"
print_pillar "Pillar 3 — Code Quality"                "quality"
print_pillar "Pillar 4 — Shippable"                   "ship"

TOTAL_PASS=0; TOTAL_FAIL=0
for key in smoke contract unit quality ship; do
  TOTAL_PASS=$((TOTAL_PASS + ${PILLAR_PASS[$key]:-0}))
  TOTAL_FAIL=$((TOTAL_FAIL + ${PILLAR_FAIL[$key]:-0}))
done

TOTAL=$((TOTAL_PASS + TOTAL_FAIL))
[ "$TOTAL" -gt 0 ] && \
  AUTO_SCORE=$(awk "BEGIN {printf \"%.0f\", ($TOTAL_PASS / $TOTAL) * 80}") || \
  AUTO_SCORE=0

echo ""
echo -e "${BOLD}─────────────────────────────────────────────────────────────${NC}"
printf "  %-40s  ${GREEN}%2d passed${NC}  ${RED}%2d failed${NC}\n" \
  "TOTAL ($TOTAL automated checks)" "$TOTAL_PASS" "$TOTAL_FAIL"
echo ""
echo -e "  ${BOLD}Estimated automated score: ~${AUTO_SCORE}/80 points${NC}"
echo ""
echo -e "  ${YELLOW}Remaining 20 points require manual evaluation:${NC}"
echo "    • Failure + retry scenario (manual walkthrough)"
echo "    • Code review: layered arch, error handling, interface-based repos"
echo "    • K6 load test thresholds (if --no-perf was used)"
echo ""
echo -e "  ${BOLD}Full scoring rubric: SCORECARD.md${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
