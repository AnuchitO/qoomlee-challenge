#!/usr/bin/env bash
# Shared utilities for all check scripts

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  echo -e "  ${GREEN}✓ PASS${NC}  $1"
  ((PASS_COUNT++))
}

fail() {
  echo -e "  ${RED}✗ FAIL${NC}  $1"
  ((FAIL_COUNT++))
}

warn() {
  echo -e "  ${YELLOW}⚠ SKIP${NC}  $1"
  ((WARN_COUNT++))
}

section() {
  echo -e "\n${CYAN}${BOLD}── $1 ──${NC}"
}

header() {
  echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  $1${NC}"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

summary() {
  echo -e "\n${BOLD}  Results:${NC} ${GREEN}$PASS_COUNT passed${NC}  ${RED}$FAIL_COUNT failed${NC}  ${YELLOW}$WARN_COUNT skipped${NC}"
}

require_tool() {
  local tool=$1 install_hint=$2
  if ! command -v "$tool" &>/dev/null; then
    warn "$tool not installed — skipping (install: $install_hint)"
    return 1
  fi
  return 0
}

require_stack() {
  local api="${API_BASE:-http://localhost:8080}"
  if ! curl -sf "$api/health" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: API gateway not reachable at $api${NC}"
    echo -e "       Run: ${BOLD}docker compose up --build${NC}"
    exit 1
  fi
}

# curl wrapper: returns body on success, fails with message on non-2xx
api_get() {
  local url=$1
  curl -sf "$url" 2>/dev/null
}

api_post() {
  local url=$1 data=$2
  curl -sf -X POST "$url" -H "Content-Type: application/json" -d "$data" 2>/dev/null
}

# Check HTTP status code only (no body needed)
http_status() {
  local method=$1 url=$2 data=${3:-}
  if [ -n "$data" ]; then
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" -d "$data"
  else
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url"
  fi
}

# Assert jq expression is truthy on JSON input
assert_jq() {
  local desc=$1 json=$2 expr=$3
  if echo "$json" | jq -e "$expr" > /dev/null 2>&1; then
    pass "$desc"
  else
    fail "$desc"
  fi
}

# Assert a regex matches a string
assert_match() {
  local desc=$1 value=$2 pattern=$3
  if [[ "$value" =~ $pattern ]]; then
    pass "$desc"
  else
    fail "$desc (got: '$value')"
  fi
}

assert_equals() {
  local desc=$1 got=$2 expected=$3
  if [ "$got" = "$expected" ]; then
    pass "$desc"
  else
    fail "$desc (expected: '$expected', got: '$got')"
  fi
}

assert_http() {
  local desc=$1 got=$2 expected=$3
  assert_equals "$desc" "$got" "$expected"
}

# Root of repo (one level up from scripts/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_BASE="${API_BASE:-http://localhost:8080}"
