#!/usr/bin/env bash
# Add/update Cloudflare DNS A record for the shared ArgoCD instance.
# Maps qoomlee-argocd.anuchito.com to the ArgoCD Gateway ingress IP.
#
# Usage:
#   CF_API_TOKEN=<token> CF_ZONE_ID=<zone-id> bash cloudflare-argocd.sh [ip]
#
# Examples:
#   # Auto-detect Gateway IP from cluster:
#   CF_API_TOKEN=xxx CF_ZONE_ID=yyy bash cloudflare-argocd.sh
#
#   # Override with explicit IP:
#   CF_API_TOKEN=xxx CF_ZONE_ID=yyy bash cloudflare-argocd.sh 34.1.2.3
#
# Required env vars:
#   CF_API_TOKEN  — Cloudflare API token (Zone:DNS:Edit permission)
#   CF_ZONE_ID    — Zone ID for anuchito.com (Cloudflare dashboard → Overview → right sidebar)
#
# Optional env vars:
#   DOMAIN        — Base domain (default: anuchito.com)
#   PROXIED       — true/false Cloudflare proxy (default: true)
#   GATEWAY_NAME  — k8s Gateway resource name (default: argocd)
#   NAMESPACE     — k8s namespace for Gateway (default: argocd)
set -euo pipefail

EXPLICIT_IP="${1:-}"
DOMAIN="${DOMAIN:-anuchito.com}"
PROXIED="${PROXIED:-true}"
GATEWAY_NAME="${GATEWAY_NAME:-qoomlee}"
NAMESPACE="${NAMESPACE:-argocd}"
HOSTNAME="qoomlee-argocd"

if [[ -z "${CF_API_TOKEN:-}" || -z "${CF_ZONE_ID:-}" ]]; then
  echo "ERROR: CF_API_TOKEN and CF_ZONE_ID must be set"
  exit 1
fi

# ── Resolve Gateway IP ────────────────────────────────────────────────────────
if [[ -n "$EXPLICIT_IP" ]]; then
  IP="$EXPLICIT_IP"
  echo "==> Using explicit IP: $IP"
else
  echo "==> Detecting Gateway IP from cluster (namespace: $NAMESPACE)..."
  for i in $(seq 1 20); do
    IP=$(kubectl get gateway "$GATEWAY_NAME" -n "$NAMESPACE" \
      -o jsonpath='{.status.addresses[0].value}' 2>/dev/null || true)
    if [[ -n "$IP" ]]; then
      echo "    Found: $IP"
      break
    fi
    echo "    Waiting for Gateway IP... ($i/20)"
    sleep 15
  done

  if [[ -z "$IP" ]]; then
    echo "ERROR: Gateway '$GATEWAY_NAME' in namespace '$NAMESPACE' has no IP after 5 minutes."
    echo "  Check: kubectl get gateway $GATEWAY_NAME -n $NAMESPACE"
    exit 1
  fi
fi

# ── Cloudflare helpers ────────────────────────────────────────────────────────
CF_API="https://api.cloudflare.com/client/v4"
CF_HEADERS=(-H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json")

cf_check() {
  # Read JSON from stdin, exit 1 if empty or success!=true, pass through on success.
  python3 -c "
import sys, json
data = sys.stdin.read().strip()
if not data:
    print('  CF ERROR: empty response (check token permissions)', file=sys.stderr)
    sys.exit(1)
r = json.loads(data)
if not r.get('success'):
    print('  CF ERROR:', r.get('errors'), file=sys.stderr)
    sys.exit(1)
sys.stdout.write(data)
"
}

cf_check_warn() {
  # Like cf_check but only warns on failure — does not exit.
  python3 -c "
import sys, json
data = sys.stdin.read().strip()
if not data:
    print('  WARNING: empty response (token may lack Zone:Settings:Edit permission)', file=sys.stderr)
    sys.exit(0)
r = json.loads(data)
if not r.get('success'):
    print('  WARNING:', r.get('errors'), '(skipping)', file=sys.stderr)
    sys.exit(0)
print(' ', r['result']['value'])
" || true
}

upsert_record() {
  local name="$1.${DOMAIN}"
  echo "==> Upserting $name → $IP ..."

  local proxied_val=$([[ "$PROXIED" == "true" ]] && echo "true" || echo "false")
  local payload="{\"type\":\"A\",\"name\":\"${name}\",\"content\":\"${IP}\",\"ttl\":1,\"proxied\":${proxied_val}}"

  local existing
  existing=$(curl -s "${CF_HEADERS[@]}" \
    "${CF_API}/zones/${CF_ZONE_ID}/dns_records?type=A&name=${name}" | \
    cf_check | \
    python3 -c "import sys,json; r=json.load(sys.stdin)['result']; print(r[0]['id'] if r else '')")

  if [[ -n "$existing" ]]; then
    curl -s -X PUT "${CF_HEADERS[@]}" --data "$payload" \
      "${CF_API}/zones/${CF_ZONE_ID}/dns_records/${existing}" | \
      cf_check | \
      python3 -c "import sys,json; r=json.load(sys.stdin); print('  updated:', r['result']['name'], '->', r['result']['content'])"
  else
    curl -s -X POST "${CF_HEADERS[@]}" --data "$payload" \
      "${CF_API}/zones/${CF_ZONE_ID}/dns_records" | \
      cf_check | \
      python3 -c "import sys,json; r=json.load(sys.stdin); print('  created:', r['result']['name'], '->', r['result']['content'])"
  fi
}

echo ""
echo "Domain : $DOMAIN"
echo "Host   : $HOSTNAME"
echo "IP     : $IP"
echo "Proxied: $PROXIED"
echo ""

upsert_record "$HOSTNAME"

echo ""
echo "Done. ArgoCD URL:"
echo "  https://$HOSTNAME.${DOMAIN}"
echo ""
echo "==> Setting Cloudflare SSL/TLS mode to 'full'..."
curl -s -X PATCH "${CF_HEADERS[@]}" \
  --data '{"value":"full"}' \
  "${CF_API}/zones/${CF_ZONE_ID}/settings/ssl" | \
  cf_check_warn
