import { test, expect } from "./fixtures";
import { mockAllServices, DEFAULT_BOOKING_REF } from "./mocks";

/**
 * docs/stories/demo-story.md §1 — E2E layer.
 *
 * Case 1 (happy path: search → select → passenger details → pay →
 * confirmation) is already covered end-to-end by
 * traveller-searches-books-and-pays.spec.ts — not duplicated here.
 *
 * This file covers case 2: a booking that's already CONFIRMED (e.g. the
 * traveller hits back after paying, or re-opens a stale tab) must redirect
 * straight to the confirmation page — no card form, no second charge.
 */

test.describe("Payment page — already confirmed booking", () => {
  test("Given a booking that's already CONFIRMED (e.g. back-button after paying), When the payment page loads, Then it redirects straight to the confirmation page — no card form, no second charge", async ({
    page,
    paymentPage,
  }) => {
    await mockAllServices(page);

    // Override the booking GET route registered by mockAllServices — this
    // one specific booking reports CONFIRMED, not PENDING.
    await page.route(new RegExp(`/api/bookings/${DEFAULT_BOOKING_REF}$`), (route) => {
      if (route.request().method() === "GET") {
        void route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "CONFIRMED",
            totalAmountMinor: 931500,
          }),
        });
      } else {
        void route.fallback();
      }
    });

    await test.step("When the payment page loads for a CONFIRMED booking", async () => {
      await page.goto(`/payment?ref=${DEFAULT_BOOKING_REF}`);
    });

    await test.step("Then it redirects to confirmation, skipping the form", async () => {
      await expect(page).toHaveURL(
        new RegExp(`/bookings/confirmation/?\\?ref=${DEFAULT_BOOKING_REF}`),
      );
      await expect(paymentPage.cardNumber).not.toBeVisible();
    });
  });
});
