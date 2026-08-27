import { test, expect } from "./fixtures";
import { mockCreateBooking } from "./mocks";
import { UUID_RE } from "./pages/booking.page";

const DEFAULT_PASSENGER = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "0812345678",
};

test.describe("Booking token deduplication (QML-048)", () => {
  test("injects a UUID bookingToken into the URL on first load", async ({ bookingPage }) => {
    await bookingPage.goto();
    await bookingPage.waitForToken();

    expect(bookingPage.getTokenFromUrl()).toMatch(UUID_RE);
  });

  test("generates a fresh bookingToken for each new booking session", async ({
    page,
    bookingPage,
  }) => {
    await bookingPage.goto();
    await bookingPage.waitForToken();
    const token1 = bookingPage.getTokenFromUrl();

    await page.goto("/flights");

    await bookingPage.goto();
    await bookingPage.waitForToken();
    const token2 = bookingPage.getTokenFromUrl();

    expect(token1).toMatch(UUID_RE);
    expect(token2).toMatch(UUID_RE);
    expect(token1).not.toBe(token2);
  });

  test("bookingToken in URL is unchanged after navigating back from payment", async ({
    page,
    bookingPage,
    paymentPage,
  }) => {
    await mockCreateBooking(page);
    await bookingPage.goto();
    await bookingPage.waitForToken();

    const tokenBeforeSubmit = bookingPage.getTokenFromUrl();
    expect(tokenBeforeSubmit).toMatch(UUID_RE);

    await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);
    await paymentPage.expectOnPaymentPage();

    await page.goBack();
    await bookingPage.waitForToken();

    expect(bookingPage.getTokenFromUrl()).toBe(tokenBeforeSubmit);
  });

  test("sends the same bookingToken on both API calls when user goes back and continues again", async ({
    page,
    bookingPage,
    paymentPage,
  }) => {
    const capturedTokens: string[] = [];

    await page.route("**/api/bookings*", (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const url = new URL(route.request().url());
      capturedTokens.push(url.searchParams.get("bookingToken") ?? "");
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

    await bookingPage.goto();
    await bookingPage.waitForToken();
    await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);
    await paymentPage.expectOnPaymentPage();

    await page.goBack();
    await bookingPage.waitForToken();
    await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);
    await paymentPage.expectOnPaymentPage();

    expect(capturedTokens).toHaveLength(2);
    expect(capturedTokens[0]).toMatch(UUID_RE);
    expect(capturedTokens[0]).toBe(capturedTokens[1]);
  });

  test("does not navigate to payment when API call is still in flight (button disabled while submitting)", async ({
    page,
    bookingPage,
  }) => {
    let resolveRequest!: () => void;
    const requestPending = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    await page.route("**/api/bookings*", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      resolveRequest();
      await new Promise((r) => setTimeout(r, 2000));
      void route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ bookingId: 1, bookingRef: "QM7X2K" }),
      });
    });

    await bookingPage.goto();
    await bookingPage.waitForToken();
    await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);

    await requestPending;

    await expect(bookingPage.continueButton).toBeDisabled();
    await bookingPage.expectOnBookingPage();
  });
});
