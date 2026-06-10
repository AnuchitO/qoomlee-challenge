import { test, expect } from "@playwright/test";

/**
 * Visual regression baseline.
 *
 * Run `npx playwright test e2e/visual --update-snapshots` after an
 * intentional UI change to refresh the baselines, then commit the
 * generated PNGs under e2e/visual/visual.spec.ts-snapshots/.
 */

const SEARCH_RESULTS_URL =
  "/flights/results?origin=BKK&destination=SIN&departure=2026-10-24&passengers=1&cabin=economy";

const PAYMENT_URL =
  "/payment?" +
  "flightNumber=QQ101" +
  "&origin=BKK" +
  "&destination=SIN" +
  "&departureTime=2026-10-24T08%3A00%3A00Z" +
  "&price=810000" +
  "&currency=THB" +
  "&passengers=1" +
  "&firstName=John" +
  "&lastName=Doe" +
  "&email=john%40example.com" +
  "&phone=0812345678";

const CONFIRMATION_URL =
  "/bookings/confirmation?" +
  "ref=QM7X2K" +
  "&flightNumber=QQ101" +
  "&origin=BKK" +
  "&destination=SIN" +
  "&departureTime=2026-10-24T08%3A00%3A00Z" +
  "&firstName=John" +
  "&lastName=Doe" +
  "&email=john%40example.com" +
  "&totalMinor=931500" +
  "&currency=THB";

test.describe("Visual regression", () => {
  test("home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  });

  test("flight search results page", async ({ page }) => {
    await page.goto(SEARCH_RESULTS_URL);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("search-results.png", { fullPage: true });
  });

  test("payment page", async ({ page }) => {
    await page.goto(PAYMENT_URL);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("payment.png", { fullPage: true });
  });

  test("booking confirmation page", async ({ page }) => {
    await page.goto(CONFIRMATION_URL);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("confirmation.png", { fullPage: true });
  });
});
