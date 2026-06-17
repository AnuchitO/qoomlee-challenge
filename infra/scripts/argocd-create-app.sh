#!/usr/bin/env bash
# Create/update an ArgoCD Application for a team with all required resources.
#
# Usage:
#   bash argocd-create-app.sh <team>
#
# Examples:
#   bash argocd-create-app.sh 00
#   bash argocd-create-app.sh 01
#
# Loads secrets from .env (or ENV_FILE). Required keys in .env:
#   POSTGRES_PASSWORD, INTERNAL_TOKEN, OMISE_PUBLIC_KEY, OMISE_SECRET_KEY
#
# Optional env vars:
#   ENV_FILE         — Path to env file (default: .env)
#   GIT_URL_PATTERN  — Git URL template (default: devrise-team-TEAM-workshop)
#   BRANCH           — Git branch (default: main)
set -euo pipefail

TEAM="${1:-}"

if [[ -z "$TEAM" ]]; then
  echo "Usage: bash $0 <team>"
  echo "  team : e.g. 00, 01, 02, 03, 04"
  exit 1
fi

# ── Load .env ─────────────────────────────────────────────────────────────────
ENV_FILE="${ENV_FILE:-.env}"
if [[ -f "$ENV_FILE" ]]; then
  echo "==> Loading secrets from $ENV_FILE"
  set -a; source "$ENV_FILE"; set +a
fi

# ── Validate required vars ────────────────────────────────────────────────────
MISSING=()
for VAR in POSTGRES_PASSWORD INTERNAL_TOKEN OMISE_PUBLIC_KEY OMISE_SECRET_KEY; do
  if [[ -z "${!VAR:-}" ]]; then
    MISSING+=("$VAR")
  fi
done
if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "ERROR: Missing required env vars: ${MISSING[*]}"
  echo "  Set them in $ENV_FILE or export them before running."
  exit 1
fi

# ── Derive names ──────────────────────────────────────────────────────────────
GIT_URL_PATTERN="${GIT_URL_PATTERN:-https://gitlab.com/arise-by-infinitas/devrise-team-TEAM-workshop.git}"
CLUSTER_URL="${CLUSTER_URL:-https://kubernetes.default.svc}"
PROJECT="${PROJECT:-default}"
BRANCH="${BRANCH:-main}"

APP_NAME="qoomlee-team-${TEAM}"
GIT_URL="${GIT_URL_PATTERN//TEAM/${TEAM}}"
OVERLAY_PATH="infra/k8s/overlays/dev"
NAMESPACE="qoomlee-team-${TEAM}"
REGISTRY="registry.gitlab.com/arise-by-infinitas/devrise-team-${TEAM}-workshop"

QOOMLEE_DB_URL="postgresql://qoomlee:${POSTGRES_PASSWORD}@postgres-qoomlee.${NAMESPACE}.svc.cluster.local:5432/qoomlee?sslmode=disable"
PAYMENT_DB_URL="postgresql://qoomlee_payment:${POSTGRES_PASSWORD}@postgres-payment.${NAMESPACE}.svc.cluster.local:5432/qoomlee_payment?sslmode=disable"

echo "==> Setting up team-${TEAM}"
echo "    App      : $APP_NAME"
echo "    Git URL  : $GIT_URL"
echo "    Path     : $OVERLAY_PATH"
echo "    Branch   : $BRANCH"
echo "    Namespace: $NAMESPACE"
echo "    Registry : $REGISTRY"
echo ""

# ── 1. Create namespace ──────────────────────────────────────────────────────
echo "==> [1/4] Creating namespace ${NAMESPACE}..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ── 2. Create secrets ────────────────────────────────────────────────────────
echo "==> [2/4] Creating secrets..."

kubectl create secret generic qoomlee-secret \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=DATABASE_URL="${QOOMLEE_DB_URL}" \
  --from-literal=INTERNAL_TOKEN="${INTERNAL_TOKEN}" \
  --from-literal=JWT_PRIVATE_KEY="${JWT_PRIVATE_KEY:-}" \
  --from-literal=JWT_PUBLIC_KEY="${JWT_PUBLIC_KEY:-}" \
  --from-literal=JWT_TOKEN="${JWT_TOKEN:-}" \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic payment-secret \
  --from-literal=POSTGRES_PAYMENT_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=DATABASE_URL="${PAYMENT_DB_URL}" \
  --from-literal=OMISE_PUBLIC_KEY="${OMISE_PUBLIC_KEY}" \
  --from-literal=OMISE_SECRET_KEY="${OMISE_SECRET_KEY}" \
  --from-literal=INTERNAL_TOKEN="${INTERNAL_TOKEN}" \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ── 3. Create ArgoCD Application ─────────────────────────────────────────────
echo "==> [3/4] Creating ArgoCD Application..."

cat <<EOF | kubectl apply -f -
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ${APP_NAME}
  namespace: argocd
spec:
  project: ${PROJECT}
  source:
    repoURL: ${GIT_URL}
    targetRevision: ${BRANCH}
    path: ${OVERLAY_PATH}
    kustomize:
      images:
        - registry.gitlab.com/arise-by-infinitas/devrise-team-${TEAM}-workshop/qoomlee-service=${REGISTRY}/qoomlee-service
        - registry.gitlab.com/arise-by-infinitas/devrise-team-${TEAM}-workshop/payment-service=${REGISTRY}/payment-service
        - registry.gitlab.com/arise-by-infinitas/devrise-team-${TEAM}-workshop/web=${REGISTRY}/web
  destination:
    server: ${CLUSTER_URL}
    namespace: ${NAMESPACE}
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF

# ── 4. Create DNS records (if CF_API_TOKEN is set) ───────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ -n "${CF_API_TOKEN:-}" && -n "${CF_ZONE_ID:-}" ]]; then
  echo "==> [4/4] Creating Cloudflare DNS records..."
  bash "${SCRIPT_DIR}/cloudflare-dns.sh" "$TEAM"
else
  echo "==> [4/4] Skipping DNS (set CF_API_TOKEN and CF_ZONE_ID to create records)"
fi

echo ""
echo "Done. Team-${TEAM} is ready."
echo "  ArgoCD : https://qoomlee-argocd.anuchito.com/applications/${APP_NAME}"
echo "  Web    : https://team-${TEAM}-qoomlee-web.anuchito.com"
echo "  API    : https://team-${TEAM}-qoomlee-api.anuchito.com"
echo "  Payment: https://team-${TEAM}-payment-api.anuchito.com"
echo "  DB     : https://team-${TEAM}-qoomlee-db.anuchito.com"
