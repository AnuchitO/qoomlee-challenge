# Reads outputs from the project-level Terraform (applied once, before
# either environment) to wire up IAM for this environment's VM.
data "terraform_remote_state" "project" {
  backend = "gcs"

  config = {
    bucket = var.state_bucket
    prefix = "project"
  }
}

module "stack" {
  source = "../../modules/qoomlee-stack"

  project_id  = var.project_id
  environment = "dev"
  region      = var.region
  zone        = var.zone

  vm_machine_type   = var.vm_machine_type
  data_disk_size_gb = var.data_disk_size_gb

  ci_service_account_email        = data.terraform_remote_state.project.outputs.ci_service_account_email
  artifact_registry_repository_id = data.terraform_remote_state.project.outputs.artifact_registry_repository_id
}
