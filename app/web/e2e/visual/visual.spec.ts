/**
 * Page-level behaviour tests (one describe per page).
 *
 * These replaced the old screenshot-based visual regression suite.
 * Each test verifies that the critical content and interactive elements
 * on the page are present and correct — no pixel comparisons involved.
 */
import { test, expect, type Page } from "@playwright/test";

const BOOKING_REF = "QM7X2K";

const SEARCH_RESULTS_URL =
  "/flights/results?origin=BKK&destination=SIN&departure=2026-10-24&passengers=1&cabin=economy";

const PAYMENT_URL =
  `/payment?ref=${BOOKING_REF}` +
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

const CONFIRMATION_URL =
  `/bookings/confirmation?ref=${BOOKING_REF}` +
  "&flightNumber=QQ101" +
  "&origin=BKK" +
  "&destination=SIN" +
  "&departureTime=2026-10-24T08%3A00%3A00Z" +
  "&firstName=John" +
  "&lastName=Doe" +
  "&email=john%40example.com" +
  "&totalMinor=931500" +
  "&currency=THB";

async function mockPendingBooking(page: Page) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await page.route(`**/${BOOKING_REF}`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "PENDING", expiresAt }),
    });
  });
}

// ── Home page ──────────────────────────────────────────────────────────────────

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("shows the Qoomlee brand name", async ({ page }) => {
    await expect(page.getByText(/qoomlee/i).first()).toBeVisible();
  });

  test("shows a flight search form with origin and destination fields", async ({ page }) => {
    await expect(page.getByText("From").first()).toBeVisible();
    await expect(page.getByText("To").first()).toBeVisible();
  });

  test("shows the Search Flights button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /search flights/i }).first()).toBeVisible();
  });

  test("shows One way and Round trip trip-type options", async ({ page }) => {
    await expect(page.getByText("One way").first()).toBeVisible();
    await expect(page.getByText("Round trip").first()).toBeVisible();
  });
});

// ── Flight search results page ─────────────────────────────────────────────────

const MOCK_FLIGHTS = [
  {
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
  },
  {
    id: 2,
    flightNumber: "QQ202",
    origin: "BKK",
    destination: "SIN",
    departureTime: "2026-10-24T14:00:00Z",
    arrivalTime: "2026-10-24T15:30:00Z",
    basePriceMinor: 950000,
    currency: "THB",
    availableSeats: 12,
    status: "scheduled",
    durationMinutes: 90,
  },
];

test.describe("Flight search results page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/flights/search**", (route) => {
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_FLIGHTS),
      });
    });
    await page.goto(SEARCH_RESULTS_URL);
    await page.waitForLoadState("networkidle");
  });

  test("shows origin and destination in the header area", async ({ page }) => {
    await expect(page.getByText("BKK").first()).toBeVisible();
    await expect(page.getByText("SIN").first()).toBeVisible();
  });

  test("shows at least one flight card with a price", async ({ page }) => {
    await expect(page.getByText(/฿/).first()).toBeVisible({ timeout: 8000 });
  });

  test("shows flight numbers on the results", async ({ page }) => {
    await expect(page.getByText("QQ101")).toBeVisible({ timeout: 8000 });
  });

  test("shows a 'Select' or 'Book' action on flight cards", async ({ page }) => {
    await expect(page.getByRole("button", { name: /select|book/i }).first()).toBeVisible({
      timeout: 8000,
    });
  });
});

// ── Payment page ───────────────────────────────────────────────────────────────

test.describe("Payment page", () => {
  test.beforeEach(async ({ page }) => {
    await mockPendingBooking(page);
    await page.goto(PAYMENT_URL);
    await page.waitForSelector('[data-testid="countdown"]', { timeout: 8000 });
  });

  test("shows the Secure Payment heading", async ({ page }) => {
    await expect(page.getByText("Secure Payment")).toBeVisible();
  });

  test("shows the 4-step progress stepper", async ({ page }) => {
    await expect(page.getByText("Flights")).toBeVisible();
    await expect(page.getByText("Seats")).toBeVisible();
    await expect(page.getByText("Extras")).toBeVisible();
    await expect(page.getByText("Payment", { exact: true })).toBeVisible();
  });

  test("shows the Booking Summary section with flight info", async ({ page }) => {
    await expect(page.getByText("Booking Summary")).toBeVisible();
    await expect(page.getByText(/QQ101.*BKK.*SIN/)).toBeVisible();
  });

  test("shows a countdown timer in MM:SS format", async ({ page }) => {
    await expect(page.getByTestId("countdown")).toHaveText(/^\d{2}:\d{2}$/);
  });

  test("shows all four payment method tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Card" })).toBeVisible();
    await expect(page.getByRole("button", { name: "PromptPay" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Bank" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Other" })).toBeVisible();
  });

  test("shows the card payment form by default", async ({ page }) => {
    await expect(page.getByPlaceholder("e.g. Johnathan Doe")).toBeVisible();
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).toBeVisible();
  });

  test("shows the total amount and Pay button", async ({ page }) => {
    await expect(page.getByText("Total Amount")).toBeVisible();
    await expect(page.getByRole("button", { name: /pay.*securely/i })).toBeVisible();
  });
});

// ── Booking confirmation page ──────────────────────────────────────────────────

test.describe("Booking confirmation page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONFIRMATION_URL);
    await page.waitForLoadState("networkidle");
  });

  test("shows a booking confirmed heading", async ({ page }) => {
    await expect(page.getByText(/booking confirmed|confirmed/i).first()).toBeVisible();
  });

  test("shows the booking reference", async ({ page }) => {
    await expect(page.getByText(BOOKING_REF)).toBeVisible();
  });

  test("shows the passenger name", async ({ page }) => {
    await expect(page.getByText(/John.*Doe/i)).toBeVisible();
  });

  test("shows the flight number in the booking details", async ({ page }) => {
    await expect(page.getByTestId("flight-number")).toHaveText("QQ101");
  });

  test("shows the route BKK → SIN in the booking details", async ({ page }) => {
    await expect(page.getByTestId("route")).toContainText("BKK");
    await expect(page.getByTestId("route")).toContainText("SIN");
  });

  test("shows the booking summary line with flight number and route", async ({ page }) => {
    await expect(page.getByTestId("flight-summary-line")).toContainText("QQ101");
    await expect(page.getByTestId("flight-summary-line")).toContainText("BKK");
    await expect(page.getByTestId("flight-summary-line")).toContainText("SIN");
  });

  test("shows a confirmation email notice", async ({ page }) => {
    await expect(page.getByText(/confirmation email has been sent/i)).toBeVisible();
  });
});
