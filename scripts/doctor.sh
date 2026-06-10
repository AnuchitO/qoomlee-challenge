#!/usr/bin/env bash
# scripts/doctor.sh — Flutter-doctor style environment readiness check.
#
# Checks toolchain versions, Docker state, env files, dependency installs,
# and running container health. Prints actionable install hints for
# anything missing or out of date.

set -uo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

ISSUES=0

ok()   { echo -e "  ${GREEN}✅${NC}  $1"; }
err()  { echo -e "  ${RED}❌${NC}  $1"; ((ISSUES++)); }
warn() { echo -e "  ${YELLOW}⚠️${NC}  $1"; ((ISSUES++)); }
hint() { echo -e "      ${YELLOW}↳ $1${NC}"; }
section() { echo -e "\n${BOLD}$1${NC}"; }

version_ge() {
  # version_ge <have> <want> -> 0 if have >= want
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

# ── Go ───────────────────────────────────────────────────────────────────
section "Go"
if command -v go >/dev/null 2>&1; then
  GO_VER=$(go version | awk '{print $3}' | sed 's/go//')
  if version_ge "$GO_VER" "1.21"; then
    ok "Go $GO_VER (>= 1.21)"
  else
    err "Go $GO_VER found, need >= 1.21"
    hint "Install: brew install go"
  fi
else
  err "Go not found"
  hint "Install: brew install go"
fi

# ── Node / bun ───────────────────────────────────────────────────────────
section "Node.js"
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node -v | sed 's/v//')
  if version_ge "$NODE_VER" "18.0.0"; then
    ok "Node $NODE_VER (>= 18)"
  else
    err "Node $NODE_VER found, need >= 18"
    hint "Install: brew install node"
  fi
else
  err "Node not found"
  hint "Install: brew install node"
fi

if command -v bun >/dev/null 2>&1; then
  ok "bun $(bun --version)"
else
  err "bun not found"
  hint "Install: curl -fsSL https://bun.sh/install | bash"
fi

# ── Docker ───────────────────────────────────────────────────────────────
section "Docker"
if command -v docker >/dev/null 2>&1; then
  ok "docker $(docker --version | sed 's/Docker version //;s/,.*//')"
  if docker info >/dev/null 2>&1; then
    ok "Docker daemon is running"
  else
    err "Docker daemon is not running"
    hint "Start Docker Desktop"
  fi
else
  err "docker not found"
  hint "Install: https://www.docker.com/products/docker-desktop/"
fi

if docker compose version >/dev/null 2>&1; then
  ok "docker compose v2 ($(docker compose version --short 2>/dev/null))"
elif command -v docker-compose >/dev/null 2>&1; then
  warn "only docker-compose v1 found (v2 plugin recommended)"
else
  err "docker compose not found"
  hint "Install Docker Desktop (includes compose v2)"
fi

# ── Git / Make ───────────────────────────────────────────────────────────
section "Core tools"
if command -v git >/dev/null 2>&1; then
  ok "git $(git --version | awk '{print $3}')"
else
  err "git not found"
  hint "Install: brew install git"
fi

if command -v make >/dev/null 2>&1; then
  ok "make $(make --version | head -1 | awk '{print $3}')"
else
  err "make not found"
  hint "Install: brew install make (or Xcode CLI tools)"
fi

# ── Linters / security tools ───────────────────────────────────────────
section "Linters & security tools"
if command -v golangci-lint >/dev/null 2>&1; then
  ok "golangci-lint $(golangci-lint version 2>/dev/null | awk '{print $4}')"
else
  warn "golangci-lint not found"
  hint "Install: brew install golangci-lint"
fi

if command -v govulncheck >/dev/null 2>&1; then
  ok "govulncheck installed"
else
  warn "govulncheck not found"
  hint "Install: go install golang.org/x/vuln/cmd/govulncheck@latest"
fi

if command -v gitleaks >/dev/null 2>&1; then
  ok "gitleaks $(gitleaks version 2>/dev/null | head -1)"
else
  warn "gitleaks not found"
  hint "Install: brew install gitleaks"
fi

if command -v hadolint >/dev/null 2>&1; then
  ok "hadolint installed"
else
  warn "hadolint not found"
  hint "Install: brew install hadolint"
fi

# ── Pre-commit hooks ─────────────────────────────────────────────────────
section "Pre-commit hooks"
if command -v pre-commit >/dev/null 2>&1; then
  ok "pre-commit $(pre-commit --version 2>/dev/null | awk '{print $2}')"

  if [ -f .pre-commit-config.yaml ]; then
    ok ".pre-commit-config.yaml present"
  else
    err ".pre-commit-config.yaml missing"
    hint "Create it or restore from git"
  fi

  if [ -f .git/hooks/pre-commit ] && grep -q "pre-commit" .git/hooks/pre-commit 2>/dev/null; then
    ok "pre-commit hooks installed in .git/hooks/"
  else
    err "pre-commit hooks not installed"
    hint "Run: pre-commit install"
  fi
else
  err "pre-commit not found"
  hint "Install: brew install pre-commit  then  pre-commit install"
fi

# ── Playwright browsers ──────────────────────────────────────────────────
section "Playwright"
if [ -d "$HOME/.cache/ms-playwright" ] && [ -n "$(ls -A "$HOME/.cache/ms-playwright" 2>/dev/null)" ]; then
  ok "Playwright browsers installed"
else
  warn "Playwright browsers not installed"
  hint "Install: cd app/web && bunx playwright install"
fi

# ── Env files ─────────────────────────────────────────────────────────────
section "Environment files"
if [ -f .env ]; then
  ok ".env exists"
else
  err ".env missing"
  hint "Run: cp .env.example .env"
fi

if [ -f .env.example ]; then
  ok ".env.example exists"
else
  warn ".env.example missing"
fi

# ── Dependencies ──────────────────────────────────────────────────────────
section "Dependencies"
if [ -d app/web/node_modules ]; then
  ok "app/web/node_modules installed"
else
  err "app/web/node_modules missing"
  hint "Run: cd app/web && bun install"
fi

for svc in qoomlee payment; do
  GOMOD="services/$svc/go.mod"
  if [ -f "$GOMOD" ]; then
    if (cd "services/$svc" && go list -m all >/dev/null 2>&1); then
      ok "services/$svc Go deps downloaded"
    else
      err "services/$svc Go deps not downloaded"
      hint "Run: cd services/$svc && go mod download"
    fi
  fi
done

# ── Running containers ───────────────────────────────────────────────────
section "Docker containers"
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  for port in 3000 8082 8084 5433 5434; do
    case $port in
      3000) svc_name="frontend        (Next.js)" ;;
      8082) svc_name="qoomlee-service  (Go API)" ;;
      8084) svc_name="payment-service  (Go API)" ;;
      5433) svc_name="postgres-qoomlee (DB)" ;;
      5434) svc_name="postgres-payment (DB)" ;;
      *)    svc_name="unknown" ;;
    esac
    cid=$(docker ps --filter "publish=$port" -q | head -1)
    if [ -n "$cid" ]; then
      status=$(docker inspect -f '{{.State.Health.Status}}' "$cid" 2>/dev/null || echo "running")
      if [ "$status" = "healthy" ] || [ "$status" = "running" ] || [ -z "$status" ]; then
        ok "port $port  $svc_name  ($status)"
      else
        warn "port $port  $svc_name  status=$status"
      fi
    else
      warn "port $port  $svc_name  no container listening"
      hint "Run: make up-d"
    fi
  done
else
  warn "Docker not running — skipping container health checks"
fi

# ── Summary ───────────────────────────────────────────────────────────────
echo ""
if [ "$ISSUES" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}No issues found. You're ready to go!${NC}"
else
  echo -e "${YELLOW}${BOLD}$ISSUES issue(s) found.${NC} Run \`make setup\` to fix automatically."
fi

exit 0
