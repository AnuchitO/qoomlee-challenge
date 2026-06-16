/**
 * QML-048 — Prevent Duplicate Bookings on Back Navigation
 *
 * These tests verify the bookingToken mechanism end-to-end:
 * - a UUID is stamped into the /bookings/new URL on first load
 * - the same token survives back-navigation from /payment
 * - both "Continue to Payment" clicks send the same ?bookingToken= to the API
 *   so the backend can return the existing booking instead of creating a new one
 */

import { test, expect } from "@playwright/test";

const BOOKING_URL =
  "/bookings/new?" +
  "flightId=1" +
  "&flightNumber=QQ101" +
  "&origin=BKK" +
  "&destination=SIN" +
  "&departureTime=2026-10-24T08%3A00%3A00Z" +
  "&price=810000" +
  "&currency=THB" +
  "&passengers=1";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Intercept POST /api/bookings* and return a fake successful booking. */
async function mockCreateBooking(page: import("@playwright/test").Page) {
  await page.route("**/api/bookings*", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    void route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        bookingId: 1,
        bookingRef: "QM7X2K",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      }),
    });
  });
}

async function fillAndSubmitBookingForm(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("e.g. John").fill("John");
  await page.getByPlaceholder("e.g. Doe").fill("Doe");
  await page.getByPlaceholder("john.doe@example.com").fill("john@example.com");
  await page.getByPlaceholder("000 000 000").fill("0812345678");
  await page.getByRole("button", { name: /continue to payment/i }).click();
}

test.describe("Booking token deduplication (QML-048)", () => {
  // ── token injection ─────────────────────────────────────────────────────────

  test("injects a UUID bookingToken into the URL on first load", async ({ page }) => {
    await page.goto(BOOKING_URL);
    await page.waitForLoadState("networkidle");

    const url = new URL(page.url());
    const token = url.searchParams.get("bookingToken");

    expect(token).toMatch(UUID_RE);
  });

  test("generates a fresh bookingToken for each new booking session", async ({ page }) => {
    await page.goto(BOOKING_URL);
    await page.waitForLoadState("networkidle");
    const token1 = new URL(page.url()).searchParams.get("bookingToken");

    await page.goto("/flights");
    await page.goto(BOOKING_URL);
    await page.waitForLoadState("networkidle");
    const token2 = new URL(page.url()).searchParams.get("bookingToken");

    expect(token1).toMatch(UUID_RE);
    expect(token2).toMatch(UUID_RE);
    expect(token1).not.toBe(token2);
  });

  // ── back navigation preserves token ────────────────────────────────────────

  test("bookingToken in URL is unchanged after navigating back from payment", async ({ page }) => {
    await mockCreateBooking(page);
    await page.goto(BOOKING_URL);
    await page.waitForLoadState("networkidle");

    const tokenBeforeSubmit = new URL(page.url()).searchParams.get("bookingToken");
    expect(tokenBeforeSubmit).toMatch(UUID_RE);

    await fillAndSubmitBookingForm(page);
    await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });

    await page.goBack();
    await page.waitForLoadState("networkidle");

    const tokenAfterBack = new URL(page.url()).searchParams.get("bookingToken");
    expect(tokenAfterBack).toBe(tokenBeforeSubmit);
  });

  // ── no double booking ───────────────────────────────────────────────────────

  test("sends the same bookingToken on both API calls when user goes back and continues again", async ({
    page,
  }) => {
    const capturedTokens: string[] = [];

    await page.route("**/api/bookings*", (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const url = new URL(route.request().url());
      const token = url.searchParams.get("bookingToken") ?? "";
      capturedTokens.push(token);
      void route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          bookingId: 1,
          bookingRef: "QM7X2K",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        }),
      });
    });

    // First visit — fill and submit
    await page.goto(BOOKING_URL);
    await page.waitForLoadState("networkidle");
    await fillAndSubmitBookingForm(page);
    await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });

    // Navigate back and submit again
    await page.goBack();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /continue to payment/i }).click();
    await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });

    // Two POST calls were made
    expect(capturedTokens).toHaveLength(2);

    // Both must carry the same bookingToken — backend deduplicates on this key
    expect(capturedTokens[0]).toMatch(UUID_RE);
    expect(capturedTokens[0]).toBe(capturedTokens[1]);
  });

  test("does not navigate to payment when API call is still in flight (button disabled while submitting)", async ({
    page,
  }) => {
    let resolveRequest!: () => void;
    const requestPending = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    // Hold the response so we can inspect the interim UI state
    await page.route("**/api/bookings*", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      resolveRequest();
      // Wait 2 s before responding so the button stays disabled
      await new Promise((r) => setTimeout(r, 2000));
      void route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ bookingId: 1, bookingRef: "QM7X2K" }),
      });
    });

    await page.goto(BOOKING_URL);
    await page.waitForLoadState("networkidle");
    await fillAndSubmitBookingForm(page);

    // Wait until the request has been received before asserting
    await requestPending;

    const continueBtn = page.getByRole("button", { name: /continue to payment/i });
    await expect(continueBtn).toBeDisabled();
    await expect(page).toHaveURL(/\/bookings\/new/);
  });
});
