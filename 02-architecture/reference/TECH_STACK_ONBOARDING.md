# Qoomlee System - Technical Stack & Developer Onboarding Guide

## Overview
This document provides a comprehensive overview of the Qoomlee Airline System's technology stack, architecture, and development practices to help new developers get up to speed quickly.

## System Architecture Overview

The Qoomlee system follows a modular monolith approach with clear domain separation, designed to eventually scale to microservices if needed. The system consists of several interconnected domains that handle different aspects of airline operations.

## Technology Stack

### Backend Services

#### 1. Booking Service
- **Language**: Kotlin
- **Framework**: Spring Boot
- **Purpose**: Handles PNR lifecycle, seat inventory management, fare rules, booking CRUD operations
- **Key Features**:
  - PNR (Passenger Name Record) lifecycle management
  - Seat inventory state machine
  - Fare rules engine
  - Booking creation, modification, and cancellation
  - Integration with passenger and flight services
- **Dependencies**: PostgreSQL, Redis, Passenger Service, Flight Service
- **Key Technologies**: Spring State Machine, JPA/Hibernate, REST APIs

#### 2. Passenger Service
- **Language**: Kotlin
- **Framework**: Spring Boot
- **Purpose**: Manages passenger profiles, data validation, and special requirements
- **Key Features**:
  - Passenger profile management
  - Data validation and verification
  - Special requirements handling (dietary, mobility, medical)
  - Document management (passports, visas, vaccination certificates)
  - Integration with booking and check-in services
- **Dependencies**: PostgreSQL, Redis, Booking Service, Check-in Service
- **Key Technologies**: Spring Validation, JPA/Hibernate, REST APIs

#### 3. Flight Service
- **Language**: Kotlin
- **Framework**: Spring Boot
- **Purpose**: Manages flight schedules, routes, and aircraft configuration
- **Key Features**:
  - Flight schedule CRUD operations
  - Route configuration management
  - Aircraft seat map configuration
  - Flight status management
  - Aircraft assignment
- **Dependencies**: PostgreSQL, Booking Service
- **Key Technologies**: JPA/Hibernate, REST APIs, Validation Framework

#### 4. Identity Service
- **Language**: Kotlin
- **Framework**: Spring Boot
- **Purpose**: Handles authentication, authorization, and user management
- **Key Features**:
  - Staff account management
  - JWT token issuance and validation
  - Role-Based Access Control (RBAC)
  - Audit logging
  - Session management
- **Dependencies**: PostgreSQL, Redis
- **Key Technologies**: Spring Security, JWT, OAuth2, JPA/Hibernate

#### 5. Notification Service
- **Language**: Kotlin
- **Framework**: Spring Boot
- **Purpose**: Handles email and SMS notifications
- **Key Features**:
  - Email dispatch (SendGrid integration)
  - SMS dispatch (Twilio/True Move H integration)
  - Event-driven notifications
  - Notification templates
  - Delivery status tracking
- **Dependencies**: Redis Streams, SendGrid API, SMS providers
- **Key Technologies**: Spring Integration, Redis, External API clients

#### 6. Check-in Service
- **Language**: Go (Golang)
- **Framework**: Standard library + Gin framework
- **Purpose**: Handles online and offline check-in operations
- **Key Features**:
  - Check-in session management
  - Seat assignment
  - Boarding pass PDF generation (IATA BCBP compliant)
  - Gate manifest management
  - Offline cache capabilities
  - High-throughput processing for concurrent check-ins
- **Dependencies**: PostgreSQL, Redis, Passenger Service
- **Key Technologies**: PDF generation, IATA BCBP standards, REST APIs, Concurrency patterns

#### 7. Payment Service
- **Language**: Go (Golang)
- **Framework**: Standard library + Gorilla Mux
- **Purpose**: Handles payment processing and transactions
- **Key Features**:
  - Credit card processing (Omise integration)
  - PromptPay QR generation
  - Webhook handling for payment confirmations
  - Refund processing
  - Daily reconciliation
  - Transaction recording
- **Dependencies**: PostgreSQL, Omise API, Booking Service
- **Key Technologies**: External API integration, Webhooks, Financial processing

### Frontend Applications

#### 1. Web Frontend
- **Language**: TypeScript
- **Framework**: Next.js
- **Purpose**: Staff browser interface for operations
- **Key Features**:
  - Staff dashboard and operations interface
  - Booking and check-in UI
  - Seat map visualization
  - Multi-language support (TH/EN)
  - Responsive design for various devices
- **Deployment**: Vercel or GCP Cloud Run
- **Key Technologies**: React, TypeScript, Next.js, Tailwind CSS

#### 2. iOS Mobile App
- **Language**: Swift
- **Framework**: SwiftUI/UIKit
- **Purpose**: Passenger mobile experience for iOS users
- **Key Features**:
  - Flight search and booking
  - Check-in functionality
  - Boarding pass display
  - Flight status updates
  - Push notifications
- **Key Technologies**: Swift, SwiftUI, REST API integration, Push Notifications

#### 3. Android Mobile App
- **Language**: Kotlin
- **Framework**: Jetpack Compose
- **Purpose**: Passenger mobile experience for Android users
- **Key Features**:
  - Flight search and booking
  - Check-in functionality
  - Boarding pass display
  - Flight status updates
  - Push notifications
- **Key Technologies**: Kotlin, Jetpack Compose, REST API integration, Firebase

### Infrastructure & DevOps

#### 1. API Gateway
- **Language**: Go (Golang)
- **Purpose**: Centralized request routing and authentication
- **Key Features**:
  - JWT validation
  - RBAC enforcement
  - Rate limiting
  - Request routing to downstream services
  - Single entry point for all API calls
- **Key Technologies**: Middleware, JWT validation, Rate limiting algorithms

#### 2. Infrastructure Components
- **Monitoring**: Prometheus + Grafana + Jaeger
  - Metrics collection and visualization
  - Distributed tracing
  - Health checks and alerting

- **Secrets Management**: HashiCorp Vault
  - Secure storage of API keys and credentials
  - Automatic rotation capabilities
  - Access control for secrets

- **Database**: PostgreSQL
  - Primary relational database
  - AES-256 encryption at rest
  - Point-in-time recovery (PITR) enabled

- **Cache**: Redis
  - Session caching
  - Seat lock TTL management (8-minute expiration)
  - Check-in manifest caching
  - Redis Streams for event processing

## Development Environment Setup

### Prerequisites
- JDK 17+ (for Kotlin services)
- Go 1.21+ (for Go services)
- Node.js 18+ (for Next.js)
- Docker & Docker Compose
- PostgreSQL client tools
- Redis client tools
- Git

### Local Development
1. Clone the repository
2. Install language-specific dependencies
3. Set up local PostgreSQL and Redis instances using Docker
4. Configure environment variables
5. Run services individually or using Docker Compose

### Environment Variables
Each service has its own `.env.example` file with required configuration values including:
- Database connection strings
- External API keys (Omise, SendGrid, etc.)
- JWT secrets
- Service endpoints
- Logging configuration

## API Standards

### REST API Guidelines
- Base path: `/api/v1`
- Authentication: Bearer JWT tokens
- Response format: Standard response wrapper
- Error handling: Consistent error format
- Versioning: API version in path

### Example Response Format
```json
{
  "data": {},
  "success": true,
  "message": "Success description",
  "correlationId": "uuid"
}
```

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": []
  },
  "success": false,
  "correlationId": "uuid"
}
```

## Deployment & CI/CD

### Deployment Strategy
- Containerized services using Docker
- Kubernetes orchestration (optional)
- Blue-green deployment patterns
- Health checks and readiness probes

### CI/CD Pipeline
- Automated testing (unit, integration, E2E)
- Security scanning
- Code quality checks
- Automated deployments to staging and production

## Testing Strategy

### Backend Testing
- Unit tests for business logic
- Integration tests for service interactions
- Contract tests for API endpoints
- Performance tests for critical paths

### Frontend Testing
- Unit tests for components
- Integration tests for user flows
- E2E tests using Playwright/Cypress
- Visual regression testing

## Code Quality & Standards

### Backend Coding Standards
- Kotlin: Follow Kotlin Coding Conventions
- Go: Follow Effective Go guidelines
- Spring Boot: Use dependency injection and layered architecture
- Consistent error handling patterns
- Proper logging with correlation IDs

### Frontend Coding Standards
- TypeScript: Strict mode with proper typing
- React/Next.js: Component-based architecture
- Consistent styling with Tailwind CSS
- Proper state management patterns

## Monitoring & Observability

### Logging
- Structured logging with JSON format
- Correlation IDs for request tracing
- Log levels: INFO, WARN, ERROR, DEBUG
- Centralized logging with ELK stack or similar

### Metrics
- Business metrics (bookings, check-ins, payments)
- Technical metrics (response times, error rates)
- Custom dashboards in Grafana
- Alerting thresholds

### Tracing
- Distributed tracing with Jaeger
- Request flow visualization
- Performance bottleneck identification

## Security Practices

### Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Session management
- Secure password storage

### Data Protection
- AES-256 encryption at rest
- TLS 1.3 for data in transit
- PCI DSS compliance for payment data
- GDPR compliance for personal data

### API Security
- Rate limiting
- Input validation and sanitization
- CORS configuration
- API key management

## Onboarding Checklist

### Day 1
- [ ] Set up development environment
- [ ] Run local instances of key services
- [ ] Review architecture documentation
- [ ] Join team communication channels

### Week 1
- [ ] Complete code walkthrough with mentor
- [ ] Set up local development environment
- [ ] Run and test existing features
- [ ] Submit first small improvement or bug fix

### Month 1
- [ ] Complete a feature implementation
- [ ] Participate in code reviews
- [ ] Understand the complete user journey
- [ ] Contribute to documentation improvements

## Support & Resources

### Documentation
- Architecture decision records (ADRs)
- API documentation
- Database schema documentation
- Deployment guides

### Team Resources
- Slack/Discord channels for each domain
- Weekly architecture meetings
- Code review guidelines
- Incident response procedures

### Troubleshooting
- Common issues and solutions
- Performance tuning guides
- Security incident response
- Database maintenance procedures