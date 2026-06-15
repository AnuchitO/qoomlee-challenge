# Static frontend (Next.js `output: "export"`) served from a Cloud Storage
# bucket behind a global external HTTP(S) load balancer with Cloud CDN.

resource "google_storage_bucket" "frontend" {
  name                        = "${var.project_id}-${var.name_prefix}-${var.environment}-frontend"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = var.environment == "dev"

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

resource "google_storage_bucket_iam_member" "frontend_public_read" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_compute_backend_bucket" "frontend" {
  name        = "${var.name_prefix}-${var.environment}-frontend-backend"
  bucket_name = google_storage_bucket.frontend.name
  enable_cdn  = true

  cdn_policy {
    cache_mode  = "CACHE_ALL_STATIC"
    default_ttl = 3600
    client_ttl  = 3600
    max_ttl     = 86400
  }
}

resource "google_compute_global_address" "frontend" {
  name = "${var.name_prefix}-${var.environment}-frontend-ip"
}

# sslip.io resolves "<anything>.<ip>.sslip.io" to <ip> with no DNS records
# needed, which lets Google provision a managed cert against this reserved IP.
resource "google_compute_managed_ssl_certificate" "frontend" {
  name = "${var.name_prefix}-${var.environment}-frontend-cert"

  managed {
    domains = ["app-${var.environment}.${replace(google_compute_global_address.frontend.address, ".", "-")}.sslip.io"]
  }
}

resource "google_compute_url_map" "frontend" {
  name            = "${var.name_prefix}-${var.environment}-frontend-lb"
  default_service = google_compute_backend_bucket.frontend.id
}

resource "google_compute_target_https_proxy" "frontend" {
  name             = "${var.name_prefix}-${var.environment}-frontend-https-proxy"
  url_map          = google_compute_url_map.frontend.id
  ssl_certificates = [google_compute_managed_ssl_certificate.frontend.id]
}

resource "google_compute_global_forwarding_rule" "frontend_https" {
  name                  = "${var.name_prefix}-${var.environment}-frontend-https"
  ip_address            = google_compute_global_address.frontend.address
  ip_protocol           = "TCP"
  port_range            = "443"
  load_balancing_scheme = "EXTERNAL"
  target                = google_compute_target_https_proxy.frontend.id
}

# Plain HTTP redirects to HTTPS.
resource "google_compute_url_map" "frontend_http_redirect" {
  name = "${var.name_prefix}-${var.environment}-frontend-http-redirect"

  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_target_http_proxy" "frontend_redirect" {
  name    = "${var.name_prefix}-${var.environment}-frontend-http-proxy"
  url_map = google_compute_url_map.frontend_http_redirect.id
}

resource "google_compute_global_forwarding_rule" "frontend_http" {
  name                  = "${var.name_prefix}-${var.environment}-frontend-http"
  ip_address            = google_compute_global_address.frontend.address
  ip_protocol           = "TCP"
  port_range            = "80"
  load_balancing_scheme = "EXTERNAL"
  target                = google_compute_target_http_proxy.frontend_redirect.id
}
