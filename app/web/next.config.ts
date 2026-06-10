import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// unsafe-eval is needed in dev for Turbopack hot-reload; removed in production
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

// connect-src needs ws:// for Next.js dev HMR; not needed in production
const connectSrc = isDev
  ? "connect-src 'self' ws://localhost:* wss://localhost:*"
  : "connect-src 'self'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // profile image in TopAppBar is served from Google's CDN
  "img-src 'self' data: blob: https://lh3.googleusercontent.com",
  connectSrc,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  // Directives that do NOT fall back to default-src — must be explicit
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // Clickjacking protection
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit Referer header leakage
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser feature access
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // Prevent cross-origin reads of our static assets
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Limit what a cross-origin page can do with a window reference to ours
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // Explicit COEP — 'unsafe-none' is the permissive default but declaring it
  // signals intent and satisfies ZAP's "header not set" check
  { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
  { key: "Content-Security-Policy", value: csp },
  // NOTE: do NOT add Cache-Control here — Next.js manages it per-asset:
  //   - /_next/static/**  → public, max-age=31536000, immutable (content-hashed)
  //   - HTML pages        → no-cache (forces revalidation on each navigation)
  // Overriding would break static-asset caching and is handled in Go middleware.
];

const nextConfig: NextConfig = {
  // Remove the X-Powered-By: Next.js fingerprinting header
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
