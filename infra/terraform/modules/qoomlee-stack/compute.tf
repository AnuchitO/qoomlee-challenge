# Service account the VM runs as - only needs to pull images from
# Artifact Registry and write its own logs/metrics.
resource "google_service_account" "vm" {
  account_id   = "${var.name_prefix}-${var.environment}-vm"
  display_name = "${var.name_prefix} ${var.environment} application VM"
}

resource "google_project_iam_member" "vm_artifact_registry_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.vm.email}"
}

resource "google_project_iam_member" "vm_logging_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.vm.email}"
}

resource "google_project_iam_member" "vm_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.vm.email}"
}

# Persistent disk for Postgres data, kept across VM rebuilds and
# protected from accidental `terraform destroy`.
resource "google_compute_disk" "postgres_data" {
  name = "${var.name_prefix}-${var.environment}-postgres-data"
  type = "pd-balanced"
  zone = var.zone
  size = var.data_disk_size_gb

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_compute_resource_policy" "postgres_snapshot_schedule" {
  name   = "${var.name_prefix}-${var.environment}-postgres-snapshots"
  region = var.region

  snapshot_schedule_policy {
    schedule {
      daily_schedule {
        days_in_cycle = 1
        start_time    = "18:00" # ~01:00 Asia/Bangkok
      }
    }

    retention_policy {
      max_retention_days    = var.snapshot_retention_days
      on_source_disk_delete = "KEEP_AUTO_SNAPSHOTS"
    }

    snapshot_properties {
      storage_locations = [var.region]
    }
  }
}

resource "google_compute_disk_resource_policy_attachment" "postgres_data" {
  name = google_compute_resource_policy.postgres_snapshot_schedule.name
  disk = google_compute_disk.postgres_data.name
  zone = var.zone
}

resource "google_compute_instance" "app" {
  name         = "${var.name_prefix}-${var.environment}-vm"
  machine_type = var.vm_machine_type
  zone         = var.zone

  tags = ["${var.name_prefix}-${var.environment}-app"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = 30
      type  = "pd-balanced"
    }
  }

  attached_disk {
    source      = google_compute_disk.postgres_data.self_link
    device_name = "postgres-data"
  }

  network_interface {
    network = "default"
    access_config {} # ephemeral public IP - Caddy terminates TLS here
  }

  service_account {
    email  = google_service_account.vm.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    enable-oslogin = "TRUE"
  }

  metadata_startup_script = templatefile("${path.module}/templates/startup-script.sh.tpl", {
    region = var.region
  })

  allow_stopping_for_update = true
}

# Lets the CI service account open an IAP SSH tunnel to this VM via OS Login.
resource "google_compute_instance_iam_member" "ci_os_admin_login" {
  project       = var.project_id
  zone          = var.zone
  instance_name = google_compute_instance.app.name
  role          = "roles/compute.osAdminLogin"
  member        = "serviceAccount:${var.ci_service_account_email}"
}

resource "google_project_iam_member" "ci_iap_tunnel_resource_accessor" {
  project = var.project_id
  role    = "roles/iap.tunnelResourceAccessor"
  member  = "serviceAccount:${var.ci_service_account_email}"
}
