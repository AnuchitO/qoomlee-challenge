import { test, expect } from "./fixtures";
import { mockCreateBooking } from "./mocks";
import { UUID_RE, DEFAULT_PASSENGER } from "./helpers/test-data";

test.describe("Booking token deduplication (QML-048)", () => {
  test("Given a passenger opens the booking page, When it loads, Then the URL carries a fresh UUID bookingToken", async ({
    bookingPage,
  }) => {
    await test.step("When the booking page loads", async () => {
      await bookingPage.goto();
      await bookingPage.waitForToken();
    });

    await test.step("Then the URL carries a UUID bookingToken", async () => {
      expect(bookingPage.getTokenFromUrl()).toMatch(UUID_RE);
    });
  });

  test("Given a passenger already has a booking session, When they start a new one, Then a different bookingToken is issued", async ({
    page,
    bookingPage,
  }) => {
    let tokenFromFirstSession: string | null = null;

    await test.step("Given a first booking session has a token", async () => {
      await bookingPage.goto();
      await bookingPage.waitForToken();
      tokenFromFirstSession = bookingPage.getTokenFromUrl();
      expect(tokenFromFirstSession).toMatch(UUID_RE);
    });

    await test.step("When the passenger starts a new booking session", async () => {
      await page.goto("/flights");
      await bookingPage.goto();
      await bookingPage.waitForToken();
    });

    await test.step("Then the new session gets a different bookingToken", async () => {
      const tokenFromSecondSession = bookingPage.getTokenFromUrl();
      expect(tokenFromSecondSession).toMatch(UUID_RE);
      expect(tokenFromSecondSession).not.toBe(tokenFromFirstSession);
    });
  });

  test("Given a passenger submitted the booking form, When they navigate back from payment, Then the bookingToken in the URL is unchanged", async ({
    page,
    bookingPage,
  }) => {
    let tokenBeforeSubmit: string | null = null;

    await test.step("Given the booking API is mocked and a bookingToken was issued", async () => {
      await mockCreateBooking(page);
      await bookingPage.goto();
      await bookingPage.waitForToken();
      tokenBeforeSubmit = bookingPage.getTokenFromUrl();
      expect(tokenBeforeSubmit).toMatch(UUID_RE);
    });

    await test.step("When the passenger submits and then navigates back from payment", async () => {
      await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);
      await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });
      await page.goBack();
      await bookingPage.waitForToken();
    });

    await test.step("Then the bookingToken in the URL is unchanged", async () => {
      expect(bookingPage.getTokenFromUrl()).toBe(tokenBeforeSubmit);
    });
  });

  test("Given a passenger goes back and resubmits the booking form, When both submissions reach the API, Then they carry the same bookingToken", async ({
    page,
    bookingPage,
  }) => {
    const capturedTokens: string[] = [];

    await test.step("Given the booking API is mocked to capture the bookingToken it receives", async () => {
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
    });

    await test.step("When the passenger submits, goes back, and submits again", async () => {
      await bookingPage.goto();
      await bookingPage.waitForToken();
      await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);
      await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });

      await page.goBack();
      await bookingPage.waitForToken();
      await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);
      await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });
    });

    await test.step("Then both API calls carry the same bookingToken", async () => {
      expect(capturedTokens).toHaveLength(2);
      expect(capturedTokens[0]).toMatch(UUID_RE);
      expect(capturedTokens[0]).toBe(capturedTokens[1]);
    });
  });

  test("Given the booking API call is still in flight, When the passenger has just submitted, Then the continue button stays disabled and the page stays on booking", async ({
    page,
    bookingPage,
  }) => {
    let resolveRequest!: () => void;
    const requestPending = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    await test.step("Given the booking API is mocked to stay pending", async () => {
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
    });

    await test.step("When the passenger submits the booking form", async () => {
      await bookingPage.goto();
      await bookingPage.waitForToken();
      await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);
      await requestPending;
    });

    await test.step("Then the continue button is disabled and the page stays on booking", async () => {
      await expect(bookingPage.continueButton).toBeDisabled();
      await expect(page).toHaveURL(/\/bookings\/new/);
    });
  });
});
