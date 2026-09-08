import type { Page } from "@playwright/test";
import { DEFAULT_FLIGHT } from "./helpers/test-data";

export { DEFAULT_FLIGHT };

export const DEFAULT_BOOKING_REF = "TB7X2K";

function bookingResponse(overrides?: { bookingRef?: string }) {
  return {
    bookingRef: overrides?.bookingRef ?? DEFAULT_BOOKING_REF,
  };
}

export async function mockFlightSearch(page: Page, flights = [DEFAULT_FLIGHT]) {
  await page.route("**/api/flights/search*", (route) => {
    void route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(flights),
    });
  });
}

export async function mockCreateBooking(
  page: Page,
  overrides?: { bookingRef?: string; expiresAt?: string },
) {
  const expiresAt = overrides?.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await page.route(/\/api\/bookings/, (route) => {
    if (route.request().method() === "POST") {
      void route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          bookingId: 1,
          ...bookingResponse(overrides),
          expiresAt,
        }),
      });
    } else {
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "PENDING",
          expiresAt,
          // DEFAULT_FLIGHT.basePriceMinor (810000) + 15% tax, rounded.
          totalAmountMinor: Math.round(DEFAULT_FLIGHT.basePriceMinor * 1.15),
        }),
      });
    }
  });
}

export async function mockPayment(page: Page) {
  await page.route("**/api/payments/charge", (route) => {
    void route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ paymentId: 1, status: "succeeded" }),
    });
  });
}

export async function mockAllServices(page: Page, overrides?: { bookingRef?: string }) {
  await mockFlightSearch(page);
  await mockCreateBooking(page, overrides);
  await mockPayment(page);
}
