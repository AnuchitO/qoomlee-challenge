#!/usr/bin/env bash
set -euo pipefail

# Builds and pushes a service image to Artifact Registry, tagged with the
# pipeline's commit SHA.
#
# Usage: build-push.sh <image-name> <build-context>
# Required env: GCP_PROJECT_ID, GCP_REGION, AR_REPO, CI_COMMIT_SHORT_SHA

image_name="$1"
build_context="$2"

gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev" --quiet

image="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${AR_REPO}/${image_name}:${CI_COMMIT_SHORT_SHA}"

docker build -t "${image}" "${build_context}"
docker push "${image}"
