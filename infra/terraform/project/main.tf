# Project-level resources shared by both the dev and prod environments:
# enabled APIs, the Artifact Registry image repository, and the GitLab CI
# Workload Identity Federation setup. Applied once per GCP project.

locals {
  required_apis = [
    "compute.googleapis.com",
    "storage.googleapis.com",
    "artifactregistry.googleapis.com",
    "iap.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "sts.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.required_apis)
  project  = var.project_id
  service  = each.value

  disable_on_destroy = false
}

# Single shared repo for both services; images are tagged per-environment
# (e.g. qoomlee-service:dev-<sha>, qoomlee-service:prod-<sha>).
resource "google_artifact_registry_repository" "images" {
  location      = var.region
  repository_id = "${var.name_prefix}-images"
  format        = "DOCKER"
  description   = "Container images for ${var.name_prefix} services (qoomlee-service, payment-service)"

  depends_on = [google_project_service.apis]
}

# --- Workload Identity Federation for GitLab.com CI/CD ---

resource "google_iam_workload_identity_pool" "gitlab" {
  workload_identity_pool_id = "${var.name_prefix}-gitlab-pool"
  display_name              = "GitLab CI"
  description               = "Federated identities for GitLab.com CI/CD pipelines"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "gitlab" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.gitlab.workload_identity_pool_id
  workload_identity_pool_provider_id = "gitlab"
  display_name                       = "gitlab.com"

  attribute_mapping = {
    "google.subject"         = "assertion.sub"
    "attribute.project_path" = "assertion.project_path"
    "attribute.ref"          = "assertion.ref"
  }

  # Only this repo's pipelines may impersonate the CI service account.
  attribute_condition = "assertion.project_path == \"${var.gitlab_project_path}\""

  oidc {
    issuer_uri = "https://gitlab.com"
  }
}

resource "google_service_account" "ci" {
  account_id   = "${var.name_prefix}-ci"
  display_name = "${var.name_prefix} GitLab CI deployer"
}

resource "google_service_account_iam_member" "ci_wif_binding" {
  service_account_id = google_service_account.ci.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.gitlab.name}/attribute.project_path/${var.gitlab_project_path}"
}

resource "google_project_iam_member" "ci_artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.ci.email}"
}

# Lets the CI deploy job sync the built frontend to the frontend buckets
# and invalidate the CDN cache.
resource "google_project_iam_member" "ci_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.ci.email}"
}

resource "google_project_iam_member" "ci_compute_admin" {
  project = var.project_id
  role    = "roles/compute.admin"
  member  = "serviceAccount:${google_service_account.ci.email}"
}
