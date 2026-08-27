# Reference — Aspirational Architecture Docs

> ⚠️ **All files in this directory describe a future vision, not the current system.**
> These were originally in `02-architecture/` but were moved here because they document
> a multi-service Kotlin/Spring Boot architecture that doesn't exist yet.
> Use them as reference for long-term roadmap planning.

## What's here

| File | Content | Future use |
|------|---------|-------------|
| `api/api_documentation.md` | Full API spec for all planned services | Reference when adding new endpoints |
| `api/seat_api_spec.md` | Seat service API spec | Reference when implementing seat module |
| `modules/SEAT_MODULE.md` | Seat module architecture (Kotlin/Spring Boot) | Reference when implementing seat module |
| `TECH_STACK_ONBOARDING.md` | Full developer onboarding guide | Reference for team expansion |
| `TECHNOLOGY_STACK_SUMMARY.md` | Module-by-module tech stack | Reference for future service design |
| `Missing_Modules_Analysis.md` | Gaps in the aspirational architecture | Reference for infrastructure planning |

> **Note:** The original C4 diagrams (aspirational 8+ microservices) and `TECHNOLOGY_STACK_DETAILED.md` were lost when the files were deleted and could not be recovered from git (they were never committed). The reconstructed C4 diagrams reflecting the actual system are in `02-architecture/c4/`.

## Current system

See the parent `02-architecture/` directory for docs reflecting the actual 2-service Go + Gin system.
See `01-documentation/ROADMAP.md` for the prioritized implementation plan.