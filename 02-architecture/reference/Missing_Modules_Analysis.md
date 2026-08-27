# Missing Modules Analysis — Aspirational Architecture

> ⚠️ **Aspirational** — This analysis identifies gaps in the aspirational multi-service architecture. The current system is a 2-service monolith. See `01-documentation/ROADMAP.md` for the prioritized implementation plan.

## Overview

The aspirational architecture describes 8+ microservices, but the following modules are missing from implementation:

## Missing Services

### 1. Seat Service
**Priority:** High | **Effort:** Large | **Dependencies:** Flight Service, Booking Service

The seat module is the most impactful missing piece. Without it:
- No seat selection during booking or check-in
- No seat map visualization
- No fare class differentiation by seat
- No seat blocking for operational needs

**Key components needed:**
- Seat configuration per aircraft type
- Seat inventory per flight
- Seat state machine (AVAILABLE → LOCKED → BOOKED → CHECKED_IN → BOARDED)
- 8-minute TTL lock management
- Concurrent-safe lock/confirm/release operations

### 2. Identity Service
**Priority:** High | **Effort:** Medium | **Dependencies:** None

Currently, auth is handled by session tokens in qoomlee-service. A dedicated identity service would provide:
- Proper JWT RS256 token issuance and validation
- User registration with role assignment
- Role-Based Access Control (RBAC)
- Token refresh and revocation
- Audit logging for all auth events

### 3. API Gateway
**Priority:** High | **Effort:** Medium | **Dependencies:** Identity Service

Currently, routing is handled by Gin's built-in router. A dedicated gateway would provide:
- Centralized JWT validation
- RBAC enforcement at the edge
- Rate limiting across all services
- Request routing to downstream services
- Single entry point for all API calls

### 4. Notification Service
**Priority:** Medium | **Effort:** Medium | **Dependencies:** Redis Streams

Currently, there are no email or SMS notifications. A notification service would provide:
- Booking confirmation emails
- Check-in reminders
- Flight delay/cancellation alerts
- Payment receipts
- Marketing communications (opt-in)

### 5. Check-in Service
**Priority:** Medium | **Effort:** Large | **Dependencies:** Booking Service, Seat Service

Check-in logic is currently embedded in qoomlee-service. A dedicated service would provide:
- Online check-in (24h before departure)
- Seat assignment/changes during check-in
- Boarding pass PDF generation (IATA BCBP compliant)
- Gate manifest management
- Offline cache capabilities

### 6. Passenger Service
**Priority:** Low | **Effort:** Medium | **Dependencies:** Identity Service

Passenger data is currently embedded in bookings. A dedicated service would provide:
- Passenger profile management
- Travel document storage (passport, visa)
- Special requirements (dietary, mobility, medical)
- Travel history and preferences
- GDPR-compliant data management

## Missing Infrastructure

### 1. Monitoring & Observability
**Priority:** High | **Effort:** Medium

Currently, only structured JSON logging exists. Missing:
- Prometheus metrics collection
- Grafana dashboards for business and technical metrics
- Jaeger distributed tracing
- Alerting thresholds and incident response

### 2. Secrets Management
**Priority:** Medium | **Effort:** Small

API keys and credentials are managed via environment variables. Missing:
- HashiCorp Vault for secure storage
- Automatic rotation of secrets
- Access control for sensitive credentials

### 3. Redis Cache
**Priority:** Medium | **Effort:** Small

No caching layer exists. Missing:
- Session caching for faster auth
- Seat lock TTL management
- Check-in manifest caching
- Rate limit counters

### 4. Service Mesh
**Priority:** Low | **Effort:** Large

Not needed until the system reaches 5+ services. Would provide:
- Istio for traffic management
- mTLS between services
- Circuit breaking and retry policies

## Missing Frontend Screens

The aspirational UI spec describes 38 screens. Currently ~12 are implemented:

| Screen | Status | Priority |
|--------|--------|----------|
| Flight Search | ✅ Implemented | — |
| Flight Results | ✅ Implemented | — |
| Flight Status | ✅ Implemented | — |
| Booking Form | ✅ Implemented | — |
| Booking Confirmation | ✅ Implemented | — |
| Booking Detail | ✅ Implemented | — |
| My Bookings | ✅ Implemented | — |
| Payment | ✅ Implemented | — |
| Login | ✅ Implemented | — |
| Register | ✅ Implemented | — |
| Profile | ✅ Implemented | — |
| Support | ✅ Implemented | — |
| Seat Map | ❌ Missing | High |
| Check-in Flow | ❌ Missing | High |
| Boarding Pass | ❌ Missing | High |
| Manage Booking | ❌ Missing | Medium |
| Cancel Booking | ❌ Missing | Medium |
| Admin Dashboard | ❌ Missing | Medium |
| Passenger List | ❌ Missing | Low |
| Gate Manifest | ❌ Missing | Low |
| Remaining 18 screens | ❌ Missing | Low |

## Missing Mobile Apps

| App | Priority | Effort |
|-----|----------|--------|
| iOS (Swift/SwiftUI) | Low | Large |
| Android (Kotlin/Jetpack Compose) | Low | Large |

## Recommendations

1. **Immediate (Sprint 1-2):** Identity Service + API Gateway to establish proper auth foundations
2. **Short-term (Sprint 3-4):** Seat Service for core booking differentiation
3. **Medium-term (Sprint 5-8):** Notification Service, Check-in Service, Monitoring
4. **Long-term:** Passenger Service, Redis caching, Secrets Management, Mobile apps