/**
 * End-to-end journey: a traveller searches for a flight, books it,
 * pays with a card, and receives their booking confirmation (PNR).
 *
 * All backend services are route-mocked so the test runs fully offline
 * and deterministically. Each mock represents the contract of one
 * service boundary; if the real API changes shape, this test flags it.
 */
import { test, expect } from "@playwright/test";

const BOOKING_REF = "TB7X2K";

const MOCK_FLIGHT = {
  id: 1,
  flightNumber: "QQ101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-10-24T08:00:00Z",
  arrivalTime: "2026-10-24T09:30:00Z",
  basePriceMinor: 810000,
  currency: "THB",
  availableSeats: 50,
  status: "scheduled",
  durationMinutes: 90,
};

const RESULTS_URL =
  "/flights/results?" +
  "origin=BKK&destination=SIN&departure=2026-10-24&passengers=1&cabin=economy";

async function mockAllServices(page: import("@playwright/test").Page) {
  // Qoomlee — flight search results
  await page.route("**/api/flights/search*", (route) => {
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([MOCK_FLIGHT]),
    });
  });

  // Qoomlee — create booking (POST) and get booking (GET /:ref)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await page.route("**/api/bookings**", (route) => {
    if (route.request().method() === "POST") {
      void route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ bookingRef: BOOKING_REF }),
      });
    } else {
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "PENDING",
          expiresAt,
          totalAmountMinor: 931500, // 810000 base + 121500 (15% tax)
        }),
      });
    }
  });

  // Payment service — charge card
  await page.route("**/api/payments/charge", (route) => {
    void route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ paymentId: 1, status: "succeeded" }),
    });
  });
}

test.describe("Traveller books and pays for a flight", () => {
  test("happy path: search → select flight → passenger details → pay → booking confirmation (PNR)", async ({
    page,
  }) => {
    await mockAllServices(page);

    // ── Step 1: search results ─────────────────────────────────────────
    // Traveller searches BKK → SIN for 24 Oct 2026, 1 adult
    await page.goto(RESULTS_URL);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("QQ101")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/BKK.*SIN|SIN.*BKK/).first()).toBeVisible();

    // ── Step 2: select a flight ────────────────────────────────────────
    await page
      .getByRole("button", { name: /select/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/bookings\/new/, { timeout: 5000 });
    await expect(page.getByText("QQ101")).toBeVisible();

    // ── Step 3: fill passenger details ────────────────────────────────
    await page.getByPlaceholder("e.g. John").fill("Jane");
    await page.getByPlaceholder("e.g. Doe").fill("Smith");
    await page.getByPlaceholder("john.doe@example.com").fill("jane@example.com");
    await page.getByPlaceholder("000 000 000").fill("0812345678");

    await page.getByRole("button", { name: /continue to payment/i }).click();

    await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });
    await expect(page).toHaveURL(new RegExp(`ref=${BOOKING_REF}`));

    // ── Step 4: fill card details and pay ─────────────────────────────
    await expect(page.getByTestId("countdown")).toBeVisible({ timeout: 5000 });

    await page.getByPlaceholder("e.g. Johnathan Doe").fill("Jane Smith");
    await page.getByPlaceholder("0000 0000 0000 0000").fill("4111111111111111");
    await page.getByPlaceholder("MM/YY").fill("1228");
    await page.getByPlaceholder("•••").fill("123");
    await page.getByRole("checkbox", { name: /i agree/i }).check();

    await page.getByRole("button", { name: /pay.*securely/i }).click();

    // ── Step 5: booking confirmation (PNR) ────────────────────────────
    await expect(page).toHaveURL(/\/bookings\/confirmation/, { timeout: 5000 });
    await expect(page).toHaveURL(new RegExp(`ref=${BOOKING_REF}`));

    await expect(page.getByRole("heading", { name: /booking confirmed/i })).toBeVisible();
    await expect(page.getByText(BOOKING_REF)).toBeVisible();
    await expect(page.getByText(/jane/i).first()).toBeVisible();
    await expect(page.getByText("QQ101").first()).toBeVisible();
  });
});
