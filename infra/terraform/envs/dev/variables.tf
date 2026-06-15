variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-southeast1"
}

variable "zone" {
  description = "GCP zone for the application VM"
  type        = string
  default     = "asia-southeast1-a"
}

variable "state_bucket" {
  description = "GCS bucket holding Terraform state (created by scripts/bootstrap.sh) - used to read the project-level outputs"
  type        = string
}

variable "vm_machine_type" {
  description = "Machine type for the application VM"
  type        = string
  default     = "e2-medium"
}

variable "data_disk_size_gb" {
  description = "Size in GB of the persistent disk holding Postgres data"
  type        = number
  default     = 20
}
