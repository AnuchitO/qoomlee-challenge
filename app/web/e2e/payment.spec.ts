import { test, expect } from "@playwright/test";

const BOOKING_REF = "QM7X2K";

const PAYMENT_URL =
  "/payment?" +
  `ref=${BOOKING_REF}` +
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

// Mock the booking lookup (GET /api/bookings/:ref) to return a PENDING booking
// with an expiresAt 15 minutes in the future so the page reaches "ready" state.
async function mockPendingBooking(page: import("@playwright/test").Page) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await page.route(`**/${BOOKING_REF}`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "PENDING", expiresAt }),
    });
  });
  await page.route("**/api/payments/charge", (route) => {
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ paymentId: 1, status: "succeeded" }),
    });
  });
}

test.describe("Secure Payment page", () => {
  test.beforeEach(async ({ page }) => {
    await mockPendingBooking(page);
    await page.goto(PAYMENT_URL);
    await page.waitForLoadState("networkidle");
  });

  // ── layout ────────────────────────────────────────────────────────────────

  test("renders Secure Payment heading", async ({ page }) => {
    await expect(page.getByText("Secure Payment")).toBeVisible();
  });

  test("renders the 4-step progress stepper", async ({ page }) => {
    await expect(page.getByText("Flights")).toBeVisible();
    await expect(page.getByText("Seats")).toBeVisible();
    await expect(page.getByText("Extras")).toBeVisible();
    // exact: true to avoid matching "Secure Payment" heading and "Payment Method" section
    await expect(page.getByText("Payment", { exact: true })).toBeVisible();
  });

  test("renders booking summary with flight details", async ({ page }) => {
    await expect(page.getByText("Booking Summary")).toBeVisible();
    await expect(page.getByText(/QQ101.*BKK.*SIN/)).toBeVisible();
  });

  test("shows a countdown timer in MM:SS format", async ({ page }) => {
    const timer = page.getByTestId("countdown");
    await expect(timer).toBeVisible();
    await expect(timer).toHaveText(/^\d{2}:\d{2}$/);
  });

  test("renders all payment method tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Card" })).toBeVisible();
    await expect(page.getByRole("button", { name: "PromptPay" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Bank" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Other" })).toBeVisible();
  });

  test("shows card form by default", async ({ page }) => {
    await expect(page.getByPlaceholder("e.g. Johnathan Doe")).toBeVisible();
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).toBeVisible();
  });

  test("shows Pay button with total amount", async ({ page }) => {
    // price=810000 → ฿8,100 base, tax=฿1,215, insurance=฿590, total=฿9,905
    await expect(page.getByRole("button", { name: /pay.*securely/i })).toBeVisible();
  });

  // ── pricing ───────────────────────────────────────────────────────────────

  test("shows base fare in booking summary", async ({ page }) => {
    // 810000 minor → ฿8,100
    await expect(page.getByText(/฿8[,.]?100/)).toBeVisible();
  });

  test("shows Total Amount row", async ({ page }) => {
    await expect(page.getByText("Total Amount")).toBeVisible();
  });

  // ── promo code ────────────────────────────────────────────────────────────

  test("applies QOOMFIRST promo and shows success banner", async ({ page }) => {
    await page.getByPlaceholder("Promo code").fill("QOOMFIRST");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText(/QOOMFIRST applied/i)).toBeVisible({ timeout: 3000 });
  });

  test("shows error for invalid promo code", async ({ page }) => {
    await page.getByPlaceholder("Promo code").fill("INVALIDCODE");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("Invalid promo code")).toBeVisible({ timeout: 3000 });
  });

  // ── payment method tabs ───────────────────────────────────────────────────

  test("shows coming-soon message when PromptPay tab is selected", async ({ page }) => {
    await page.getByRole("button", { name: "PromptPay" }).click();
    await expect(page.getByText(/PromptPay.*coming soon/i)).toBeVisible({ timeout: 3000 });
  });

  // ── validation ────────────────────────────────────────────────────────────

  test("shows validation errors when Pay is clicked with empty card form", async ({ page }) => {
    await page.getByRole("button", { name: /pay.*securely/i }).click();
    await expect(page.getByText("Required").first()).toBeVisible({ timeout: 3000 });
  });

  test("stays on the payment page when form is invalid", async ({ page }) => {
    await page.getByRole("button", { name: /pay.*securely/i }).click();
    await expect(page).toHaveURL(/\/payment/);
  });

  // ── loading overlay ───────────────────────────────────────────────────────

  test("shows loading overlay and blocks interaction while payment is processing", async ({
    page,
  }) => {
    let resolveCharge!: () => void;
    const chargePending = new Promise<void>((r) => {
      resolveCharge = r;
    });

    // Hold the charge response so we can inspect interim UI state
    await page.route("**/api/payments/charge", async (route) => {
      resolveCharge();
      await new Promise((r) => setTimeout(r, 2000));
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ paymentId: 1, status: "succeeded" }),
      });
    });

    await page.getByPlaceholder("e.g. Johnathan Doe").fill("John Doe");
    await page.getByPlaceholder("0000 0000 0000 0000").fill("4111111111111111");
    await page.getByPlaceholder("MM/YY").fill("1228");
    await page.getByPlaceholder("•••").fill("123");
    await page.getByRole("checkbox", { name: /i agree/i }).check();
    await page.getByRole("button", { name: /pay.*securely/i }).click();

    await chargePending;

    // Overlay must be visible
    await expect(page.getByTestId("payment-loading-overlay")).toBeVisible();
    await expect(page.getByText(/processing your payment/i)).toBeVisible();

    // Pay button is gone (overlay covers it) — user cannot click again
    await expect(page.getByRole("button", { name: /pay.*securely/i })).toBeDisabled();
  });

  // ── happy path ────────────────────────────────────────────────────────────

  test("navigates to /bookings/confirmation on valid payment", async ({ page }) => {
    await page.getByPlaceholder("e.g. Johnathan Doe").fill("John Doe");
    await page.getByPlaceholder("0000 0000 0000 0000").fill("4111111111111111");
    await page.getByPlaceholder("MM/YY").fill("1228");
    await page.getByPlaceholder("•••").fill("123");
    await page.getByRole("checkbox", { name: /i agree/i }).check();
    await page.getByRole("button", { name: /pay.*securely/i }).click();

    await expect(page).toHaveURL(/\/bookings\/confirmation/, { timeout: 5000 });
    await expect(page).toHaveURL(/ref=QM[A-Z0-9]{4}/);
    await expect(page).toHaveURL(/flightNumber=QQ101/);
    await expect(page).toHaveURL(/firstName=John/);
  });
});
