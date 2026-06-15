#!/usr/bin/env bash
set -euo pipefail

# Exchanges the GitLab CI OIDC token (GCP_ID_TOKEN, requested via the
# `id_tokens` keyword in .gitlab-ci.yml) for short-lived Google Cloud
# credentials via Workload Identity Federation. No service account key
# is ever stored.
#
# Must be *sourced* (not executed) so that GOOGLE_APPLICATION_CREDENTIALS
# is exported into the rest of the job - both `gcloud` and Terraform's
# google provider pick it up automatically.
#
# Required CI/CD variables:
#   GCP_PROJECT_ID              - target GCP project
#   GCP_WORKLOAD_IDENTITY_PROVIDER - full WIF provider resource name
#                                  (terraform output from infra/terraform/project)
#   GCP_SERVICE_ACCOUNT_EMAIL   - CI deployer service account
#                                  (terraform output from infra/terraform/project)

token_file="$(mktemp)"
cred_config="$(mktemp)"
printf '%s' "${GCP_ID_TOKEN}" >"${token_file}"

gcloud iam workload-identity-pools create-cred-config \
  "${GCP_WORKLOAD_IDENTITY_PROVIDER}" \
  --service-account="${GCP_SERVICE_ACCOUNT_EMAIL}" \
  --credential-source-file="${token_file}" \
  --credential-source-type=text \
  --output-file="${cred_config}"

export GOOGLE_APPLICATION_CREDENTIALS="${cred_config}"
gcloud auth login --cred-file="${cred_config}"
gcloud config set project "${GCP_PROJECT_ID}"
