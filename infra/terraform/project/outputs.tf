output "artifact_registry_repository_id" {
  description = "Artifact Registry repository ID, consumed by envs/dev and envs/prod"
  value       = google_artifact_registry_repository.images.repository_id
}

output "ci_service_account_email" {
  description = "GitLab CI deployer service account, consumed by envs/dev and envs/prod"
  value       = google_service_account.ci.email
}

output "workload_identity_provider" {
  description = "Full resource name of the WIF provider - used in GitLab CI's `id_tokens`/`gcloud auth login` config"
  value       = google_iam_workload_identity_pool_provider.gitlab.name
}
