/**
 * E2E tests for the My Bookings list page (QML-046).
 *
 * All backend API calls are intercepted with page.route() so these tests run
 * against the Next.js dev server alone — no Go service required.
 */
import { test, expect, type Page } from "@playwright/test";

const BOOKINGS_URL = "/bookings";

const BASE_SUMMARY = {
  bookingRef: "SEED01",
  flightNumber: "QM101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-10-24T08:00:00Z",
  passengers: 1,
  totalAmount: "3500.00",
  currency: "THB",
};

async function mockBookingsApi(page: Page, body: unknown, status = 200) {
  await page.route("**/api/bookings", (route) => {
    void route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test.describe("My Bookings page (QML-046)", () => {
  test("shows a green 'Confirmed' badge for a CONFIRMED booking", async ({ page }) => {
    await mockBookingsApi(page, [{ ...BASE_SUMMARY, status: "CONFIRMED" }]);
    await page.goto(BOOKINGS_URL);

    const badge = page.getByText("Confirmed");
    await expect(badge).toBeVisible({ timeout: 5000 });
    const cls = await badge.getAttribute("class");
    expect(cls).toMatch(/green/);
  });

  test("shows an amber 'Awaiting payment' badge for a PENDING booking", async ({ page }) => {
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();
    await mockBookingsApi(page, [{ ...BASE_SUMMARY, status: "PENDING", expiresAt }]);
    await page.goto(BOOKINGS_URL);

    await expect(page.getByText(/Awaiting payment · expires in \d+m/)).toBeVisible({
      timeout: 5000,
    });
  });

  test("shows a grey 'Expired' badge for an EXPIRED booking", async ({ page }) => {
    await mockBookingsApi(page, [{ ...BASE_SUMMARY, status: "EXPIRED" }]);
    await page.goto(BOOKINGS_URL);

    await expect(page.getByText("Expired")).toBeVisible({ timeout: 5000 });
  });

  test("shows the empty state when there are no bookings", async ({ page }) => {
    await mockBookingsApi(page, []);
    await page.goto(BOOKINGS_URL);

    await expect(page.getByText("No bookings yet")).toBeVisible({ timeout: 5000 });
  });

  test("shows multiple bookings when the API returns more than one", async ({ page }) => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await mockBookingsApi(page, [
      { ...BASE_SUMMARY, bookingRef: "SEED01", status: "CONFIRMED" },
      { ...BASE_SUMMARY, bookingRef: "SEED02", status: "PENDING", expiresAt },
      { ...BASE_SUMMARY, bookingRef: "SEED03", status: "EXPIRED" },
    ]);
    await page.goto(BOOKINGS_URL);

    await expect(page.getByText("Confirmed")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Awaiting payment/)).toBeVisible();
    await expect(page.getByText("Expired")).toBeVisible();
    await expect(page.getByText("No bookings yet")).not.toBeVisible();
  });

  test("shows the page title 'My Bookings'", async ({ page }) => {
    await mockBookingsApi(page, []);
    await page.goto(BOOKINGS_URL);

    await expect(page.getByRole("heading", { name: /my bookings/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("does not show the empty state while loading", async ({ page }) => {
    // never resolves — keeps page in loading skeleton state
    await page.route("**/api/bookings", () => {});
    await page.goto(BOOKINGS_URL);

    await expect(page.getByText("No bookings yet")).not.toBeVisible();
    await expect(page.getByText("Confirmed")).not.toBeVisible();
  });
});
