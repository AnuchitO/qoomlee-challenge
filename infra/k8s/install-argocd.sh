#!/usr/bin/env bash
set -euo pipefail

ARGOCD_VERSION="${ARGOCD_VERSION:-v2.14.11}"
NAMESPACE=argocd

echo "==> Creating namespace ${NAMESPACE}..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

echo "==> Installing ArgoCD ${ARGOCD_VERSION}..."
kubectl apply -n "$NAMESPACE" -f \
  "https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"

echo "==> Waiting for ArgoCD deployments to be ready..."
kubectl wait deployment \
  argocd-server \
  argocd-repo-server \
  argocd-application-controller \
  argocd-dex-server \
  argocd-redis \
  -n "$NAMESPACE" \
  --for=condition=Available \
  --timeout=300s

echo "==> ArgoCD is ready."
echo ""
echo "--- Initial admin password ---"
kubectl -n "$NAMESPACE" get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
echo ""
echo ""
echo "--- Access the UI ---"
echo "Run: kubectl port-forward svc/argocd-server -n ${NAMESPACE} 8080:443"
echo "Then open: https://localhost:8080  (user: admin)"
