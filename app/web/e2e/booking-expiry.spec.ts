/**
 * E2E tests for the booking-expiry feature (QML-041 – QML-045).
 *
 * All backend API calls are intercepted with page.route() so these tests run
 * against the Next.js dev server alone — no Go service required.
 */
import { test, expect, type Page } from "@playwright/test";

const REF = "QM7X2K";

const PAYMENT_URL =
  `/payment?ref=${REF}` +
  "&flightNumber=QQ101" +
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

async function mockBookingApi(page: Page, response: Record<string, unknown>) {
  await page.route(`**/${REF}`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

async function mockChargeApi(page: Page, status: number, body: Record<string, unknown>) {
  await page.route("**/api/payments/charge", (route) => {
    void route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test.describe("Payment page — PENDING booking (QML-044)", () => {
  test.beforeEach(async ({ page }) => {
    const expiresAt = new Date(Date.now() + 14 * 60 * 1000).toISOString();
    await mockBookingApi(page, { status: "PENDING", expiresAt });
    await mockChargeApi(page, 200, { paymentId: 1, status: "succeeded" });
    await page.goto(PAYMENT_URL);
    await page.waitForLoadState("networkidle");
  });

  test("shows the Secure Payment heading", async ({ page }) => {
    await expect(page.getByText("Secure Payment")).toBeVisible();
  });

  test("shows a countdown timer in MM:SS format when booking is PENDING", async ({ page }) => {
    const timer = page.getByTestId("countdown");
    await expect(timer).toBeVisible({ timeout: 5000 });
    await expect(timer).toHaveText(/^\d{2}:\d{2}$/);
  });

  test("countdown seeds from server-provided expiresAt (~14 minutes)", async ({ page }) => {
    const timer = page.getByTestId("countdown");
    await expect(timer).toBeVisible({ timeout: 5000 });
    // Expect somewhere in the 13:xx – 14:xx range (server said 14 minutes)
    await expect(timer).toHaveText(/^1[34]:\d{2}$/);
  });

  test("shows the card payment form", async ({ page }) => {
    await expect(page.getByPlaceholder("e.g. Johnathan Doe")).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).toBeVisible();
  });

  test("navigates to /bookings/confirmation on successful payment", async ({ page }) => {
    await page.waitForSelector('[data-testid="countdown"]', { timeout: 5000 });
    await page.getByPlaceholder("e.g. Johnathan Doe").fill("John Doe");
    await page.getByPlaceholder("0000 0000 0000 0000").fill("4111111111111111");
    await page.getByPlaceholder("MM/YY").fill("1228");
    await page.getByPlaceholder("•••").fill("123");
    await page.getByRole("checkbox", { name: /i agree/i }).check();
    await page.getByRole("button", { name: /pay.*securely/i }).click();

    await expect(page).toHaveURL(/\/bookings\/confirmation/, { timeout: 8000 });
  });
});

test.describe("Payment page — EXPIRED booking (QML-042 / QML-045)", () => {
  test("shows the expired panel when GET /api/bookings/:ref returns EXPIRED", async ({ page }) => {
    await mockBookingApi(page, { status: "EXPIRED" });
    await page.goto(PAYMENT_URL);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/booking hold has expired/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("link", { name: /back to flight search/i })).toBeVisible();
    await expect(page.locator('[data-testid="countdown"]')).not.toBeVisible();
  });

  test("shows the expired panel when charge returns 409 booking_expired mid-submit", async ({
    page,
  }) => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await mockBookingApi(page, { status: "PENDING", expiresAt });
    await mockChargeApi(page, 409, { error: "booking_expired" });
    await page.goto(PAYMENT_URL);
    await page.waitForSelector('[data-testid="countdown"]', { timeout: 5000 });

    await page.getByPlaceholder("e.g. Johnathan Doe").fill("John Doe");
    await page.getByPlaceholder("0000 0000 0000 0000").fill("4111111111111111");
    await page.getByPlaceholder("MM/YY").fill("1228");
    await page.getByPlaceholder("•••").fill("123");
    await page.getByRole("checkbox", { name: /i agree/i }).check();
    await page.getByRole("button", { name: /pay.*securely/i }).click();

    await expect(page.getByText(/booking hold has expired/i)).toBeVisible({ timeout: 5000 });
    await expect(page).not.toHaveURL(/\/bookings\/confirmation/);
  });

  test("shows a generic error when charge fails for other reasons (not expiry)", async ({
    page,
  }) => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await mockBookingApi(page, { status: "PENDING", expiresAt });
    await mockChargeApi(page, 402, { error: "PAYMENT_FAILED" });
    await page.goto(PAYMENT_URL);
    await page.waitForSelector('[data-testid="countdown"]', { timeout: 5000 });

    await page.getByPlaceholder("e.g. Johnathan Doe").fill("John Doe");
    await page.getByPlaceholder("0000 0000 0000 0000").fill("4111111111111111");
    await page.getByPlaceholder("MM/YY").fill("1228");
    await page.getByPlaceholder("•••").fill("123");
    await page.getByRole("checkbox", { name: /i agree/i }).check();
    await page.getByRole("button", { name: /pay.*securely/i }).click();

    await expect(page.getByText(/couldn't process your payment/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/booking hold has expired/i)).not.toBeVisible();
  });
});

test.describe("Payment page — CONFIRMED booking (QML-044)", () => {
  test("redirects to /bookings/confirmation when booking is already CONFIRMED", async ({
    page,
  }) => {
    await mockBookingApi(page, { status: "CONFIRMED" });
    await page.goto(PAYMENT_URL);

    await expect(page).toHaveURL(/\/bookings\/confirmation/, { timeout: 5000 });
    await expect(page).toHaveURL(new RegExp(`ref=${REF}`));
  });
});
