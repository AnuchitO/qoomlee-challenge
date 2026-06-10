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
  });

  // ── Trip type toggle ─────────────────────────────────────────────────────────

  test("shows 'Round trip' and 'One way' tabs", async ({ page }) => {
    await expect(visibleText(page, "Round trip")).toBeVisible();
    await expect(visibleText(page, "One way")).toBeVisible();
  });

  test("switches to Round trip and shows a return date input", async ({ page }) => {
    await visibleText(page, "Round trip").click();
    // After switching, at least one return date input should appear
    await expect(page.locator('input[type="date"]').filter({ visible: true }).last()).toBeVisible({
      timeout: 5000,
    });
  });

  // ── Airport select — desktop ─────────────────────────────────────────────────

  test("opens airport dropdown and selects an airport (desktop)", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");

    await visibleText(page, "Select origin").click();
    await expect(visibleText(page, "Popular Cities or Airports")).toBeVisible();
    await visibleText(page, "Suvarnabhumi Airport").click();
    await expect(visibleText(page, "Bangkok (BKK)")).toBeVisible();
  });

  test("filters airports by search query (desktop)", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");

    await visibleText(page, "Select origin").click();
    await page
      .getByPlaceholder("Search airports or cities…")
      .filter({ visible: true })
      .fill("Singapore");
    await expect(visibleText(page, "Singapore Changi Airport")).toBeVisible();
    await expect(
      page.getByText("Suvarnabhumi Airport").filter({ visible: true }),
    ).not.toBeVisible();
  });

  test("excludes selected origin from destination dropdown (desktop)", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");

    await visibleText(page, "Select origin").click();
    await visibleText(page, "Suvarnabhumi Airport").click();

    await visibleText(page, "Select destination").click();
    await page
      .getByPlaceholder("Search airports or cities…")
      .filter({ visible: true })
      .fill("Bangkok");
    await expect(visibleText(page, "No airports found")).toBeVisible();
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
    await expect(page.getByText("Flying from")).not.toBeVisible({ timeout: 5000 });
  });

  // ── Date picker ───────────────────────────────────────────────────────────────

  test("auto-opens return date picker after clicking Add return", async ({ page }) => {
    await visibleText(page, "One way").click();
    await expect(visibleRole(page, "button", { name: "Add return" })).toBeVisible();

    await visibleRole(page, "button", { name: "Add return" }).click();

    // Return date input must appear in the active layout
    await expect(page.locator('input[type="date"]').filter({ visible: true }).last()).toBeVisible({
      timeout: 5000,
    });
  });

  // ── Validation ────────────────────────────────────────────────────────────────

  test("shows origin validation error when Search is clicked with empty fields", async ({
    page,
  }) => {
    await visibleRole(page, "button", { name: "Search Flights" }).click();

    await expect(visibleText(page, "Please enter a departure city or airport")).toBeVisible({
      timeout: 5000,
    });
  });

  // ── Happy path ────────────────────────────────────────────────────────────────

  test("navigates to results page on valid one-way search (desktop)", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");

    await visibleText(page, "Select origin").click();
    await visibleText(page, "Suvarnabhumi Airport").click();

    await visibleText(page, "Select destination").click();
    await visibleText(page, "Singapore Changi Airport").click();

    await page.locator('input[type="date"]').filter({ visible: true }).first().fill("2026-08-01");

    await visibleRole(page, "button", { name: "Search Flights" }).click();
    await expect(page).toHaveURL(/\/flights\/results/, { timeout: 10000 });
    await expect(page).toHaveURL(/origin=BKK/);
    await expect(page).toHaveURL(/destination=SIN/);
  });
});
