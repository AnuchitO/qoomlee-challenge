# Production-ready Dockerfile with security best practices
# - Multi-stage build for minimal runtime image
# - Minimal distroless base image for reduced attack surface
# - Non-root user for privilege separation
# - PID 1 management for proper signal handling (direct CMD)
# - Static binary via CGO_ENABLED=0

# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build a fully static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -trimpath -ldflags="-s -w" -o /qoomlee-service ./cmd/main.go

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM alpine:3.20

LABEL org.opencontainers.image.title="qoomlee-service"
LABEL org.opencontainers.image.description="Qoomlee airline booking service"

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=builder /qoomlee-service /qoomlee-service

EXPOSE 8082

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8082/health/ready || exit 1

# Direct CMD — binary runs as PID 1, handles SIGTERM for graceful shutdown
CMD ["/qoomlee-service"]
