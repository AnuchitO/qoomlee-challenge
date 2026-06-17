#!/usr/bin/env bash
# Create an ArgoCD Application for a team.
#
# Usage:
#   bash argocd-create-app.sh <team>
#
# Examples:
#   bash argocd-create-app.sh 00
#   bash argocd-create-app.sh 01
#   bash argocd-create-app.sh 02
set -euo pipefail

TEAM="${1:-}"
GIT_URL_PATTERN="${GIT_URL_PATTERN:-https://gitlab.com/arise-by-infinitas/devrise-team-${TEAM}-workshop.git}"
CLUSTER_URL="${CLUSTER_URL:-https://kubernetes.default.svc}"
PROJECT="${PROJECT:-default}"
BRANCH="${BRANCH:-main}"

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

echo "==> Creating ArgoCD Application: $APP_NAME"
echo "    Git URL  : $GIT_URL"
echo "    Path     : $OVERLAY_PATH"
echo "    Branch   : $BRANCH"
echo "    Cluster  : $CLUSTER_URL"
echo "    Namespace: $NAMESPACE"
echo "    Registry : $REGISTRY"
echo ""

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
echo "Done. Application '$APP_NAME' created."
echo "  ArgoCD UI: https://qoomlee-argocd.anuchito.com/applications/${APP_NAME}"
