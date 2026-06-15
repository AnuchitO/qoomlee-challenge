terraform {
  required_version = ">= 1.5.7"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # bucket is supplied at `terraform init` time:
  #   terraform init -backend-config="bucket=<PROJECT_ID>-tfstate"
  # (created by scripts/bootstrap.sh)
  backend "gcs" {
    prefix = "prod"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
