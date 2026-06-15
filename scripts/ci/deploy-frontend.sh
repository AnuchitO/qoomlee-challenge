#!/usr/bin/env bash
set -euo pipefail

# Builds the Next.js static export against the <env> API and syncs it to
# the frontend's GCS bucket, then invalidates the Cloud CDN cache.
#
# Usage: deploy-frontend.sh <dev|prod>
# Assumes `terraform apply` has already run for infra/terraform/envs/<env>
# in this pipeline (the infra:<env> job).

env_name="$1"
tf_dir="infra/terraform/envs/${env_name}"

api_hostname=$(terraform -chdir="${tf_dir}" output -raw api_hostname)
bucket=$(terraform -chdir="${tf_dir}" output -raw frontend_bucket_name)
url_map=$(terraform -chdir="${tf_dir}" output -raw frontend_url_map)

export NEXT_PUBLIC_QOOMLEE_API_URL="https://${api_hostname}"
export NEXT_PUBLIC_ENABLE_TEST_SCENARIOS=false
export NEXT_PUBLIC_ENABLE_ALT_PAYMENT_METHODS=false

(cd app/web && bun install --frozen-lockfile && bun run build)

gsutil -m rsync -r -d app/web/out "gs://${bucket}"

gcloud compute url-maps invalidate-cdn-cache "${url_map}" --path="/*" --async
