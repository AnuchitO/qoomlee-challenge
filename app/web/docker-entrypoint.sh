#!/bin/sh
set -e

find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.html' \) \
  -exec sed -i \
    -e "s|__QOOMLEE_API_PLACEHOLDER__|${NEXT_PUBLIC_QOOMLEE_API_URL:-}|g" \
    -e "s|__PAYMENT_API_PLACEHOLDER__|${NEXT_PUBLIC_PAYMENT_API_URL:-}|g" \
    {} +

exec "$@"
