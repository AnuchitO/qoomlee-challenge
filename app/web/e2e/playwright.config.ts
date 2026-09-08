import { defineConfig, devices } from "@playwright/test";

/**
 * The real E2E tier — drives the actual frontend against the actual
 * qoomlee-service + payment-service + Postgres (docker compose), no mocks.
 * See ./README.md for what this is and how it differs from ../uitests/ (the
 * fast, mocked UI-tests loop).
 *
 * Run with `bun run test:e2e` (from app/web). Requires the backend stack up
 * first: `bun run test:e2e:reset` (destructive — wipes local dev DB data and
 * reseeds fresh) or `docker compose up -d --wait` from the repo root.
 */
export default defineConfig({
  testDir: ".",
  globalSetup: "./global-setup.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  // No auto-retry: a flaky real-E2E failure is a signal, not noise to hide.
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "./report" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
  },
  expect: {
    timeout: 15000,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Only the frontend — the real backend (docker compose) is a precondition
  // this tier checks in globalSetup, not something it starts itself.
  webServer: {
    command: "bun run dev",
    cwd: "..",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
