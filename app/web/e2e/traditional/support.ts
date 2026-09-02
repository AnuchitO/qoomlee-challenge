/**
 * Shared plumbing for app/web/e2e/traditional/** — see
 * docs/stories/demo-story-traditional.md for what this folder is and why it
 * exists (short version: it's the "before" suite for a test-pyramid
 * refactoring workshop — every case from docs/stories/demo-story.md forced
 * through Playwright, regardless of which layer it actually belongs at).
 *
 * Even a "traditional" suite needs some shared helpers to stay readable —
 * a real ice-cream-cone suite usually has none of this and copy-pastes the
 * route mocks into every spec file instead. Keep that in mind: this folder
 * is already a cleaner version of the anti-pattern than what you'll find in
 * the wild.
 */
import type { Page } from "@playwright/test";

export const PAYMENT_QUERY_DEFAULTS = {
  ref: "TRAD01",
  flightNumber: "QL204",
  origin: "BKK",
  destination: "HKT",
  departureTime: "2026-09-10T08:00:00Z",
  price: "150000", // basePriceMinor
  currency: "THB",
  passengers: "1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@test.com",
  phone: "0800000000",
};

export function paymentUrl(overrides: Partial<typeof PAYMENT_QUERY_DEFAULTS> = {}): string {
  const params = new URLSearchParams({ ...PAYMENT_QUERY_DEFAULTS, ...overrides });
  return `/payment?${params.toString()}`;
}

export const VALID_CARD = {
  name: "Jane Doe",
  number: "4242 4242 4242 4242",
  expiry: "12/29",
  cvv: "123",
};

export const genericFailureText = "We couldn't process your payment. Please try again.";
export const expiredHeadingText = "Your booking hold has expired";

/** Mocks GET /api/bookings/:ref — the fetch that gates the whole page. */
export async function mockBookingGet(
  page: Page,
  body: Record<string, unknown>,
  opts: { status?: number } = {},
) {
  await page.route(/\/api\/bookings\/[^/?]+$/, (route) => {
    if (route.request().method() !== "GET") return route.continue();
    void route.fulfill({
      status: opts.status ?? 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

/** Mocks POST /api/payments/charge with a fixed response. */
export async function mockChargeResponse(page: Page, opts: { status: number; body?: unknown }) {
  await page.route("**/api/payments/charge", (route) => {
    void route.fulfill({
      status: opts.status,
      contentType: "application/json",
      body: JSON.stringify(opts.body ?? {}),
    });
  });
}

export async function mockChargeSuccess(page: Page) {
  await mockChargeResponse(page, { status: 201, body: { paymentId: 1, status: "succeeded" } });
}

/**
 * Mocks a successful charge AND records whether it was actually called —
 * the browser-reachable stand-in for `expect(postJson).not.toHaveBeenCalled()` /
 * `.toHaveBeenCalled()` in the pyramid version's hook tests.
 */
export async function mockChargeTracked(page: Page) {
  let called = false;
  await page.route("**/api/payments/charge", (route) => {
    called = true;
    void route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ paymentId: 1, status: "succeeded" }),
    });
  });
  return { wasCalled: () => called };
}

/** Mocks a PENDING/ready booking and navigates straight to the payment page. */
export async function gotoReadyPayment(
  page: Page,
  bookingOverrides: { expiresAt?: string; totalAmountMinor?: number } = {},
  urlOverrides: Partial<typeof PAYMENT_QUERY_DEFAULTS> = {},
) {
  const expiresAt =
    bookingOverrides.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await mockBookingGet(page, {
    status: "PENDING",
    expiresAt,
    totalAmountMinor: bookingOverrides.totalAmountMinor ?? 231500,
  });
  await page.goto(paymentUrl(urlOverrides));
  await page.getByTestId("countdown").waitFor({ state: "visible", timeout: 10000 });
}

export async function fillValidCard(page: Page, card = VALID_CARD) {
  await page.getByPlaceholder("e.g. Johnathan Doe").fill(card.name);
  await page.getByPlaceholder("0000 0000 0000 0000").fill(card.number);
  await page.getByPlaceholder("MM/YY").fill(card.expiry);
  await page.getByPlaceholder("•••").fill(card.cvv);
}

export async function agreeToTerms(page: Page) {
  await page.getByRole("checkbox", { name: /i agree/i }).check();
}

export function payButton(page: Page) {
  return page.getByRole("button", { name: /pay .* securely/i });
}
