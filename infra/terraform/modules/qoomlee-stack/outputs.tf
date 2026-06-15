output "vm_name" {
  description = "Name of the application VM"
  value       = google_compute_instance.app.name
}

output "vm_external_ip" {
  description = "Ephemeral public IP of the application VM (Caddy listens here)"
  value       = google_compute_instance.app.network_interface[0].access_config[0].nat_ip
}

output "api_hostname" {
  description = "Hostname the frontend should call for the API - Caddy on the VM terminates TLS for this via sslip.io + Let's Encrypt"
  value       = "api-${var.environment}.${replace(google_compute_instance.app.network_interface[0].access_config[0].nat_ip, ".", "-")}.sslip.io"
}

output "vm_service_account_email" {
  description = "Service account the application VM runs as"
  value       = google_service_account.vm.email
}

output "postgres_data_disk_name" {
  description = "Name of the persistent disk holding Postgres data"
  value       = google_compute_disk.postgres_data.name
}

output "frontend_bucket_name" {
  description = "GCS bucket the built Next.js static export should be synced to"
  value       = google_storage_bucket.frontend.name
}

output "frontend_ip" {
  description = "Reserved global IP of the frontend load balancer"
  value       = google_compute_global_address.frontend.address
}

output "frontend_hostname" {
  description = "Public hostname for the frontend (Cloud CDN + managed cert via sslip.io)"
  value       = "app-${var.environment}.${replace(google_compute_global_address.frontend.address, ".", "-")}.sslip.io"
}

output "frontend_url_map" {
  description = "URL map name, used by CI to invalidate the Cloud CDN cache after a deploy"
  value       = google_compute_url_map.frontend.name
}
