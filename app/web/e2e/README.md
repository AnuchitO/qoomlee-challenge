# e2e/ — the real E2E tier

Two tiers of Playwright tests live under `app/web/`:

|         | `app/web/uitests/`                                                  | `app/web/e2e/` (this folder)                                                             |
| ------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Backend | Mocked (`uitests/mocks.ts`, `page.route`)                           | Real: `qoomlee-service` + `payment-service` + Postgres via `docker compose`              |
| Speed   | Sub-second per test                                                 | Seconds per test (real network, real DB)                                                 |
| Run via | `bun run test:ui`                                                   | `bun run test:e2e`                                                                       |
| Purpose | Fast feedback loop on frontend behavior — safe to run on every save | Confidence the real wiring holds end-to-end — run deliberately, before a merge           |
| Data    | Fixed literals from `uitests/helpers/test-data.ts`                  | Real seeded data (`infra/db/qoomlee/02_seed.sql`), discovered fresh each run — see below |

The naming is deliberately literal: a test that stubs its own backend isn't
end-to-end. `uitests/` holds UI tests with the backend mocked out; only
what's in here talks to the real system.

`uitests/traditional/` is unrelated to this split — it's a separate,
intentionally-bad reference suite for a different workshop
(`docs/stories/demo-story-traditional.md`), run only via its own explicit
`npx playwright test uitests/traditional`.

## Running it

1. Bring the backend up (from the repo root):
   ```sh
   docker compose up -d --wait
   ```
   Or, for a guaranteed-fresh DB (drops local dev data, reseeds from
   `infra/db/qoomlee/02_seed.sql` and `infra/db/qoomlee-payment/02_seed.sql`):
   ```sh
   bun run test:e2e:reset   # from app/web — destructive, see package.json
   ```
2. Make sure `.env` (repo root, copied from `.env.share`) has **real** Omise
   test keys (`OMISE_PUBLIC_KEY`/`OMISE_SECRET_KEY` from
   https://dashboard.omise.co/test/api-keys) — the placeholder values in
   `.env.share` will make `payment-service`'s real charge calls fail auth.
3. `bun run test:e2e` (from `app/web`).

## Staying repeatable without a hardcoded date

`infra/db/qoomlee/02_seed.sql` seeds QM101 (BKK→SIN, flight id=11) at a
fixed **offset** ("standard +14d") from whenever the DB volume was last
initialized — not from "now". A literal date in a spec (`departure=2026-09-15`,
say) is therefore a ticking clock: correct today, silently wrong once real
time passes it.

`global-setup.ts` avoids that by reading QM101's actual current departure
date back from Postgres before any test runs, and fails fast — with a
pointer to `bun run test:e2e:reset` — if that date has already passed
(meaning the seed itself has gone stale and needs reseeding).

The second test (already-`CONFIRMED` booking) avoids the same problem a
different way: instead of asserting against a fixed seeded ref (e.g.
`SEED01`, which another run or another test could mutate), it books and pays
for a fresh flight itself first, then re-visits `/payment` for that real
ref — a self-contained precondition instead of a shared fixture that can
drift.
