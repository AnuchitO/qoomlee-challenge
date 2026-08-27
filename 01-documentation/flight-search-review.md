# Flight Search — Vertical Slice Review

> **⚠️ Staleness note:** Generated 2026-06-23 (~2 months ago). Some of the 33 findings and 12 improvement stories (QML-069–QML-080) may have been resolved. Verify the current state of any finding before acting on it. See [ROADMAP.md](ROADMAP.md) for current priorities.
>
> Every section is a vertical slice — done work, tests, and gaps shown together per story.

### At a Glance

| Metric | Count |
|--------|-------|
| Stories completed | 14 of 17 |
| Stories backlog | 3 (admin creation, advanced filtering, real-time status API) |
| Improvement stories | 12 (QML-069 – QML-080) |
| Backend tests (Go) | 27 (18 unit + 9 integration) |
| Frontend tests (Vitest) | 132 across 15 test files |
| E2E tests (Playwright) | 5 |
| **Total tests** | **164** |
| Source files (backend) | 15 |
| Source files (frontend) | 47 |
| Review findings | 33 (3 HIGH, 1 BUG, 10 MEDIUM, 12 LOW, 7 NICE) |

> **Finding ID convention:** `QML-{layer}-{type}{number}` — layer: `BE`/`FE`/`E2E` — type: `C` (code), `T` (test)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js — 47 files under app/flights/)                    │
│                                                                      │
│  flights/page.tsx ──→ SearchForm ──→ useFlightSearch hook            │
│       │                    │              │                           │
│       │              validate + buildSearchUrl                        │
│       ▼                                                              │
│  flights/results/page.tsx ──→ ResultsPageClient                      │
│       │                            │                                 │
│       │                     fetchFlights (getJson + isFlight guard)  │
│       │                            │                                 │
│       ▼                            ▼                                 │
│  FlightList ──→ sortFlights ──→ FlightCard ──→ /bookings/new        │
│       │                                                              │
│       ├── step=outbound → /flights/results?step=return               │
│       └── step=return   → /bookings/new (both legs)                  │
└──────────────────┬───────────────────────────────────────────────────┘
                   │ GET /api/flights/search?origin=&destination=&date=&passengers=
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  BACKEND (Go / Gin — 15 files under services/qoomlee/flight/)        │
│                                                                      │
│  Handler.Search ──→ validate params ──→ bkkDateToUTCRange            │
│       │                                                              │
│       ▼                                                              │
│  Service.Search ──→ repo.Search ──→ enrichFlight (price + duration)  │
│       │                                                              │
│       ▼                                                              │
│  Repository.Search ──→ SELECT ... JOIN routes WHERE ... ORDER BY     │
└──────────────────┬───────────────────────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL)                                               │
│  flights + routes tables, TIMESTAMPTZ, BIGINT minor units (satang)   │
│  100+ seed flights across 7 date tiers, 12 routes                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Completed Vertical Slices

---

### QML-001: Search Flights API

> As a passenger, I want to search for flights by origin, destination, and date so I can find suitable travel options.

**Size:** 13 pts | **Sprint:** 1 | **API:** `GET /api/flights/search` (public, no auth)

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Search by origin/destination | ✅ |
| AC-2 | Filter by date and time | ✅ |
| AC-3 | Display flight availability and pricing | ✅ |
| AC-4 | Sort by price, duration, departure time | ✅ |

**Implementation:**

| Layer | File | What it does |
|-------|------|--------------|
| BE Handler | `search_handler.go` | Validates query params (origin, destination, date, passengers), converts BKK date → UTC range, calls service |
| BE Service | `service.go` | `Search()` delegates to repo, ensures nil→`[]`, calls `enrichFlight` (price string + duration) |
| BE Repository | `search_repository.go` | SQL: `SELECT ... JOIN routes WHERE origin_iata=$1 AND ... AND status='SCHEDULED' ORDER BY departure_time` |
| BE Shared | `repository.go` | `scanFlight` + `scanner` interface (shared between `*sql.Row` and `*sql.Rows`) |
| BE Shared | `models.go` | `Flight` struct, `SearchParams` struct, `ErrNotFound` sentinel |
| BE Shared | `handler.go` | `Handler` struct with `Service` interface, `apiErr` helper |
| FE API | `fetchFlights.ts` | `getJson` → runtime `isFlight` type guard → `Result<Flight[], HttpError>` |
| FE API | `buildApiUrl.ts` | Constructs API URL from search params with env var override |
| FE Sort | `sortFlights.ts` | Pure sort by price/departure/duration/best (copies array, immutable) |
| FE Types | `types.ts` | Re-exports `Flight`, defines `SortBy` union |
| DB Schema | `01_schema.sql` | `flights` table (BIGINT minor units, TIMESTAMPTZ) + `routes` table (IATA codes) |
| DB Seed | `02_seed.sql` | 100+ flights across 7 date tiers, 12 routes, dynamic pricing |

**Tests: 38 total**

| File | Count | What's covered |
|------|-------|----------------|
| `search_handler_test.go` | 8 | Happy path, empty list, missing origin/dest/date, invalid date, invalid passengers, service error |
| `service_test.go` (Search) | 3 | Happy path + enrichment, nil→empty, repo error propagation |
| `search_repository_integration_test.go` | 7 | 3 flights returned, order, all fields, sold-out excluded, date boundary ×2, unknown route |
| `handler_test.go` | — | Shared: `mockService`, `doSearch`, `doGetByID`, `assertErrorCode` |
| `repository_integration_test.go` | — | Shared: `TestMain` (testcontainers), `seedDate`, `flightNumbers` |
| `fetchFlights.test.ts` | 12 | Missing params (3), envelope formats (4), errors (5: status codes, network, logging) |
| `sortFlights.test.ts` | 5 | Price, departure, duration, best, immutability |
| `buildApiUrl.test.ts` | 3 | URL construction, param mapping, env var |

**Patterns Worth Keeping:**
- Interface-driven layering: Handler → Service → Repository with mockable seams
- Vertical slice files: `search_handler.go` + `search_repository.go` (~40 lines each)
- Three-tier test pyramid: unit handlers, unit service, integration repo
- `scanner` interface: `*sql.Row` and `*sql.Rows` share `scanFlight`
- Null-safe empty list: `service.go:31-33` — API returns `[]` never `null`
- `ErrNotFound` sentinel + `errors.Is` for clean error propagation
- `//go:build integration` tag gates integration tests
- `require` stops on failure, `assert` reports all mismatches
- `Result<T,E>` type forces explicit error handling (no thrown exceptions)
- `isFlight()` runtime guard protects against backend contract drift
- `sortFlights` copies before sort — prevents React re-render bugs

**Improvement Opportunities:**

| Finding | Severity | Issue | Fix in |
|---------|----------|-------|--------|
| QML-BE-C1 | HIGH | `enrichFlight` uses float64 for money: `fmt.Sprintf("%.2f", float64(minor)/100)` | QML-069 |
| QML-BE-C2 | MEDIUM | Handler calls `bkkDateToUTCRange` — business logic in HTTP layer | QML-072 |
| QML-BE-C3 | LOW | No IATA format validation on origin/destination | QML-073 |
| QML-BE-C4 | LOW | No passengers upper bound (`999999` hits DB) | QML-073 |
| QML-BE-T1 | HIGH | Mock discards `SearchParams` args — never verifies handler parsed correctly | QML-071 |
| QML-BE-T2 | MEDIUM | No test for `passengers` defaulting to 1 | QML-071 |
| QML-BE-T3 | LOW | Missing edge cases: `passengers=-1`, `passengers=abc` | QML-071 |
| QML-BE-T4 | LOW | No unit test for `bkkDateToUTCRange` (UTC+7 invariant) | QML-072 |
| QML-BE-T5 | LOW | No unit test for `enrichFlight` | QML-069 |
| QML-BE-T6 | LOW | No integration test for passengers boundary (155 vs 154 seats) | QML-079 |
| QML-BE-T7 | NICE | No `t.Parallel()` in unit tests | QML-079 |
| QML-BE-T8 | NICE | slog noise in test output | QML-079 |

---

### QML-002: View Flight Details

> As a passenger, I want to view detailed flight information so I can confirm before booking.

**API:** `GET /api/flights/:id` (requires SessionAuth)

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Returns complete flight with `durationMinutes` | ✅ |
| AC-2 | Unknown ID returns 404 `FLIGHT_NOT_FOUND` | ✅ |

**Implementation:**

| Layer | File | What it does |
|-------|------|--------------|
| BE Handler | `get_by_id_handler.go` | Parses `:id` path param, calls service, maps `ErrNotFound` → 404 |
| BE Repository | `get_by_id_repository.go` | SQL: `SELECT ... JOIN routes WHERE f.id=$1`, wraps `sql.ErrNoRows` → `ErrNotFound` |
| BE Service | `service.go` | `GetByID()` delegates to repo, calls `enrichFlight` |
| FE Page | `FlightDetailsPageClient.tsx` | Reads `flightNumber` from search params — **entirely hardcoded placeholder** (BKK-SYD) |

**Tests: 9 total**

| File | Count | What's covered |
|------|-------|----------------|
| `get_by_id_handler_test.go` | 4 | Happy path (all fields), not found (404), invalid id (400), service error (500) |
| `service_test.go` (GetByID) | 3 | Happy path + enrichment, not found (ErrNotFound), repo error |
| `get_by_id_repository_integration_test.go` | 2 | All fields for QM101 (id=11), not found returns ErrNotFound |

**Improvement Opportunities:**

| Finding | Severity | Issue | Fix in |
|---------|----------|-------|--------|
| QML-FE-C12 | NICE | `FlightDetailsPageClient.tsx` is entirely hardcoded (BKK-SYD static data) | — (backlog) |

---

### QML-016: Search Form — Core Behavior

> As a passenger, I want to search for flights by trip type, route, and date so I can find flights that match my plans.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | One-way / Round-trip toggle; return date hidden for one-way | ✅ |
| AC-2 | Airport autocomplete with IATA code, city name, airport name | ✅ |
| AC-3 | Swap icon exchanges origin and destination instantly | ✅ |
| AC-4 | Inline validation errors on empty required fields, search blocked | ✅ |
| AC-5 | Valid search navigates to results page with query params in URL | ✅ |

**Implementation:**

| Layer | File | What it does |
|-------|------|--------------|
| FE Hook | `useFlightSearch.ts` | State management: tripType, origin, destination, dates, passengers, cabinClass. Validation via `computeErrors`. URL building via `buildSearchUrl`. |
| FE Component | `SearchForm.tsx` | Renders 3 layout variants (lg/md/mobile) hidden by CSS. Uses hook for all logic. |
| FE Data | `airports.ts` | Static list of 7 airports (BKK, SIN, HKG, NRT, KUL, CGK, MNL) + `findAirport()` |
| FE QA | `_qqf/QaQuickFill.tsx` | Test scenario quick-fill widget (gated behind env var) |
| FE Dead code | `AirportInput.tsx` | Simple text input — not imported by SearchForm |

**Tests: 20 total**

| File | Count | What's covered |
|------|-------|----------------|
| `useFlightSearch.test.ts` | 11 | Default state, buildSearchUrl (round/oneway), swapAirports, validate happy (2), validate negative (5: origin, destination, same origin/dest, departure date, return date before/after), error clearing |
| `TripTypeToggle.test.tsx` | 5 | Label rendering, button count, onChange callbacks, visual style distinction |
| `SearchForm.test.tsx` | 4 | Layout labels, search button, trip type options, validation error display |

**Patterns Worth Keeping:**
- Separation: hook owns state/validation, component owns rendering — independently testable
- `computeErrors` is a pure function extracted from the hook — easy to test directly
- `buildSearchUrl` encodes all params — URL is the contract between search and results
- `applyScenario` enables QA quick-fill without touching validation logic

**Improvement Opportunities:**

| Finding | Severity | Issue | Fix in |
|---------|----------|-------|--------|
| QML-FE-C7 | LOW | No IATA format validation (just empty check) | QML-073 |
| QML-FE-C9 | LOW | `AirportInput.tsx` is dead code — not imported | QML-080 |
| QML-FE-C13 | NICE | Renders 3 layout trees hidden by CSS — triples DOM | — (backlog) |

---

### QML-017: Search Form — Desktop Layout

> As a passenger on desktop, I want the search form to display all fields in a single row.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Screen > 1024px: From, To, Date, Return, Search in one horizontal row | ✅ |
| AC-2 | Error messages don't shift Search button down | ✅ |
| AC-3 | Hover cursor changes to pointer | ✅ |

**Implementation:** Part of `SearchForm.tsx` (lg layout variant)

**Tests:** Covered by `SearchForm.test.tsx` + E2E desktop tests (QML-001 e2e happy path)

**Improvement Opportunities:** None — clean.

---

### QML-018: Search Form — Mobile Layout

> As a passenger on mobile, I want the search form to stack vertically.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Screen < 768px: From/To stacked inside a bordered card | ✅ |
| AC-2 | Floating swap button over the divider | ✅ |
| AC-3 | Date, Travelers & Class, Search each full-width | ✅ |

**Implementation:** Part of `SearchForm.tsx` (mobile layout variant)

**Tests:** Covered by E2E mobile tests (bottom sheet open/select/close)

**Improvement Opportunities:** None — clean.

---

### QML-019: Date Range Picker — Core Behavior

> As a passenger, I want to pick departure and return dates from a calendar.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | One-way mode: single pick closes calendar | ✅ |
| AC-2 | Round-trip: first pick sets departure, advances to return step | ✅ |
| AC-3 | Reverse flow: return picked before departure keeps calendar open | ✅ |
| AC-4 | "Add return" from one-way opens calendar at return step | ✅ |
| AC-5 | Clear return date with X button | ✅ |
| AC-6 | Error messages display for missing dates | ✅ |
| AC-7 | Month navigation (prev/next) | ✅ |

**Implementation:**

| Layer | File | What it does |
|-------|------|--------------|
| FE Component | `DateRangePicker.tsx` | 731-line calendar widget. Custom MonthGrid, dual-month view, portal for desktop/mobile, keyboard navigation, range band highlighting, reverse flow support. |

**Tests: 38 total — 12 behavior categories**

| # | Category | Count | Behaviors |
|---|----------|-------|-----------|
| 1 | Basic rendering | 5 | Labels, "Add return" show/hide, onAddReturn, opens calendar |
| 2 | Calendar open & interaction | 4 | Departure trigger, return trigger, onDepartureChange with YYYY-MM-DD, onReturnChange |
| 3 | Error display & styling | 3 | departureError, returnError, boxMinHeight |
| 4 | Month navigation | 2 | Prev/Next arrows, month label updates |
| 5 | User journey: one-way | 1 | Open → pick → close |
| 6 | User journey: round-trip | 3 | Pick dep → stay open → pick return → close; direct return; clear X |
| 7 | User journey: reverse flow | 7 | Stay open after return; onReturnChange first; onDepartureChange + close; dates after return disabled; dates before clickable; round-trip unaffected; one-way unaffected |
| 8 | User journey: "Add return" reverse | 2 | Add return → pick return → stay open → pick departure → close |
| 9 | Regression: no range band on one-way | 2 | No hover band on one-way; band still works on round-trip |
| 10 | Regression: stale returnDate | 3 | Stale date not disabled, not selected, can be picked as departure |
| 11 | Regression: portal outside-click | 3 | mousedown inside portal OK; day click registers; true outside closes |
| 12 | Memory: event listener cleanup | 3 | All removed on unmount; no accumulation; resize removed |

**Patterns Worth Keeping:**
- **User journey tests** (categories 5-8): full flows from the user's perspective — regressions in any layer are immediately visible
- **Regression tests** (9-11): each has a documented bug description explaining what broke and why the test exists
- **Memory tests** (12): spy on `addEventListener`/`removeEventListener` — prevents leaks across mount/unmount
- **Reverse flow** (7): 7 tests for a non-obvious interaction — most teams miss this entirely

**Improvement Opportunities:** None — this is the showcase component for test quality.

---

### QML-020: Date Range Picker — Desktop

> Desktop: floating panel showing 2 months, click-outside closes.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Floating panel via portal to document.body | ✅ |
| AC-2 | Click outside closes panel | ✅ |
| AC-3 | Portal mousedown doesn't swallow day clicks (regression fix) | ✅ |

**Implementation:** Part of `DateRangePicker.tsx` (desktop portal path, `panelRef` excluded from outside-click)

**Tests:** 3 regression tests (category 11 in QML-019 table) — specifically test the desktop portal path with `window.innerWidth = 1440`.

**Improvement Opportunities:** None.

---

### QML-021: Date Range Picker — Mobile

> Mobile: full-screen modal, "Done" button, step label in header.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Full-screen modal on mobile | ✅ |
| AC-2 | Step label in header | ✅ |

**Implementation:** Part of `DateRangePicker.tsx` (mobile `isMobile` path)

**Tests:** Covered by user journey tests (categories 5-8) which run at default viewport.

**Improvement Opportunities:** None.

---

### QML-022: View Flight Search Results

> As a passenger, I want to see a list of matching flights so I can compare options and choose one to book.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Each card shows flight number, route, times, duration, seats, price | ✅ |
| AC-2 | No flights: empty-state message | ✅ |
| AC-3 | Summary line confirms route, date, passengers, cabin | ✅ |
| AC-4 | Sort by Best/Price/Departure/Duration chips | ✅ |
| AC-5 | Pagination: "Show more" loads next 5 | ✅ |
| AC-6 | Select → navigates to /bookings/new with all params | ✅ |
| AC-7 | Round-trip outbound: Select → /flights/results?step=return | ✅ |
| AC-8 | Round-trip return: Select → /bookings/new with both legs | ✅ |

**Implementation:**

| Layer | File | What it does |
|-------|------|--------------|
| FE Page | `results/page.tsx` | Server component with `<Suspense>` wrapping `ResultsPageClient` |
| FE Client | `ResultsPageClient.tsx` | Reads search params, calls `fetchFlights` in useEffect with cancellation, handles round-trip step logic |
| FE Component | `FlightList.tsx` | Sorted + paginated flight list. 3-branch `handleSelect`: oneway, outbound step, return step |
| FE Component | `FlightCard.tsx` | Flight card: airline header, price per person + total, FlightRoute, luggage/cabin footer, Select button |
| FE Component | `FilterChips.tsx` | Sticky bar: Best/Price/Departure/Duration chips + result count |
| FE Component | `ResultsHeader.tsx` | Back button, search summary pill, Edit button |
| FE Component | `RoundTripProgress.tsx` | Step 1/2 or 2/2 indicator with outbound summary banner |
| FE Skeleton | `_skeleton/` | `FlightListSkeleton`, `ResultsPageSkeleton` |
| FE Shared | `FlightRoute.tsx` | Route visualization component (4 sizes, 2 variants) |

**Tests: 33 total** (all FE — no backend tests specific to this slice)

| File | Count | What's covered |
|------|-------|----------------|
| `FlightList.test.tsx` | 20 | Rendering (cards, empty state, price, filter chips), memoized sorting (useMemo spy), booking URL contract (8 params verified individually), round-trip outbound (3: step=return, swapped origin/dest, carries outbound details), round-trip return (1: /bookings/new with both legs) |
| `formatSearchSummary.test.ts` | 6 | Full summary, singular/plural passengers, cabin labels, duration edge cases |
| `RoundTripProgress.test.tsx` | 5 | Nothing for one-way, step labels (1/2, 2/2), outbound summary display |
| `ResultsHeader.test.tsx` | 2 | Origin/destination display, summary text |

**Patterns Worth Keeping:**
- URL contract tests verify every single booking URL param individually — catches regressions in the handoff to booking
- `useMemo` spy test proves re-render doesn't re-sort
- Flexible API parsing: both `{flights:[]}` and direct `[]` handled
- Memoized sort: `useMemo` on `[flights, sortBy]`

**Improvement Opportunities:**

| Finding | Severity | Issue | Fix in |
|---------|----------|-------|--------|
| QML-FE-C1 | HIGH | Price uses float: `(minor * passengers) / 100` | QML-069 |
| QML-FE-C2 | BUG | `status === "SCHEDULED" ? "Economy" : status` — shows DELAYED as cabin class | QML-070 |
| QML-FE-C3 | MEDIUM | Luggage "20kg" hardcoded | QML-074 |
| QML-FE-C4 | MEDIUM | `parseInt(passengersParam)` can produce NaN | QML-075 |
| QML-FE-C5 | MEDIUM | "Try again" uses `<a href="">` — fragile reload | QML-075 |
| QML-FE-C6 | LOW | `handleSelect` has 3 branches with duplicated URL logic | QML-080 |
| QML-FE-C8 | LOW | `outboundParams` typed as `Record<string, string>` | QML-080 |
| QML-FE-C10 | NICE | No `aria-label` on Select button | QML-074 |
| QML-FE-C11 | NICE | No `aria-pressed` on active filter chip | QML-076 |
| QML-FE-T1 | MEDIUM | FlightCard has NO test file | QML-074 |
| QML-FE-T2 | MEDIUM | FilterChips has NO test file | QML-076 |
| QML-E2E-T1 | MEDIUM | No e2e test that results page renders flight cards | QML-077 |
| QML-E2E-T2 | MEDIUM | No empty results e2e test | QML-077 |
| QML-E2E-T3 | LOW | No round-trip e2e flow | QML-078 |
| QML-E2E-T4 | LOW | No sort e2e test | QML-078 |
| QML-E2E-T5 | NICE | E2e helper functions undocumented | — |

---

### QML-023: Travelers & Class — Desktop

> Desktop: traveler count stepper and cabin class chips inline in search form header.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Stepper (- count +) inline, no card border | ✅ |
| AC-2 | Min 1, max 9 passengers | ✅ |
| AC-3 | Single chip selection for cabin class | ✅ |

**Implementation:**

| Layer | File | What it does |
|-------|------|--------------|
| FE Component | `PassengerSelector.tsx` | Stepper (1-9) + cabin class chips. "inline" variant for desktop. |

**Tests: 0** — no test file exists.

**Improvement Opportunities:**

| Finding | Severity | Issue | Fix in |
|---------|----------|-------|--------|
| QML-FE-T3 | MEDIUM | PassengerSelector has NO test file — stepper bounds (1-9) untested | QML-076 |

---

### QML-024: Travelers & Class — Mobile

> Mobile: traveler count and cabin class below date fields.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | "Travelers & Class" label above stepper and chips | ✅ |
| AC-2 | Full-width row without card border | ✅ |
| AC-3 | Same behavior as desktop | ✅ |

**Implementation:** Part of `PassengerSelector.tsx` ("card" variant for mobile)

**Tests: 0** — same gap as QML-023.

**Improvement Opportunities:** Same as QML-023 → QML-076.

---

### QML-033: Airport Select — Desktop Dropdown

> Desktop airport selection dropdown for search form.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Popular list shown on open | ✅ |
| AC-2 | Filters on type | ✅ |
| AC-3 | Excludes selected origin from destination list | ✅ |
| AC-4 | Escape closes dropdown | ✅ |
| AC-5 | Outside click closes dropdown | ✅ |

**Implementation:**

| Layer | File | What it does |
|-------|------|--------------|
| FE Component | `AirportSelect.tsx` | Rich picker with desktop dropdown + mobile bottom sheet. Search/filter, keyboard (Escape), outside-click, `useMemo` for filtering, aria attributes. |

**Tests: 18 total**

| File | Count | What's covered |
|------|-------|----------------|
| `AirportSelect.test.tsx` | 12 | Closed state, open/dropdown, search/filter, selection, borderless mode, performance (memoization), accessibility (aria, Escape) |
| `airports.test.ts` | 6 | Count, IATA codes, non-empty fields, findAirport (case-insensitive, unknown, empty) |

**Patterns Worth Keeping:**
- `useMemo` for filtering — tested that re-render doesn't re-filter
- Accessibility: aria attributes tested

**Improvement Opportunities:** None — well tested.

---

### QML-034: Airport Select — Mobile Bottom Sheet

> Mobile: airport selection via bottom sheet.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Slides up from bottom | ✅ |
| AC-2 | Drag handle visible | ✅ |
| AC-3 | Backdrop tap closes without selection | ✅ |

**Implementation:** Part of `AirportSelect.tsx` (portal bottom sheet path)

**Tests: 2 unit + 3 E2E (cross-cutting)**

| File | Count | What's covered |
|------|-------|----------------|
| `AirportSelect.memory.test.tsx` | 2 | Timer/animation-frame cleanup on unmount (memory leak prevention) |
| `flights-search.spec.ts` (E2E) | 3 | Bottom sheet opens on tap, select airport via sheet, backdrop tap closes — counted in E2E cross-cutting section |

**Patterns Worth Keeping:**
- Memory leak tests: spy on timer/animation cleanup

**Improvement Opportunities:** None.

---

### QML-036: Flight Status UI

> Flight number input shows status, route, times; not-found message.

**Acceptance Criteria:**

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Search by flight number | ✅ (web UI) |
| AC-2 | Shows status, route, times | ✅ (mock data) |
| AC-3 | Not-found message | ✅ |

**Implementation:**

| Layer | File | What it does |
|-------|------|--------------|
| FE Hook | `useFlightStatusSearch.ts` | Manages search query, filters over hardcoded mock departures |
| FE Component | `FlightStatusView.tsx` | Search input, status cards with FlightRoute, departures board table |
| FE Page | `status/page.tsx` | Combines hook + view |

**Tests: 1 total**

| File | Count | What's covered |
|------|-------|----------------|
| `useFlightStatusSearch.test.ts` | 1 | Memoized filtering reference stability |

**Note:** Web UI only — backend API (QML-068) is NOT DONE. Uses mock data.

**Improvement Opportunities:** None specific — backend API is separate backlog item.

---

### E2E Tests (cross-cutting)

These 5 Playwright tests cut across multiple stories:

| Test | Viewport | Stories covered |
|------|----------|-----------------|
| Swap origin/destination | Desktop | QML-016 |
| Bottom sheet opens on tap | Mobile | QML-034 |
| Select airport via bottom sheet | Mobile | QML-034 |
| Close bottom sheet on backdrop tap | Mobile | QML-034 |
| Happy path: one-way search → results URL | Desktop | QML-016, QML-017, QML-001 |

**E2E helpers:** `visibleText`, `visibleRole` — handle triple-layout DOM by filtering `{ visible: true }`.

---

## Improvement Stories — TODO

---

### QML-069: Fix money formatting (backend + frontend)

> Never use float for money — the single most dangerous anti-pattern to leave in a learning example.

**Findings covered:** QML-BE-C1, QML-FE-C1, QML-BE-T5

| Layer | File | Change |
|-------|------|--------|
| BE | `service.go:58` | `fmt.Sprintf("%.2f", float64(minor)/100)` → `fmt.Sprintf("%d.%02d", minor/100, minor%100)` |
| BE test | `service_test.go` | Add `TestEnrichFlight` — 350000→"3500.00", 1→"0.01", 0→"0.00" |
| FE | `FlightCard.tsx:18-19` | Replace `(minor * passengers) / 100` with integer-safe formatter |

**AC:**
- [ ] Backend `enrichFlight` uses integer division only
- [ ] `TestEnrichFlight` passes with edge cases
- [ ] Frontend price matches backend for all seed flights
- [ ] `go test ./flight/` passes

**Size:** S | **Time:** ~30 min

---

### QML-070: Fix cabin class display bug

> FlightCard shows flight status ("DELAYED") as cabin class label.

**Findings covered:** QML-FE-C2

| Layer | File | Change |
|-------|------|--------|
| FE | `FlightCard.tsx:83` | Replace `status === "SCHEDULED" ? "Economy" : status` with always "Economy" |
| FE test | `FlightCard.test.tsx` (new) | Test: non-SCHEDULED flight still shows "Economy" |

**AC:**
- [ ] FlightCard always shows "Economy"
- [ ] Test proves DELAYED flight renders "Economy"

**Size:** XS | **Time:** ~15 min

---

### QML-071: Mock argument verification in handler tests

> Mocks discard args — tests never verify the handler parsed HTTP inputs correctly.

**Findings covered:** QML-BE-T1, QML-BE-T2, QML-BE-T3

| Layer | File | Change |
|-------|------|--------|
| BE test | `handler_test.go` | Expand `mockService` to capture `searchParams` and `getByIDArg` |
| BE test | `search_handler_test.go` | Happy path: assert origin, destination, passengers, dateFrom/dateTo |
| BE test | `search_handler_test.go` | New: "passengers defaults to 1", "negative passengers", "non-numeric passengers" |

**AC:**
- [ ] `mockService.searchParams` captured on every `Search` call
- [ ] Happy path asserts all 5 SearchParams fields
- [ ] Default passengers test (omit → 1)
- [ ] Edge cases (-1, "abc" → 400)

**Size:** S | **Time:** ~25 min | **Unlocks:** QML-072

---

### QML-072: Move timezone conversion to service layer

> Handler calls `bkkDateToUTCRange` — business logic in HTTP layer.

**Findings covered:** QML-BE-C2, QML-BE-T4

| Layer | File | Change |
|-------|------|--------|
| BE | `models.go` | `SearchParams.DateFrom/DateTo` → `SearchParams.Date time.Time` |
| BE | `service.go` | Service.Search calls `bkkDateToUTCRange(params.Date)` |
| BE | `search_handler.go` | Handler passes raw parsed date |
| BE test | `service_test.go` | Add `TestBkkDateToUTCRange` — 2026-06-15 → from=2026-06-14T17:00Z, to=2026-06-15T17:00Z |

**AC:**
- [ ] Handler has zero knowledge of BKK timezone
- [ ] `TestBkkDateToUTCRange` documents UTC+7 invariant
- [ ] All existing tests updated and pass

**Size:** M | **Time:** ~30 min | **Depends on:** QML-071 (mock captures args including new `Date` field)

---

### QML-073: Add input validation for search params

> Origin/destination accept any string, passengers has no ceiling.

**Findings covered:** QML-BE-C3, QML-BE-C4, QML-FE-C7

| Layer | File | Change |
|-------|------|--------|
| BE | `search_handler.go` | `len(origin) != 3` → 400; `passengers > 500` → 400 |
| BE test | `search_handler_test.go` | New: "origin too long", "passengers too high" → 400 |
| FE | `useFlightSearch.ts` | Origin/destination must be exactly 3 chars in `computeErrors` |
| FE test | `useFlightSearch.test.ts` | New: "rejects 2-char origin", "rejects 4-char destination" |

**AC:**
- [ ] Backend rejects non-3-char IATA with 400
- [ ] Backend rejects passengers > 500
- [ ] Frontend shows validation error for non-3-char codes
- [ ] All tests pass

**Size:** S | **Time:** ~20 min

---

### QML-074: FlightCard test coverage + accessibility

> The most-viewed component has zero tests.

**Findings covered:** QML-FE-T1, QML-FE-C10, QML-FE-C3

| Layer | File | Change |
|-------|------|--------|
| FE test | `FlightCard.test.tsx` (new) | Price per person, total for 2+ passengers, Best Value badge, next-day +1, luggage display |
| FE | `FlightCard.tsx` | `aria-label={`Select flight ${flight.flightNumber}`}` on button |
| FE | `FlightCard.tsx:76` | Add comment: luggage is hardcoded placeholder |

**AC:**
- [ ] FlightCard.test.tsx covers: price, multi-passenger total, Best Value, next-day, luggage, aria-label
- [ ] Select button has descriptive aria-label

**Size:** S | **Time:** ~30 min

---

### QML-075: Results page error handling

> parseInt can produce NaN, "Try again" uses fragile anchor.

**Findings covered:** QML-FE-C4, QML-FE-C5

| Layer | File | Change |
|-------|------|--------|
| FE | `ResultsPageClient.tsx:104` | `parseInt(param, 10) \|\| 1` |
| FE | `ResultsPageClient.tsx:115` | `<a href="">` → `<button onClick={() => window.location.reload()}>` |

**AC:**
- [ ] Non-numeric passengers defaults to 1
- [ ] "Try again" is a button

**Size:** XS | **Time:** ~10 min

---

### QML-076: FilterChips + PassengerSelector tests

> Two interactive components with zero test files.

**Findings covered:** QML-FE-T2, QML-FE-T3, QML-FE-C11

| Layer | File | Change |
|-------|------|--------|
| FE test | `FilterChips.test.tsx` (new) | 4 chips rendered, click changes active, onSortChange fires, result count, aria-pressed |
| FE | `FilterChips.tsx` | Add `aria-pressed` on active chip |
| FE test | `PassengerSelector.test.tsx` (new) | Count=1, increment, decrement blocked at 1, max=9, cabin class chips |

**AC:**
- [ ] FilterChips: 4+ tests covering sort state, callback, count, aria-pressed
- [ ] PassengerSelector: 5+ tests covering stepper bounds and cabin class

**Size:** S | **Time:** ~40 min

---

### QML-077: E2E — results page + empty state

> Happy path e2e stops at URL — never verifies cards render.

**Findings covered:** QML-E2E-T1, QML-E2E-T2

| Layer | File | Change |
|-------|------|--------|
| E2E | `flights-search.spec.ts` | New: "results page shows flight cards" — search BKK→SIN → assert cards |
| E2E | `flights-search.spec.ts` | New: "unknown route shows empty state" — XYZ→ABC → "No flights found" |

**AC:**
- [ ] E2E proves flight cards render after valid search
- [ ] E2E proves empty state for unknown routes

**Size:** S | **Time:** ~30 min

---

### QML-078: E2E — round-trip + sort

> No e2e for multi-step flow or sort chips.

**Findings covered:** QML-E2E-T3, QML-E2E-T4

| Layer | File | Change |
|-------|------|--------|
| E2E | `flights-search.spec.ts` | New: round-trip outbound → return → /bookings/new |
| E2E | `flights-search.spec.ts` | New: click Price chip → first card has lowest price |

**AC:**
- [ ] E2E proves full round-trip flow reaches /bookings/new
- [ ] E2E proves sort changes card order

**Size:** M | **Time:** ~45 min

---

### QML-079: Backend test polish

> Parallel tests, slog noise, boundary condition.

**Findings covered:** QML-BE-T6, QML-BE-T7, QML-BE-T8

| Layer | File | Change |
|-------|------|--------|
| BE test | `search_repository_integration_test.go` | New: passengers=155 excludes all BKK→SIN flights |
| BE test | all unit test files | Add `t.Parallel()` |
| BE test | `handler_test.go` | `slog.SetDefault(slog.New(slog.NewTextHandler(io.Discard, nil)))` |

**AC:**
- [ ] Boundary test proves passengers filter at edge
- [ ] Unit tests run in parallel
- [ ] No slog noise in test output

**Size:** S | **Time:** ~20 min

---

### QML-080: Frontend code cleanup

> Dead code, duplicated logic, loose types.

**Findings covered:** QML-FE-C6, QML-FE-C8, QML-FE-C9, QML-FE-C12, QML-FE-C13

| Layer | File | Change |
|-------|------|--------|
| FE | `FlightList.tsx` | Extract `buildBookingUrl` utility + tests for 3 flows |
| FE | `FlightList.tsx:24` | Type `outboundParams` with specific interface |
| FE | `AirportInput.tsx` | Delete (dead code) |

**AC:**
- [ ] `buildBookingUrl` extracted with tests
- [ ] `outboundParams` has typed interface
- [ ] `AirportInput.tsx` removed, no broken imports

**Size:** S | **Time:** ~30 min

---

## Backlog — NOT DONE

| Story | Title | Depends on | Notes |
|-------|-------|------------|-------|
| QML-066 / FLIGHT-001 | Flight Creation Interface (Admin) | — | `POST /api/flights`, IATA validation, aircraft assignment |
| QML-067 / FLIGHT-003 | Flight Search Filtering & Sorting (advanced) | QML-001 | Backend: price_min/max, departure_from/to, duration_max, aircraft_types, sort params |
| QML-068 / FLIGHT-004 | Real-time Flight Status API | QML-066 | `GET /api/flights/{flightNumber}/status`, Redis cache 30s TTL, departure board |

---

## SCORECARD Alignment

| Pillar | Requirement | Pts | Status |
|--------|-------------|-----|--------|
| Working Software | `GET /api/flights/search` → 200 with flights array | 3 | ✅ |
| Working Software | `GET /api/flights/1` → 200 with all fields | 3 | ✅ |
| Unit Tests | SearchFlights 3+ cases | 2 | ✅ (7 cases) |
| Unit Tests | GetFlightByID returns struct/ErrNotFound | 2 | ✅ (4 cases) |
| Integration Tests | Search returns 1+ for BKK→SIN | 2 | ✅ |
| Integration Tests | GetByID correct + GetByID(99999) ErrNotFound | 2 | ✅ |
| Contract Tests | Bad params → 400, flights/1 → 200, flights/99999 → 404 | 3 | ✅ |
| K6 Load Tests | 50 VUs, p95 < 500ms, error rate < 1% | 2 | TODO |
| Rate Limiting | 429 after >100 req/min on search | 2 | TODO |
| Code Quality | Layered arch, no SQL in handlers, interface repos | — | ✅ |

---

## Dependency Map & Sprint Fit

```
 Independent (start anywhere)          Depends on QML-071
 ┌─────────┐ ┌─────────┐              ┌─────────┐
 │ QML-069 │ │ QML-070 │              │ QML-072 │
 │  money  │ │  cabin   │              │ timezone │
 │  30 min │ │  15 min  │              │  30 min  │
 └─────────┘ └─────────┘              └─────────┘
 ┌─────────┐ ┌─────────┐
 │ QML-071 │ │ QML-073 │
 │  mocks  │ │  valid.  │
 │  25 min │ │  20 min  │
 └─────────┘ └─────────┘
 ┌─────────┐ ┌─────────┐
 │ QML-074 │ │ QML-075 │
 │FlightCrd│ │ results  │
 │  30 min │ │  10 min  │
 └─────────┘ └─────────┘
 ┌─────────┐ ┌─────────┐
 │ QML-076 │ │ QML-079 │
 │chips+pax│ │ BE tests │
 │  40 min │ │  20 min  │
 └─────────┘ └─────────┘
 ┌─────────┐ ┌─────────┐
 │ QML-077 │ │ QML-078 │
 │ e2e res │ │ e2e rt  │
 │  30 min │ │  45 min  │
 └─────────┘ └─────────┘
 ┌─────────┐
 │ QML-080 │
 │ cleanup │
 │  30 min │
 └─────────┘
```

| Sprint half-day | Stories | Time | Theme |
|-----------------|---------|------|-------|
| Morning 1 | QML-069, QML-070, QML-071 | ~70 min | Fix bugs + money + mocks |
| Afternoon 1 | QML-072, QML-073, QML-075 | ~60 min | Architecture + validation + resilience |
| Morning 2 | QML-074, QML-076 | ~70 min | Component test coverage |
| Afternoon 2 | QML-077, QML-078, QML-079 | ~95 min | E2E + backend polish |
| Morning 3 | QML-080 | ~30 min | Code cleanup |

**12 improvement stories | ~5.5 hrs | 2.5 working days**

---

## Quick Reference: All Findings

| Finding | Severity | Completed Slice | Improvement Story |
|---------|----------|-----------------|-------------------|
| QML-BE-C1 | HIGH | QML-001 | QML-069 |
| QML-BE-C2 | MEDIUM | QML-001 | QML-072 |
| QML-BE-C3 | LOW | QML-001 | QML-073 |
| QML-BE-C4 | LOW | QML-001 | QML-073 |
| QML-BE-T1 | HIGH | QML-001 | QML-071 |
| QML-BE-T2 | MEDIUM | QML-001 | QML-071 |
| QML-BE-T3 | LOW | QML-001 | QML-071 |
| QML-BE-T4 | LOW | QML-001 | QML-072 |
| QML-BE-T5 | LOW | QML-001 | QML-069 |
| QML-BE-T6 | LOW | QML-001 | QML-079 |
| QML-BE-T7 | NICE | QML-001 | QML-079 |
| QML-BE-T8 | NICE | QML-001 | QML-079 |
| QML-FE-C1 | HIGH | QML-022 | QML-069 |
| QML-FE-C2 | BUG | QML-022 | QML-070 |
| QML-FE-C3 | MEDIUM | QML-022 | QML-074 |
| QML-FE-C4 | MEDIUM | QML-022 | QML-075 |
| QML-FE-C5 | MEDIUM | QML-022 | QML-075 |
| QML-FE-C6 | LOW | QML-022 | QML-080 |
| QML-FE-C7 | LOW | QML-016 | QML-073 |
| QML-FE-C8 | LOW | QML-022 | QML-080 |
| QML-FE-C9 | LOW | QML-016 | QML-080 |
| QML-FE-C10 | NICE | QML-022 | QML-074 |
| QML-FE-C11 | NICE | QML-022 | QML-076 |
| QML-FE-C12 | NICE | QML-002 | — |
| QML-FE-C13 | NICE | QML-016 | — |
| QML-FE-T1 | MEDIUM | QML-022 | QML-074 |
| QML-FE-T2 | MEDIUM | QML-022 | QML-076 |
| QML-FE-T3 | MEDIUM | QML-023 | QML-076 |
| QML-E2E-T1 | MEDIUM | QML-022 | QML-077 |
| QML-E2E-T2 | MEDIUM | QML-022 | QML-077 |
| QML-E2E-T3 | LOW | QML-022 | QML-078 |
| QML-E2E-T4 | LOW | QML-022 | QML-078 |
| QML-E2E-T5 | NICE | QML-022 | — |
