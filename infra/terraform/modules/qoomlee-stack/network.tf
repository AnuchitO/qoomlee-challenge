# Firewall rules for the application VM. The default VPC's implicit
# deny-all means SSH (22) is only reachable via the IAP tunnel range -
# there is no public SSH access.

resource "google_compute_firewall" "allow_iap_ssh" {
  name    = "${var.name_prefix}-${var.environment}-allow-iap-ssh"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # Cloud IAP's well-known TCP forwarding range.
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["${var.name_prefix}-${var.environment}-app"]
}

resource "google_compute_firewall" "allow_http_https" {
  name    = "${var.name_prefix}-${var.environment}-allow-http-https"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["${var.name_prefix}-${var.environment}-app"]
}
