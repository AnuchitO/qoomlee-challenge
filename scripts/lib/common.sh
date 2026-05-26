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
  local api="${QOOMLEE_SERVICE_URL:-http://localhost:8082}"
  if ! curl -sf "$api/health/live" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: qoomlee-service not reachable at $api${NC}"
    echo -e "       Run: ${BOLD}docker compose up --build${NC}"
    exit 1
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
QOOMLEE_SERVICE_URL="${QOOMLEE_SERVICE_URL:-http://localhost:8082}"
PAYMENT_SERVICE_URL="${PAYMENT_SERVICE_URL:-http://localhost:8084}"

# ── JWT token for API calls ──────────────────────────────────────────────────
# Generates a short-lived RS256 JWT signed with JWT_PRIVATE_KEY from .env.
# Requires: openssl, python3 (base64 encoding helper).
# Falls back to empty string if JWT_PRIVATE_KEY is not set (unauthenticated calls
# will return 401 — that is the expected behaviour for missing-token tests).
_jwt_token=""
get_jwt_token() {
  if [ -n "$_jwt_token" ]; then
    echo "$_jwt_token"
    return
  fi

  # Load .env if present
  if [ -f "$REPO_ROOT/.env" ]; then
    set -o allexport
    # shellcheck disable=SC1091
    source "$REPO_ROOT/.env"
    set +o allexport
  fi

  if [ -z "${JWT_PRIVATE_KEY:-}" ]; then
    warn "JWT_PRIVATE_KEY not set in .env — API calls will be unauthenticated"
    _jwt_token=""
    echo ""
    return
  fi

  # Write key to temp file (replace literal \n with real newlines)
  local tmpkey
  tmpkey=$(mktemp)
  printf '%b' "$JWT_PRIVATE_KEY" > "$tmpkey"

  # Build JWT: header.payload.signature (RS256)
  local header payload sig b64h b64p
  b64h=$(printf '{"alg":"RS256","typ":"JWT"}' | openssl base64 -A | tr '+/' '-_' | tr -d '=')
  b64p=$(printf '{"sub":"test-script","iat":%d,"exp":%d}' "$(date +%s)" "$(( $(date +%s) + 3600 ))" \
         | openssl base64 -A | tr '+/' '-_' | tr -d '=')
  sig=$(printf '%s.%s' "$b64h" "$b64p" \
        | openssl dgst -sha256 -sign "$tmpkey" \
        | openssl base64 -A | tr '+/' '-_' | tr -d '=')
  rm -f "$tmpkey"

  _jwt_token="${b64h}.${b64p}.${sig}"
  echo "$_jwt_token"
}

# curl wrappers — automatically add Authorization header
api_get() {
  local url=$1
  local tok
  tok=$(get_jwt_token)
  curl -sf -H "Authorization: Bearer $tok" "$url" 2>/dev/null
}

api_post() {
  local url=$1 data=$2
  local tok
  tok=$(get_jwt_token)
  curl -sf -X POST "$url" \
    -H "Authorization: Bearer $tok" \
    -H "Content-Type: application/json" \
    -d "$data" 2>/dev/null
}

http_status() {
  local method=$1 url=$2 data=${3:-}
  local tok
  tok=$(get_jwt_token)
  if [ -n "$data" ]; then
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" \
      -H "Authorization: Bearer $tok" \
      -H "Content-Type: application/json" -d "$data"
  else
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" \
      -H "Authorization: Bearer $tok"
  fi
}
