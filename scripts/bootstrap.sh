#!/usr/bin/env bash
# One-time setup for a forked copy of this repo: creates the GCS bucket
# Terraform uses for remote state, and enables the APIs needed before any
# `terraform apply` can run.
#
# Usage: ./scripts/bootstrap.sh <PROJECT_ID> [REGION]
set -euo pipefail

PROJECT_ID="${1:?Usage: $0 <PROJECT_ID> [REGION]}"
REGION="${2:-asia-southeast1}"
BUCKET="${PROJECT_ID}-tfstate"

gcloud config set project "$PROJECT_ID"

gcloud services enable \
  compute.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com \
  iap.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  sts.googleapis.com

if ! gcloud storage buckets describe "gs://${BUCKET}" >/dev/null 2>&1; then
  gcloud storage buckets create "gs://${BUCKET}" \
    --project="$PROJECT_ID" \
    --location="$REGION" \
    --uniform-bucket-level-access

  gcloud storage buckets update "gs://${BUCKET}" --versioning
else
  echo "Bucket gs://${BUCKET} already exists, skipping creation."
fi

cat <<EOF

Bootstrap complete. Terraform state bucket: gs://${BUCKET}

Next steps:
  cd infra/terraform/project && terraform init -backend-config="bucket=${BUCKET}"
  # fill in terraform.tfvars (see terraform.tfvars.example), then:
  terraform apply

  cd ../envs/dev && terraform init -backend-config="bucket=${BUCKET}"
  # fill in terraform.tfvars (see terraform.tfvars.example), then:
  terraform apply

  cd ../prod && terraform init -backend-config="bucket=${BUCKET}"
  terraform apply
EOF
