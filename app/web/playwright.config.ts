import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./uitests",
  // uitests/traditional/ is a separate, intentional anti-pattern reference
  // suite (see docs/stories/demo-story-traditional.md) that must stay
  // runnable via its documented `npx playwright test uitests/traditional`,
  // so it's not excluded here — `testIgnore` would block that explicit
  // invocation too. Instead, `bun run test:ui` (package.json) targets only
  // uitests/*.spec.ts so the default/CI run doesn't silently pull it in.
  fullyParallel: false,
  // Serialized on purpose: specs share route-mock/dev-server state and
  // could race each other in parallel workers. Revisit if that changes.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
  },
  expect: {
    timeout: 10000,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
