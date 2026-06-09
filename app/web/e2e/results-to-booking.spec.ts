/**
 * API integration e2e tests: search API → results page → booking page.
 *
 * page.route() intercepts browser-initiated fetch calls.  The results page is a
 * Next.js Server Component, so its fetch runs in the Node.js process — not in
 * the browser — and cannot be intercepted that way.
 *
 * Strategy: point NEXT_PUBLIC_QOOMLEE_API_URL at a relative path (/api/mock-flights)
 * is not available here, so we test the two ends independently:
 *   1. Results page with the real API (or graceful empty-state when unavailable).
 *   2. Booking page receives correct data once navigated to directly.
 *   3. Full select→booking URL flow via client-side router (unit-covered in FlightList.test).
 *
 * For a test that controls the API response end-to-end, a mock HTTP server on
 * port 8082 would be needed (out of scope here — covered by unit tests instead).
 */
import { test, expect } from "@playwright/test";

const RESULTS_URL =
  "/flights/results?" +
  "origin=BKK&destination=SIN&departure=2026-10-24&passengers=1&cabin=economy";

const BOOKING_WITH_FLIGHT =
  "/bookings/new?" +
  "flightId=1" +
  "&flightNumber=QQ101" +
  "&origin=BKK" +
  "&destination=SIN" +
  "&departureTime=2026-10-24T08%3A00%3A00Z" +
  "&price=810000" +
  "&currency=THB" +
  "&passengers=1";

test.describe("Results page — API-driven rendering", () => {
  test("renders the results page and shows flight count or empty state", async ({ page }) => {
    await page.goto(RESULTS_URL);
    await page.waitForLoadState("networkidle");

    // Either real flights or the empty state — both are valid outcomes
    const hasFlights = await page.getByRole("button", { name: /select/i }).count() > 0;
    const hasEmptyState = await page.getByText("No flights found for this route.").isVisible();
    expect(hasFlights || hasEmptyState).toBe(true);
  });

  test("shows the BKK → SIN search summary in the header", async ({ page }) => {
    await page.goto(RESULTS_URL);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/BKK.*SIN|SIN.*BKK/)).toBeVisible({ timeout: 5000 });
  });

  test("filter chips render on the results page", async ({ page }) => {
    await page.goto(RESULTS_URL);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Best" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Price" })).toBeVisible();
  });
});

test.describe("Booking page — receives correct data from results", () => {
  test("booking page shows correct flight info from URL params set by FlightList", async ({ page }) => {
    await page.goto(BOOKING_WITH_FLIGHT);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("QQ101")).toBeVisible();
    await expect(page.getByText("BKK").first()).toBeVisible();
    await expect(page.getByText("SIN").first()).toBeVisible();
  });

  test("payment summary reflects the price from the flight URL param", async ({ page }) => {
    await page.goto(BOOKING_WITH_FLIGHT);
    await page.waitForLoadState("networkidle");
    // price=810000 → ฿8,100 base fare for 1 passenger
    await expect(page.getByText(/฿8[,.]?100/)).toBeVisible();
  });

  test("payment summary shows taxes as 15% of base fare", async ({ page }) => {
    await page.goto(BOOKING_WITH_FLIGHT);
    await page.waitForLoadState("networkidle");
    // taxes = round(810000 * 0.15) = 121500 minor → ฿1,215
    await expect(page.getByText(/฿1[,.]?215/)).toBeVisible();
  });

  test("payment summary shows correct total", async ({ page }) => {
    await page.goto(BOOKING_WITH_FLIGHT);
    await page.waitForLoadState("networkidle");
    // total = 810000 + 121500 = 931500 minor → ฿9,315
    await expect(page.getByText(/฿9[,.]?315/)).toBeVisible();
  });

  test("passengers count from URL param appears in base fare label", async ({ page }) => {
    await page.goto(BOOKING_WITH_FLIGHT);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Base Fare (1x Adult)")).toBeVisible();
  });

  test("two-passenger booking doubles the base fare", async ({ page }) => {
    const url = BOOKING_WITH_FLIGHT.replace("passengers=1", "passengers=2");
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    // 810000 × 2 = 1620000 minor → ฿16,200
    await expect(page.getByText(/฿16[,.]?200/)).toBeVisible();
    await expect(page.getByText("Base Fare (2x Adult)")).toBeVisible();
  });
});
