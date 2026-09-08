# uitests/

UI tests: full page renders, full routing, real component behavior — but
the backend is mocked (`mocks.ts`, `page.route`). Fast, deterministic, safe
to run on every save. Run via `bun run test:ui`.

See `../e2e/` for the actual **E2E** tier — real `qoomlee-service` +
`payment-service` + Postgres, no mocks, run via `bun run test:e2e`
(`../e2e/README.md`).

- **`*.spec.ts`** (this level) — the UI-tests suite proper.
- **`pages/`** — Page Object Model classes (locators + actions only —
  assertions live in the specs, not here).
- **`fixtures.ts`** — wires the page objects into Playwright's `test` via
  `test.extend`.
- **`helpers/test-data.ts`** — shared literals (passenger, card, flight,
  airport names).
- **`mocks.ts`** — route-mocking helpers.
- **`traditional/`** — an unrelated, intentionally-bad reference suite for a
  separate workshop (`docs/stories/demo-story-traditional.md`). Not part of
  the UI-tests suite proper; run only via its own documented
  `npx playwright test uitests/traditional`.

If you're adding a new test: does it need the real backend? `../e2e/`. Does
it just need the real frontend with predictable API responses? here, using
`pages/` + `fixtures.ts` + `mocks.ts`.
