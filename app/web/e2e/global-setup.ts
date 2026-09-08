import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Global setup for the real E2E tier (app/web/e2e/).
 *
 * Does NOT reset the database — that's destructive (drops local dev data)
 * and this runs on every `bun run test:e2e`, so it stays opt-in via
 * `bun run test:e2e:reset`. Instead this:
 *   1. Health-checks the real backend services, failing fast with a clear
 *      fix if they're not up.
 *   2. Discovers the ACTUAL current departure date of the seeded QM101
 *      (BKK→SIN) flight by reading it back from Postgres, rather than
 *      assuming a hardcoded date. infra/db/qoomlee/02_seed.sql seeds this
 *      flight ("standard +14d ← booking-test flights") relative to whenever
 *      the DB volume was last (re)initialized, NOT relative to "now" — so a
 *      hardcoded literal goes stale the moment real time passes it. Reading
 *      the live value back keeps the test correct regardless of when the
 *      volume was last reset.
 *   3. If that flight's departure has already passed (the seed itself is
 *      stale), fails fast telling the dev to run `bun run test:e2e:reset`.
 *
 * The discovered date is exposed via process.env — globalSetup runs in the
 * main process before Playwright forks workers, so env vars set here are
 * inherited by every worker/test.
 */

const REPO_ROOT = path.resolve(__dirname, "../../../");
const QOOMLEE_HEALTH_URL = "http://localhost:9988/health/ready";
const PAYMENT_HEALTH_URL = "http://localhost:9984/health/ready";
// The seed's "standard +14d, booking-test flights" tier: QM101 (BKK→SIN).
// See infra/db/qoomlee/02_seed.sql's header comment for the full ID map.
const QM101_FLIGHT_ID = 11;

const RESET_HINT =
  "Run `bun run test:e2e:reset` from app/web (or `docker compose up -d --wait` " +
  "from the repo root) before running the real E2E tier.";

async function waitForHealthy(url: string, label: string, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      lastError = new Error(`${label} responded ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(
    `[e2e/real] ${label} is not reachable at ${url} after ${timeoutMs}ms. ${RESET_HINT}\n` +
      `Last error: ${String(lastError)}`,
  );
}

function queryQm101DepartureDate(): string {
  const user = process.env.POSTGRES_USER ?? "qoomlee";
  const db = process.env.POSTGRES_QOOMLEE_DB ?? "qoomlee";
  // BKK-local calendar date — matches how the search API buckets a
  // "departure" query param (see services/qoomlee/flight/service.go's
  // bkkDateToUTCRange), so this is exactly the string the UI's date param
  // needs to find this flight.
  const sql = `SELECT (departure_time AT TIME ZONE 'Asia/Bangkok')::date FROM flights WHERE id = ${QM101_FLIGHT_ID};`;

  let stdout: string;
  try {
    stdout = execFileSync(
      "docker",
      ["compose", "exec", "-T", "postgres-qoomlee", "psql", "-U", user, "-d", db, "-tAc", sql],
      { cwd: REPO_ROOT, encoding: "utf-8" },
    );
  } catch (err) {
    throw new Error(
      `[e2e/real] Could not read QM101's (flight id=${QM101_FLIGHT_ID}) departure date from ` +
        `postgres-qoomlee. Is the stack up? ${RESET_HINT}\nUnderlying error: ${String(err)}`,
    );
  }

  const date = stdout.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      `[e2e/real] Flight id=${QM101_FLIGHT_ID} not found (empty query result) — the seed data ` +
        `looks missing or different from what this suite expects. ${RESET_HINT}`,
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    throw new Error(
      `[e2e/real] Flight id=${QM101_FLIGHT_ID} departs ${date}, which is already in the past — ` +
        `the seed data is stale (it was computed relative to whenever the DB volume was last ` +
        `initialized, not "now"). ${RESET_HINT}`,
    );
  }

  return date;
}

export default async function globalSetup() {
  console.log("[e2e/real] Checking the real backend is up...");
  await Promise.all([
    waitForHealthy(QOOMLEE_HEALTH_URL, "qoomlee-service"),
    waitForHealthy(PAYMENT_HEALTH_URL, "payment-service"),
  ]);

  const departure = queryQm101DepartureDate();
  console.log(`[e2e/real] QM101 (BKK→SIN) currently departs ${departure} — using it as "today".`);
  process.env.E2E_REAL_QM101_DEPARTURE = departure;
}
