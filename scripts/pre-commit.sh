#!/usr/bin/env bash
# scripts/pre-commit.sh — fallback pre-commit checks for contributors who
# don't have the `pre-commit` tool installed.
#
# Install as a git hook with:
#   ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
#
# Mirrors the checks defined in .pre-commit-config.yaml.

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED=0

run_check() {
  local name=$1; shift
  if "$@"; then
    echo -e "${GREEN}✓${NC} $name"
  else
    echo -e "${RED}✗${NC} $name"
    FAILED=1
  fi
}

# gofmt
run_check "gofmt" bash -c '! gofmt -l services | grep -q .'

# go vet
run_check "go vet (qoomlee)" bash -c 'cd services/qoomlee && go vet ./...'
run_check "go vet (payment)" bash -c 'cd services/payment && go vet ./...'

# golangci-lint
if command -v golangci-lint >/dev/null 2>&1; then
  run_check "golangci-lint (qoomlee)" bash -c 'cd services/qoomlee && golangci-lint run ./...'
  run_check "golangci-lint (payment)" bash -c 'cd services/payment && golangci-lint run ./...'
else
  echo -e "${YELLOW}⚠${NC} golangci-lint not installed, skipping"
fi

# eslint
if [ -d app/web/node_modules ]; then
  run_check "eslint" bash -c 'cd app/web && bun run lint'
else
  echo -e "${YELLOW}⚠${NC} app/web/node_modules missing, skipping eslint"
fi

# prettier
if [ -d app/web/node_modules ] && [ -f app/web/node_modules/.bin/prettier ]; then
  run_check "prettier" bash -c 'cd app/web && bunx prettier --check .'
else
  echo -e "${YELLOW}⚠${NC} prettier not installed, skipping"
fi

# gitleaks
if command -v gitleaks >/dev/null 2>&1; then
  run_check "gitleaks" gitleaks protect --staged --redact -v
else
  echo -e "${YELLOW}⚠${NC} gitleaks not installed, skipping"
fi

# hadolint
if command -v hadolint >/dev/null 2>&1; then
  for f in services/*/Dockerfile; do
    run_check "hadolint $f" hadolint "$f"
  done
else
  echo -e "${YELLOW}⚠${NC} hadolint not installed, skipping"
fi

if [ "$FAILED" -ne 0 ]; then
  echo -e "\n${RED}pre-commit checks failed${NC}"
  exit 1
fi

echo -e "\n${GREEN}all pre-commit checks passed${NC}"
