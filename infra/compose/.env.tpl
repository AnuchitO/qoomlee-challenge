# Template for the .env rendered on the VM during deploy (see
# scripts/ci/deploy-backend.sh). Values come from GitLab CI/CD
# masked+protected variables, scoped per environment (dev/prod).
# ALLOWED_ORIGINS, CADDY_HOSTNAME, IMAGE_TAG and the Artifact Registry
# coordinates are appended by deploy-backend.sh from Terraform outputs.
POSTGRES_QOOMLEE_DB=${POSTGRES_QOOMLEE_DB}
POSTGRES_PAYMENT_DB=${POSTGRES_PAYMENT_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PAYMENT_USER=${POSTGRES_PAYMENT_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
OMISE_PUBLIC_KEY=${OMISE_PUBLIC_KEY}
OMISE_SECRET_KEY=${OMISE_SECRET_KEY}
JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY}
INTERNAL_TOKEN=${INTERNAL_TOKEN}
