#!/usr/bin/env bash
set -euo pipefail

NAMESPACE=qoomlee-team-00-dev
OVERLAY=infra/k8s/overlays/dev

echo "==> Installing Gateway API CRDs..."
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/standard-install.yaml

echo "==> Waiting for CRDs to be established..."
kubectl wait --for=condition=Established crd/gateways.gateway.networking.k8s.io --timeout=60s
kubectl wait --for=condition=Established crd/httproutes.gateway.networking.k8s.io --timeout=60s

echo "==> Deleting deployments with immutable selectors..."
kubectl delete deployment payment qoomlee web -n "$NAMESPACE" --ignore-not-found

echo "==> Applying k8s overlay..."
kubectl apply -k "$OVERLAY"

echo "==> Done. Checking rollout status..."
kubectl rollout status deployment/payment -n "$NAMESPACE" --timeout=120s
kubectl rollout status deployment/qoomlee -n "$NAMESPACE" --timeout=120s
kubectl rollout status deployment/web     -n "$NAMESPACE" --timeout=120s
