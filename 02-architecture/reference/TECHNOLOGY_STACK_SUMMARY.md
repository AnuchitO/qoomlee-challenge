# Qoomlee Technology Stack — Module-by-Module Summary

> ⚠️ **Aspirational** — Describes a future multi-service architecture. Current system is 2 Go services + Next.js. See `02-architecture/README.md` for actual architecture.

## Module-by-Module Technology Stack

| Module | Language | Framework | Database | Cache | Key Libraries |
|--------|----------|-----------|----------|-------|---------------|
| **Booking Service** | Kotlin | Spring Boot | PostgreSQL | Redis | Spring State Machine, JPA/Hibernate |
| **Passenger Service** | Kotlin | Spring Boot | PostgreSQL | Redis | Spring Validation, JPA/Hibernate |
| **Flight Service** | Kotlin | Spring Boot | PostgreSQL | — | JPA/Hibernate |
| **Identity Service** | Kotlin | Spring Boot | PostgreSQL | Redis | Spring Security, JWT, OAuth2 |
| **Notification Service** | Kotlin | Spring Boot | — | Redis Streams | SendGrid, Twilio |
| **Check-in Service** | Go | Gin | PostgreSQL | Redis | PDF generation, IATA BCBP |
| **Payment Service** | Go | Gin | PostgreSQL | — | Omise API, Gorilla Mux |
| **Seat Service** | Kotlin | Spring Boot | PostgreSQL | Redis | Spring State Machine, JPA |
| **API Gateway** | Go | Standard library | — | — | JWT, Rate Limiting |
| **Web Frontend** | TypeScript | Next.js | — | — | React, Tailwind CSS |
| **iOS App** | Swift | SwiftUI | — | — | URLSession, Push Notifications |
| **Android App** | Kotlin | Jetpack Compose | — | — | Retrofit, Firebase |

## Database Strategy

| Service | Database | Justification |
|---------|----------|---------------|
| Booking | PostgreSQL | ACID transactions for PNR management |
| Passenger | PostgreSQL | Relational data with document storage (JSONB) |
| Flight | PostgreSQL | Schedule data with complex queries |
| Payment | PostgreSQL | Financial transaction integrity |
| Identity | PostgreSQL | User/role data with audit logging |
| Check-in | PostgreSQL | Check-in state with offline cache |
| Seat | PostgreSQL | Inventory with optimistic locking |
| Notification | — | Stateless; uses Redis Streams for event processing |

## Cache Strategy

| Use Case | TTL | Purpose |
|----------|-----|---------|
| Seat availability | 30 sec | Fast-reject before DB query |
| Check-in manifest | 5 min | High-throughput check-in |
| Session tokens | 15 min | JWT validation |
| Rate limit counters | 1 min | Per-user rate limiting |
| Notification dedup | 10 min | Prevent duplicate sends |

## Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Container Runtime | Docker | Service packaging |
| Orchestration | Kubernetes | Service management |
| Monitoring | Prometheus + Grafana | Metrics & dashboards |
| Tracing | Jaeger | Distributed tracing |
| Secrets | HashiCorp Vault | API keys, credentials |
| CI/CD | GitLab CI | Automated pipeline |
| Cloud | GCP Cloud Run | Serverless deployment |

## Language Selection Rationale

### Kotlin / Spring Boot (5 services)
- Rich ecosystem for business logic (validation, state machines, security)
- Strong typing reduces runtime errors
- Spring Boot's mature integration with PostgreSQL, Redis, JPA
- Consistent with team's primary expertise

### Go / Gin (3 services)
- Low memory footprint, fast startup (ideal for API Gateway, Payment, Check-in)
- Excellent concurrency model for high-throughput services (Check-in)
- Simple deployment (single binary)
- Good for CPU-bound tasks (PDF generation)

### TypeScript / Next.js (1 frontend)
- Type safety across full stack
- Server-side rendering for SEO
- Rich ecosystem of UI components
- Same language as backend (Node.js tooling)