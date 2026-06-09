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

test.describe("Booking page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BOOKING_URL);
    await page.waitForLoadState("networkidle");
  });

  // ── page renders ─────────────────────────────────────────────────────────────

  test("renders the Book Your Flight heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /book your flight/i })).toBeVisible();
  });

  test("renders the Flight Summary card with flight number", async ({ page }) => {
    await expect(page.getByText("Flight Summary")).toBeVisible();
    await expect(page.getByText("QQ101")).toBeVisible();
  });

  test("renders origin and destination codes in the flight summary", async ({ page }) => {
    await expect(page.getByText("BKK").first()).toBeVisible();
    await expect(page.getByText("SIN").first()).toBeVisible();
  });

  test("renders Bangkok and Singapore city names for known airports", async ({ page }) => {
    await expect(page.getByText("Bangkok").first()).toBeVisible();
    await expect(page.getByText("Singapore").first()).toBeVisible();
  });

  test("renders the departure date in the flight summary", async ({ page }) => {
    await expect(page.getByText(/Oct 24, 2026/)).toBeVisible();
  });

  test("renders Passenger Details section", async ({ page }) => {
    await expect(page.getByText("Passenger Details")).toBeVisible();
    await expect(page.getByPlaceholder("e.g. John")).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Doe")).toBeVisible();
    await expect(page.getByPlaceholder("john.doe@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("000 000 000")).toBeVisible();
  });

  test("renders Payment Summary with Upgrade to Business upsell", async ({ page }) => {
    await expect(page.getByText(/payment summary/i)).toBeVisible();
    await expect(page.getByText("Upgrade to Business")).toBeVisible();
    await expect(page.getByText("Total Amount")).toBeVisible();
  });

  test("renders Continue to Payment button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /continue to payment/i })
    ).toBeVisible();
  });

  // ── form validation ───────────────────────────────────────────────────────────

  test("shows validation errors when form is submitted empty", async ({ page }) => {
    await page.getByRole("button", { name: /continue to payment/i }).click();
    await expect(page.getByText("Required").first()).toBeVisible({ timeout: 3000 });
  });

  test("shows email validation error for an invalid email address", async ({ page }) => {
    await page.getByPlaceholder("e.g. John").fill("John");
    await page.getByPlaceholder("e.g. Doe").fill("Doe");
    await page.getByPlaceholder("john.doe@example.com").fill("notanemail");
    await page.getByPlaceholder("000 000 000").fill("0812345678");
    await page.getByRole("button", { name: /continue to payment/i }).click();
    await expect(page.getByText("Valid email required")).toBeVisible({ timeout: 3000 });
  });

  test("stays on the booking page when form is invalid", async ({ page }) => {
    await page.getByRole("button", { name: /continue to payment/i }).click();
    await expect(page).toHaveURL(/\/bookings\/new/);
  });

  // ── happy path ────────────────────────────────────────────────────────────────

  test("navigates to /payment with passenger data on valid form submission", async ({ page }) => {
    await page.getByPlaceholder("e.g. John").fill("John");
    await page.getByPlaceholder("e.g. Doe").fill("Doe");
    await page.getByPlaceholder("john.doe@example.com").fill("john@example.com");
    await page.getByPlaceholder("000 000 000").fill("0812345678");
    await page.getByRole("button", { name: /continue to payment/i }).click();

    await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });
    await expect(page).toHaveURL(/firstName=John/);
    await expect(page).toHaveURL(/lastName=Doe/);
    await expect(page).toHaveURL(/flightNumber=QQ101/);
  });
});
