#!/usr/bin/env bash
# Create an ArgoCD Application for a team with all required resources.
#
# Usage:
#   bash argocd-create-app.sh <team>
#
# Examples:
#   bash argocd-create-app.sh 00
#   bash argocd-create-app.sh 01
#
# Optional env vars:
#   GIT_URL_PATTERN  — Git URL template (default: devrise-team-TEAM-workshop)
#   BRANCH           — Git branch (default: main)
#   POSTGRES_PASSWORD         — DB password (default: changeme)
#   POSTGRES_PAYMENT_PASSWORD — Payment DB password (default: changeme)
#   INTERNAL_TOKEN            — Internal service token (default: dev-internal-token-changeme)
#   OMISE_PUBLIC_KEY          — Omise public key (default: pkey_test_xxx)
#   OMISE_SECRET_KEY          — Omise secret key (default: skey_test_xxx)
set -euo pipefail

TEAM="${1:-}"
GIT_URL_PATTERN="${GIT_URL_PATTERN:-https://gitlab.com/arise-by-infinitas/devrise-team-TEAM-workshop.git}"
CLUSTER_URL="${CLUSTER_URL:-https://kubernetes.default.svc}"
PROJECT="${PROJECT:-default}"
BRANCH="${BRANCH:-main}"

ENV_FILE="${ENV_FILE:-.env}"
if [[ -f "$ENV_FILE" ]]; then
  echo "==> Loading secrets from $ENV_FILE"
  set -a; source "$ENV_FILE"; set +a
fi

if [[ -z "$TEAM" ]]; then
  echo "Usage: bash $0 <team>"
  echo "  team : e.g. 00, 01, 02, 03, 04"
  exit 1
fi

APP_NAME="qoomlee-team-${TEAM}"
GIT_URL="${GIT_URL_PATTERN//TEAM/${TEAM}}"
OVERLAY_PATH="infra/k8s/overlays/team-${TEAM}"
NAMESPACE="qoomlee-team-${TEAM}-dev"
REGISTRY="registry.gitlab.com/arise-by-infinitas/devrise-team-${TEAM}-workshop"

echo "==> Setting up team-${TEAM}"
echo "    App      : $APP_NAME"
echo "    Git URL  : $GIT_URL"
echo "    Path     : $OVERLAY_PATH"
echo "    Branch   : $BRANCH"
echo "    Namespace: $NAMESPACE"
echo "    Registry : $REGISTRY"
echo ""

# ── 1. Create namespace ──────────────────────────────────────────────────────
echo "==> [1/3] Creating namespace ${NAMESPACE}..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ── 2. Create secrets ────────────────────────────────────────────────────────
echo "==> [2/3] Creating secrets..."

kubectl create secret generic qoomlee-secret \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=INTERNAL_TOKEN="${INTERNAL_TOKEN}" \
  --from-literal=JWT_PRIVATE_KEY="${JWT_PRIVATE_KEY:-}" \
  --from-literal=JWT_PUBLIC_KEY="${JWT_PUBLIC_KEY:-}" \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic payment-secret \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=OMISE_PUBLIC_KEY="${OMISE_PUBLIC_KEY}" \
  --from-literal=OMISE_SECRET_KEY="${OMISE_SECRET_KEY}" \
  --from-literal=INTERNAL_TOKEN="${INTERNAL_TOKEN}" \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ── 3. Create ArgoCD Application ─────────────────────────────────────────────
echo "==> [3/3] Creating ArgoCD Application..."

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
        - registry.gitlab.com/arise-by-infinitas/devrise-workshop/qoomlee-service=${REGISTRY}/qoomlee-service
        - registry.gitlab.com/arise-by-infinitas/devrise-workshop/payment-service=${REGISTRY}/payment-service
        - registry.gitlab.com/arise-by-infinitas/devrise-workshop/web=${REGISTRY}/web
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

echo ""
echo "Done. Team-${TEAM} is ready."
echo "  ArgoCD : https://qoomlee-argocd.anuchito.com/applications/${APP_NAME}"
echo "  Web    : https://team-${TEAM}-qoomlee-web.anuchito.com"
echo "  API    : https://team-${TEAM}-qoomlee-api.anuchito.com"
echo "  Payment: https://team-${TEAM}-payment-api.anuchito.com"
echo "  DB     : https://team-${TEAM}-qoomlee-db.anuchito.com"
