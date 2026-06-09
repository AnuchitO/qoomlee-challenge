import { test, expect } from "@playwright/test";

const BASE_PARAMS =
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

const CONFIRMATION_URL = `/bookings/confirmation?${BASE_PARAMS}`;

test.describe("Booking Confirmation page (QML-006)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONFIRMATION_URL);
    await page.waitForLoadState("networkidle");
  });

  // ── page renders ────────────────────────────────────────────────────────────

  test("renders Booking Confirmed heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /booking confirmed/i })
    ).toBeVisible();
  });

  test("renders the success hero section", async ({ page }) => {
    await expect(page.getByTestId("confirmation-hero")).toBeVisible();
    await expect(page.getByText("Your adventure begins here")).toBeVisible();
  });

  // ── booking reference ───────────────────────────────────────────────────────

  test("displays the booking reference prominently", async ({ page }) => {
    await expect(page.getByTestId("booking-ref")).toHaveText("QM7X2K");
  });

  test("renders Booking Reference label above the ref", async ({ page }) => {
    await expect(page.getByText("Booking Reference")).toBeVisible();
  });

  // ── flight details ──────────────────────────────────────────────────────────

  test("shows the flight number", async ({ page }) => {
    await expect(page.getByTestId("flight-number")).toContainText("QQ101");
  });

  test("shows origin and destination in the flight summary line", async ({ page }) => {
    const line = page.getByTestId("flight-summary-line");
    await expect(line).toContainText("BKK");
    await expect(line).toContainText("SIN");
    await expect(line).toContainText("QQ101");
  });

  test("shows origin and destination in booking details", async ({ page }) => {
    await expect(page.getByTestId("route")).toContainText("BKK");
    await expect(page.getByTestId("route")).toContainText("SIN");
  });

  test("shows the departure date in the flight summary", async ({ page }) => {
    // Oct 24, 2026 should appear somewhere in the rendered date
    await expect(page.getByTestId("flight-summary-line")).toContainText("2026");
  });

  // ── passenger details ───────────────────────────────────────────────────────

  test("shows the passenger full name", async ({ page }) => {
    await expect(page.getByTestId("passenger-name")).toHaveText("John Doe");
  });

  test("shows the passenger email address", async ({ page }) => {
    await expect(page.getByTestId("passenger-email")).toHaveText("john@example.com");
  });

  // ── payment total ───────────────────────────────────────────────────────────

  test("shows the total amount paid", async ({ page }) => {
    // 931500 minor THB → ฿9,315.00 (exact format depends on locale, match digits)
    const total = page.getByTestId("total-amount");
    await expect(total).toBeVisible();
    await expect(total).toContainText(/9[,.]?315/);
  });

  test("shows the Total Paid label", async ({ page }) => {
    await expect(page.getByText("Total Paid")).toBeVisible();
  });

  // ── confirmation notice ─────────────────────────────────────────────────────

  test("shows email confirmation notice with the passenger email", async ({ page }) => {
    await expect(
      page.getByText(/confirmation email.*sent/i)
    ).toBeVisible();
    await expect(page.getByText("john@example.com").last()).toBeVisible();
  });

  // ── edge cases ──────────────────────────────────────────────────────────────

  test("renders gracefully with missing optional fields", async ({ page }) => {
    await page.goto("/bookings/confirmation?ref=QM0001&flightNumber=QQ200&origin=BKK&destination=SIN&totalMinor=500000&currency=THB&departureTime=2026-12-01T10%3A00%3A00Z");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("booking-ref")).toHaveText("QM0001");
    await expect(
      page.getByRole("heading", { name: /booking confirmed/i })
    ).toBeVisible();
  });

  test("page title is Booking Confirmed", async ({ page }) => {
    await expect(page).toHaveTitle(/booking confirmed/i);
  });
});
