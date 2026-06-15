variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for the Artifact Registry repository"
  type        = string
  default     = "asia-southeast1"
}

variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
  default     = "qoomlee"
}

variable "gitlab_project_path" {
  description = "GitLab namespace/project path for this fork, e.g. \"my-team/qoomlee-challenge\". Used to restrict Workload Identity Federation to this repo's pipelines."
  type        = string
}
