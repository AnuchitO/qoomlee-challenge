#!/usr/bin/env bash
# Full dev cluster setup — run once on a fresh cluster or after a reset.
# Usage: bash infra/k8s/setup-dev.sh
set -euo pipefail

NAMESPACE=qoomlee-team-00-dev
OVERLAY=infra/k8s/overlays/dev
ARGOCD_VERSION="${ARGOCD_VERSION:-v2.14.11}"

# ── 1. Gateway API CRDs ───────────────────────────────────────────────────────
echo "==> [1/6] Installing Gateway API CRDs (${ARGOCD_VERSION} not related — pinned separately)..."
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/standard-install.yaml
kubectl wait --for=condition=Established \
  crd/gateways.gateway.networking.k8s.io \
  crd/httproutes.gateway.networking.k8s.io \
  --timeout=60s

# ── 2. GitLab registry pull secret ───────────────────────────────────────────
echo ""
echo "==> [2/6] GitLab registry image pull secret"
echo "    Registry: registry.gitlab.com"
read -rp "    GitLab username: " GL_USER
read -rsp "    GitLab deploy token / PAT (read_registry scope): " GL_TOKEN
echo ""
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret docker-registry gitlab-registry-secret \
  --docker-server=registry.gitlab.com \
  --docker-username="$GL_USER" \
  --docker-password="$GL_TOKEN" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

# ── 3. App secrets ────────────────────────────────────────────────────────────
echo ""
echo "==> [3/6] Creating app secrets from secret.env files..."
if [[ ! -f "$OVERLAY/secret.env" ]]; then
  echo "    ERROR: $OVERLAY/secret.env not found. Copy secret.env.example and fill in values."
  exit 1
fi
if [[ ! -f "$OVERLAY/secret.payment.env" ]]; then
  echo "    ERROR: $OVERLAY/secret.payment.env not found. Copy secret.env.example and fill in values."
  exit 1
fi

kubectl create secret generic qoomlee-secret \
  --from-env-file="$OVERLAY/secret.env" \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic payment-secret \
  --from-env-file="$OVERLAY/secret.payment.env" \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# ── 4. Apply k8s overlay ──────────────────────────────────────────────────────
echo ""
echo "==> [4/6] Applying k8s overlay..."
# Delete deployments first in case selectors are immutable from a prior apply
kubectl delete deployment payment qoomlee web -n "$NAMESPACE" --ignore-not-found
kubectl apply -k "$OVERLAY"

# Patch deployments to use the GitLab pull secret
for d in payment qoomlee web; do
  kubectl patch deployment "$d" -n "$NAMESPACE" \
    -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"gitlab-registry-secret"}]}}}}'
done

# ── 5. Install ArgoCD ─────────────────────────────────────────────────────────
echo ""
echo "==> [5/6] Installing ArgoCD $ARGOCD_VERSION..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f \
  "https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"
kubectl wait deployment \
  argocd-server argocd-repo-server argocd-application-controller \
  argocd-dex-server argocd-redis \
  -n argocd --for=condition=Available --timeout=300s

# ── 6. Expose ArgoCD via LoadBalancer ─────────────────────────────────────────
echo ""
echo "==> [6/6] Exposing ArgoCD server as LoadBalancer..."
kubectl patch svc argocd-server -n argocd -p '{"spec":{"type":"LoadBalancer"}}'

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "✓ Setup complete."
echo ""
echo "--- ArgoCD admin password ---"
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
echo ""
echo ""
echo "--- ArgoCD external IP (may still be <pending>) ---"
kubectl get svc argocd-server -n argocd
echo ""
echo "--- App pods ---"
kubectl get pods -n "$NAMESPACE"
