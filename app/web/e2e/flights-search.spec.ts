import { test, expect, type Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 768;

/**
 * Because SearchForm renders three layout trees simultaneously (lg / md / mobile)
 * and hides them with CSS, getByText() can resolve to multiple elements across
 * the hidden trees.  .filter({ visible: true }) narrows to the one that is
 * actually on-screen for the current viewport.
 */
const visibleText = (page: Page, text: string | RegExp) =>
  page.getByText(text).filter({ visible: true });

const visibleRole = (
  page: Page,
  role: Parameters<Page["getByRole"]>[0],
  opts?: Parameters<Page["getByRole"]>[1],
) => page.getByRole(role, opts).filter({ visible: true });

test.describe("Flight search form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/flights");
    await page.waitForLoadState("networkidle");
    // Ensure React has hydrated and the form is interactive before each test.
    await expect(
      page.getByRole("button", { name: "Search Flights" }).filter({ visible: true }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("swaps origin and destination (desktop)", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");

    await visibleText(page, "Select origin").click();
    await visibleText(page, "Suvarnabhumi Airport").click();

    await visibleText(page, "Select destination").click();
    await visibleText(page, "Singapore Changi Airport").click();

    await visibleRole(page, "button", { name: "Swap origin and destination" }).click();

    await expect(visibleText(page, "Singapore (SIN)")).toBeVisible();
    await expect(visibleText(page, "Bangkok (BKK)")).toBeVisible();
  });

  // ── Airport select — mobile bottom sheet ──────────────────────────────────────

  test("opens bottom sheet when From is tapped (mobile)", async ({ page }) => {
    test.skip(!isMobile(page), "mobile only");

    await page
      .getByRole("button")
      .filter({ visible: true })
      .filter({ hasText: "Select city or airport" })
      .first()
      .click();

    await expect(page.getByText("Flying from")).toBeVisible({ timeout: 10000 });
    await expect(visibleText(page, "Popular Cities or Airports")).toBeVisible();
  });

  test("selects an airport via the mobile bottom sheet", async ({ page }) => {
    test.skip(!isMobile(page), "mobile only");

    await page
      .getByRole("button")
      .filter({ visible: true })
      .filter({ hasText: "Select city or airport" })
      .first()
      .click();

    await expect(page.getByText("Flying from")).toBeVisible({ timeout: 10000 });
    await visibleText(page, "Suvarnabhumi Airport").click();

    await expect(visibleText(page, "Bangkok (BKK)")).toBeVisible();
    await expect(page.getByText("Flying from")).not.toBeVisible();
  });

  test("closes mobile bottom sheet when backdrop is tapped", async ({ page }) => {
    test.skip(!isMobile(page), "mobile only");

    await page
      .getByRole("button")
      .filter({ visible: true })
      .filter({ hasText: "Select city or airport" })
      .first()
      .click();

    await expect(page.getByText("Flying from")).toBeVisible({ timeout: 10000 });

    // Tap the backdrop (top-left corner, outside the sheet)
    await page.mouse.click(10, 10);
    await expect(page.getByText("Flying from")).not.toBeVisible({ timeout: 10000 });
  });

  // ── Happy path ────────────────────────────────────────────────────────────────

  test("navigates to results page on valid one-way search (desktop)", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");

    await visibleText(page, "Select origin").click();
    await visibleText(page, "Suvarnabhumi Airport").click();

    await visibleText(page, "Select destination").click();
    await visibleText(page, "Singapore Changi Airport").click();

    // Open the custom calendar (portal renders to document.body with data-testid="calendar-panel")
    await page.locator('[data-testid="departure-trigger"]').filter({ visible: true }).click();
    const cal = page.locator('[data-testid="calendar-panel"]');
    await expect(cal).toBeVisible({ timeout: 10000 });
    // Click the first non-disabled day button (past days have disabled attr; nav buttons have aria-label)
    await cal.locator('button[type="button"]:not([aria-label]):not([disabled])').first().click();

    await visibleRole(page, "button", { name: "Search Flights" }).click();
    await expect(page).toHaveURL(/\/flights\/results/, { timeout: 10000 });
    await expect(page).toHaveURL(/origin=BKK/);
    await expect(page).toHaveURL(/destination=SIN/);
  });
});
