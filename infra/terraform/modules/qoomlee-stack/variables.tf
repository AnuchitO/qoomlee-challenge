variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "environment" {
  description = "Environment name, used in resource naming and tagging"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be \"dev\" or \"prod\"."
  }
}

variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
  default     = "qoomlee"
}

variable "region" {
  description = "GCP region for regional resources (frontend LB, snapshot storage)"
  type        = string
  default     = "asia-southeast1"
}

variable "zone" {
  description = "GCP zone for the application VM and its data disk"
  type        = string
  default     = "asia-southeast1-a"
}

variable "vm_machine_type" {
  description = "Machine type for the application VM running docker-compose"
  type        = string
  default     = "e2-medium"
}

variable "data_disk_size_gb" {
  description = "Size in GB of the persistent disk holding Postgres data"
  type        = number
  default     = 20
}

variable "snapshot_retention_days" {
  description = "How many days to keep automatic Postgres data disk snapshots"
  type        = number
  default     = 7
}

variable "ci_service_account_email" {
  description = "Email of the CI/CD service account (from the project-level Terraform) granted IAP tunnel + OS Login access to this environment's VM"
  type        = string
}

variable "artifact_registry_repository_id" {
  description = "Artifact Registry repository ID (from the project-level Terraform) the VM's service account may pull images from"
  type        = string
}
