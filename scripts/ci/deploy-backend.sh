#!/usr/bin/env bash
set -euo pipefail

# Deploys the qoomlee-service and payment-service images built by this
# pipeline to the <env> VM over an IAP SSH tunnel (no public port 22).
#
# Usage: deploy-backend.sh <dev|prod>
# Required env: GCP_PROJECT_ID, GCP_REGION, GCP_ZONE, AR_REPO,
#   CI_COMMIT_SHORT_SHA, plus the POSTGRES_*/OMISE_*/JWT_*/INTERNAL_TOKEN
#   CI/CD variables consumed by infra/compose/.env.tpl.
#
# Assumes `terraform apply` has already run for infra/terraform/envs/<env>
# in this pipeline (the infra:<env> job).

env_name="$1"
tf_dir="infra/terraform/envs/${env_name}"
remote_dir="/opt/qoomlee"

vm_name=$(terraform -chdir="${tf_dir}" output -raw vm_name)
api_hostname=$(terraform -chdir="${tf_dir}" output -raw api_hostname)
frontend_hostname=$(terraform -chdir="${tf_dir}" output -raw frontend_hostname)

export POSTGRES_QOOMLEE_DB POSTGRES_PAYMENT_DB POSTGRES_USER POSTGRES_PAYMENT_USER \
  POSTGRES_PASSWORD OMISE_PUBLIC_KEY OMISE_SECRET_KEY JWT_PUBLIC_KEY INTERNAL_TOKEN

env_file="$(mktemp)"
envsubst <infra/compose/.env.tpl >"${env_file}"
cat >>"${env_file}" <<EOF
ALLOWED_ORIGINS=https://${frontend_hostname}
CADDY_HOSTNAME=${api_hostname}
IMAGE_TAG=${CI_COMMIT_SHORT_SHA}
GCP_REGION=${GCP_REGION}
GCP_PROJECT_ID=${GCP_PROJECT_ID}
AR_REPO=${AR_REPO}
EOF

ssh_args=(--zone="${GCP_ZONE}" --tunnel-through-iap)

gcloud compute ssh "${vm_name}" "${ssh_args[@]}" \
  --command="sudo mkdir -p ${remote_dir}/infra/caddy && sudo chown -R \$(whoami) ${remote_dir}"

gcloud compute scp "${ssh_args[@]}" \
  docker-compose.yml infra/compose/docker-compose.deploy.yml "${env_file}" \
  "${vm_name}:${remote_dir}/"

gcloud compute scp "${ssh_args[@]}" --recurse \
  infra/caddy/Caddyfile "${vm_name}:${remote_dir}/infra/caddy/"

gcloud compute ssh "${vm_name}" "${ssh_args[@]}" --command="
  set -euo pipefail
  cd ${remote_dir}
  mv $(basename "${env_file}") .env
  gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev --quiet
  docker compose -f docker-compose.yml -f docker-compose.deploy.yml pull
  docker compose -f docker-compose.yml -f docker-compose.deploy.yml up -d
  docker image prune -f
"
