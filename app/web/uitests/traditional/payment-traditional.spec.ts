import { test, expect } from "../fixtures";
import { mockAllServices, DEFAULT_BOOKING_REF } from "../mocks";
import {
  gotoReadyPayment,
  fillValidCard,
  agreeToTerms,
  payButton,
  mockChargeTracked,
  mockChargeResponse,
  mockBookingGet,
  paymentUrl,
  VALID_CARD,
  genericFailureText,
  expiredHeadingText,
} from "./support";

/**
 * All 36 cases from docs/stories/demo-story.md, forced through one tool:
 * Playwright, driving the real page. See
 * docs/stories/demo-story-traditional.md for what this file is, why it
 * exists, and what each section below costs compared to the pyramid
 * version. One file (plus ./support.ts's shared plumbing) instead of five —
 * merged so the whole "traditional" suite reads top to bottom in one place,
 * the way a single overgrown E2E spec file usually does in the wild.
 */

// ─────────────────────────────────────────────────────────────────────────
// §1 — E2E cases (demo-story.md §1, 2 of 2) — no change
//
// These two were already end-to-end in the pyramid version. "Traditional"
// thinking doesn't touch them — they're reproduced here only so this file
// is a complete, self-contained count of "every case as Playwright".
// ─────────────────────────────────────────────────────────────────────────
test.describe("Payment — E2E cases (identical to the pyramid version)", () => {
  test("Given a searched flight and valid passenger details, When the passenger pays with a valid test card, Then they land on the confirmation page showing the same PNR the booking was created with", async ({
    page,
    flightResultsPage,
    bookingPage,
    paymentPage,
    confirmationPage,
  }) => {
    await mockAllServices(page);

    await flightResultsPage.goto({ origin: "BKK", destination: "SIN", departure: "2026-10-24" });
    await expect(flightResultsPage.flightNumber("QQ101")).toBeVisible({ timeout: 5000 });
    await expect(flightResultsPage.route("BKK", "SIN")).toBeVisible();

    await flightResultsPage.selectFlight();
    await expect(page).toHaveURL(/\/bookings\/new/);
    await expect(bookingPage.flightNumber("QQ101")).toBeVisible();

    await bookingPage.fillAndSubmit({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@test.com",
      phone: "0800000000",
    });
    await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });
    await expect(page).toHaveURL(new RegExp(`ref=${DEFAULT_BOOKING_REF}`));

    await paymentPage.fillAndPay({
      name: "Jane Doe",
      number: "4242424242424242",
      expiry: "1229",
      cvv: "123",
    });

    await confirmationPage.waitForConfirmationPage();
    await expect(page).toHaveURL(new RegExp(`ref=${DEFAULT_BOOKING_REF}`));
    await expect(confirmationPage.heading).toBeVisible();
    await expect(confirmationPage.bookingRef(DEFAULT_BOOKING_REF)).toBeVisible();
    await expect(confirmationPage.passengerName("jane")).toBeVisible();
  });

  test("Given a booking that's already CONFIRMED (e.g. back-button after paying), When the payment page loads, Then it redirects straight to the confirmation page — no card form, no second charge", async ({
    page,
  }) => {
    // SEED01-shaped: a booking that's already CONFIRMED when the page asks.
    await page.route(/\/api\/bookings\/SEED01$/, (route) => {
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
    });

    await page.goto("/payment?ref=SEED01");

    // Note the trailing "/?": Next.js's router normalizes the confirmation
    // route to /bookings/confirmation/ before appending the query string.
    await expect(page).toHaveURL(/\/bookings\/confirmation\/?\?ref=SEED01/);
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// §2 — Component-layer cases (demo-story.md §2, 12 of 12), forced through
// the browser instead of `renderHook` / a direct `render()`.
//
// Cases 1–6 are pure field-validation branches inside `usePaymentClient` —
// the pyramid version tests them with a hook harness and no network, no
// router, no browser at all. Here each one pays for a full page load plus
// a mocked booking-fetch to exercise the exact same guard clause.
// ─────────────────────────────────────────────────────────────────────────
test.describe("Payment — Component-layer cases, forced through the browser", () => {
  test('Empty card name, errors.cardName === "Required", submit blocked', async ({ page }) => {
    const charge = await mockChargeTracked(page);
    await gotoReadyPayment(page);
    await fillValidCard(page, { ...VALID_CARD, name: "" });
    await agreeToTerms(page);
    await payButton(page).click();

    await expect(page.getByText("Required", { exact: true })).toBeVisible();
    expect(charge.wasCalled()).toBe(false);
  });

  test("Card number ≠16 digits, error shown, blocked", async ({ page }) => {
    const charge = await mockChargeTracked(page);
    await gotoReadyPayment(page);
    await fillValidCard(page, { ...VALID_CARD, number: "4242 4242" });
    await agreeToTerms(page);
    await payButton(page).click();

    await expect(page.getByText("Enter a valid 16-digit card number")).toBeVisible();
    expect(charge.wasCalled()).toBe(false);
  });

  test("Expiry not MM/YY, error shown, blocked", async ({ page }) => {
    const charge = await mockChargeTracked(page);
    await gotoReadyPayment(page);
    // "12" alone never gains the "/" — formatExpiry only inserts it past 2 digits.
    await fillValidCard(page, { ...VALID_CARD, expiry: "12" });
    await agreeToTerms(page);
    await payButton(page).click();

    await expect(page.getByText("Use MM/YY format")).toBeVisible();
    expect(charge.wasCalled()).toBe(false);
  });

  test("CVV not 3–4 digits, error shown, blocked", async ({ page }) => {
    const charge = await mockChargeTracked(page);
    await gotoReadyPayment(page);
    await fillValidCard(page, { ...VALID_CARD, cvv: "12" });
    await agreeToTerms(page);
    await payButton(page).click();

    await expect(page.getByText("3 or 4 digits required")).toBeVisible();
    expect(charge.wasCalled()).toBe(false);
  });

  test('Terms checkbox unchecked, "You must agree to the terms...", blocked', async ({ page }) => {
    const charge = await mockChargeTracked(page);
    await gotoReadyPayment(page);
    await fillValidCard(page);
    // deliberately not checking the terms checkbox

    await payButton(page).click();

    await expect(page.getByText("You must agree to the terms to proceed")).toBeVisible();
    expect(charge.wasCalled()).toBe(false);
  });

  test("All fields valid, no errors, postJson is called", async ({ page }) => {
    const charge = await mockChargeTracked(page);
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await payButton(page).click();

    await expect(page).toHaveURL(/\/bookings\/confirmation/);
    expect(charge.wasCalled()).toBe(true);
  });

  test("Booking fetch returns EXPIRED, expired panel rendered, card form hidden", async ({
    page,
  }) => {
    await mockBookingGet(page, { status: "EXPIRED" });
    await page.goto(paymentUrl());

    await expect(page.getByText(expiredHeadingText)).toBeVisible();
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).not.toBeVisible();
  });

  test("Booking fetch returns CONFIRMED, router.replace to confirmation, no form render", async ({
    page,
  }) => {
    await mockBookingGet(page, { status: "CONFIRMED" });
    await page.goto(paymentUrl());

    await expect(page).toHaveURL(/\/bookings\/confirmation\/?\?ref=TRAD01/);
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).not.toBeVisible();
  });

  test("Booking fetch 404s, router.replace('/bookings/new')", async ({ page }) => {
    await mockBookingGet(page, { error: "not_found" }, { status: 404 });
    await page.goto(paymentUrl());

    await expect(page).toHaveURL(/\/bookings\/new/);
  });

  test("Charge response 409 booking_expired, switches to the expired panel, not a generic error", async ({
    page,
  }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 409, body: { error: "booking_expired" } });
    await payButton(page).click();

    await expect(page.getByText(expiredHeadingText)).toBeVisible();
    await expect(page.getByText(genericFailureText)).not.toBeVisible();
  });

  test('Charge response, other failure, "We couldn\'t process your payment" shown, submitting resets, form stays usable', async ({
    page,
  }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 402, body: { error: "card_declined" } });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
    await expect(payButton(page)).toBeEnabled(); // "submitting resets"
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).toHaveValue(VALID_CARD.number); // "form stays usable"
  });

  test('Promo code: valid, discount reflected in total; invalid, "Invalid promo code" shown, total unchanged', async ({
    page,
  }) => {
    await gotoReadyPayment(page);

    const promoInput = page.getByPlaceholder("Promo code");
    const applyButton = page.getByRole("button", { name: "Apply" });
    // The total is rendered in two places (a summary line AND the pay
    // button's own label), so a plain getByText(amount) is ambiguous —
    // scope to the summary row specifically.
    const totalAmount = page.locator("span.text-headline-md.text-primary").first();

    await promoInput.fill("nope");
    await applyButton.click();
    await expect(page.getByText("Invalid promo code")).toBeVisible();
    await expect(totalAmount).toHaveText(/2,?315\.00/); // total unchanged

    await promoInput.fill("QOOMFIRST");
    await applyButton.click();
    await expect(page.getByText("Invalid promo code")).not.toBeVisible();
    await expect(totalAmount).toHaveText(/1,?815\.00/); // 2,315.00 - 500.00 discount
  });
});

// ─────────────────────────────────────────────────────────────────────────
// §3 — Contract-layer cases (demo-story.md §3, 4 of 4 new cases), forced
// through the browser.
//
// These exist, in the pyramid version, as Robot Framework tests that call
// payment-service AND qoomlee-service's real HTTP APIs directly and compare
// what each one says — proving the two services agree with each other.
//
// A Playwright test only has one browser tab talking to whatever the mocked
// network layer hands back. It cannot open a second, independent connection
// to qoomlee-service and compare its answer to payment-service's. So
// "traditional" thinking's only way to attempt these cases is to mock BOTH
// endpoints to agree with each other by construction, then assert the mocks
// agree. That proves the mocks are internally consistent — nothing about
// whether the real services are. That's the tell this content belongs in a
// contract test, not here.
// ─────────────────────────────────────────────────────────────────────────
test.describe("Payment — Contract-layer cases, forced through the browser", () => {
  test("Charge on a booking qoomlee-service reports EXPIRED, payment-service returns 409 booking_expired, and qoomlee-service still shows EXPIRED afterwards", async ({
    page,
  }) => {
    // Booking GET says PENDING when the page loads...
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    // ...but by the time Pay is pressed, the booking has expired server-side.
    await mockChargeResponse(page, { status: 409, body: { error: "booking_expired" } });
    await payButton(page).click();

    await expect(page.getByText(expiredHeadingText)).toBeVisible();

    // "qoomlee-service still shows EXPIRED afterwards" — the closest a
    // browser test can get is re-mocking the booking GET and reloading.
    // This does NOT read qoomlee-service's real state; it reads our own
    // fixture back to ourselves.
    await mockBookingGet(page, { status: "EXPIRED" });
    await page.reload();
    await expect(page.getByText(expiredHeadingText)).toBeVisible();
  });

  test("Charge on a booking already CONFIRMED, 409 already_paid", async ({ page }) => {
    // The booking GET the page used to render is stale (still PENDING) —
    // otherwise the app would have redirected straight to confirmation
    // before the card form ever appeared (see the CONFIRMED case in §2
    // above). That redirect is the ONLY way the real frontend distinguishes
    // "already confirmed" — there's no other UI path into this state.
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 409, body: { error: "already_paid" } });
    await payButton(page).click();

    // The frontend only special-cases 409 booking_expired — every other 409
    // (this one included) falls through to the same generic banner as a
    // declined card. From the browser, "already paid" and "card declined"
    // are the exact same test.
    await expect(page.getByText(genericFailureText)).toBeVisible();
  });

  test("Second charge on a booking with an existing SUCCEEDED payment, 409 already_paid (guards QML-008 across the service boundary, not just in-process)", async ({
    page,
  }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 409, body: { error: "already_paid" } });
    await payButton(page).click();

    // Identical assertion to the case above — a second charge on an
    // already-SUCCEEDED payment and a charge on an already-CONFIRMED
    // booking produce the same 409 already_paid, and the UI renders it
    // identically either way. Two "cases", one test.
    await expect(page.getByText(genericFailureText)).toBeVisible();
  });

  test("Charge with amountMinor/currency not matching the booking's real total on qoomlee-service, rejected", async ({
    page,
  }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 422, body: { error: "amount_mismatch" } });
    await payButton(page).click();

    // Same generic banner again. A real amount-tampering attempt (the thing
    // this case exists to guard against) is visually indistinguishable,
    // from the browser, from a card being declined for insufficient funds.
    await expect(page.getByText(genericFailureText)).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// §4a — Go unit-layer cases (demo-story.md §4a, 11 of 11), forced through
// the browser instead of services/payment/payment/service_test.go's plain
// Go table tests (stubbed collaborators, no HTTP, no browser, sub-
// millisecond each).
//
// The browser can only ever see the HTTP response payment-service sends
// back — it has no way to assert "the gateway was never called", "the row
// was inserted as FAILED", or "ConfirmBooking was called with this exact
// PaymentID". Every one of those assertions is simply dropped below (noted
// per test). What's left, for several cases, is the identical 500 (or the
// identical generic banner) as every other case — noted where it happens.
// ─────────────────────────────────────────────────────────────────────────
test.describe("Payment — Go-service-logic cases, forced through the browser", () => {
  test("Existing SUCCEEDED payment for the booking, ErrAlreadyPaid, gateway never called", async ({
    page,
  }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 409, body: { error: "already_paid" } });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
    // Dropped: "the gateway (Omise) was never called" — unobservable from
    // the browser, which only ever sees payment-service's own response.
  });

  test("repo.GetByBookingRef returns a non-ErrNotFound error, propagated, gateway never called", async ({
    page,
  }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 500, body: { error: "internal" } });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
  });

  test("bookingClient.GetBooking errors, propagated", async ({ page }) => {
    // A DB/RPC error talking to qoomlee-service (500) and a booking that
    // genuinely doesn't exist (404 — see the "404s" case in §2 above) are
    // both just "!result.ok" to the frontend: same redirect either way. A
    // real bug talking to the booking service becomes invisible at this
    // layer.
    await mockBookingGet(page, { error: "internal" }, { status: 500 });
    await page.goto(paymentUrl());

    await expect(page).toHaveURL(/\/bookings\/new/);
  });

  test('booking.Status == "EXPIRED", ErrBookingExpired, gateway never called', async ({ page }) => {
    // Same branch, same fetch, same assertion as the "Booking fetch returns
    // EXPIRED" case in §2 above — Charge()'s own EXPIRED guard is
    // unreachable via the browser except through the exact page-load path
    // that case already exercises. Kept here only so this section's case
    // count matches the Go table 1:1.
    await mockBookingGet(page, { status: "EXPIRED" });
    await page.goto(paymentUrl());

    await expect(page.getByText(expiredHeadingText)).toBeVisible();
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).not.toBeVisible();
  });

  test('booking.Status == "CONFIRMED", ErrAlreadyPaid, gateway never called', async ({ page }) => {
    // Same stale-client shape as the "already CONFIRMED" case in §3 above —
    // necessarily, since it's the same Go guard clause guarding both.
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 409, body: { error: "already_paid" } });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
  });

  test("req.AmountMinor/Currency mismatch vs. the booking's real total, ErrAmountMismatch, gateway never called", async ({
    page,
  }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 422, body: { error: "amount_mismatch" } });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
  });

  test("omise.CreateCharge errors, propagated, nothing inserted", async ({ page }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 502, body: { error: "gateway_unavailable" } });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
    // Dropped: "nothing inserted" — there is no browser-observable database.
  });

  test('Gateway declines (status: "failed"), row inserted as FAILED with the failure code/message, returns *FailedError, ConfirmBooking not called', async ({
    page,
  }) => {
    // Identical to the "Charge response, other failure" case in §2 above —
    // a declined card is a declined card, whatever Go type carries the
    // reason.
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, {
      status: 402,
      body: { error: "card_declined", message: "The card has insufficient funds." },
    });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
    await expect(payButton(page)).toBeEnabled();
    // Dropped: "row inserted as FAILED", "ConfirmBooking not called".
  });

  test("Gateway succeeds, row inserted SUCCEEDED with PaidAt set, ConfirmBooking called with the inserted PaymentID/provider/chargeID", async ({
    page,
  }) => {
    const charge = await mockChargeTracked(page);
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await payButton(page).click();

    await expect(page).toHaveURL(/\/bookings\/confirmation/);
    expect(charge.wasCalled()).toBe(true);
    // Dropped: PaidAt, and the exact PaymentID/provider/chargeID
    // ConfirmBooking was called with — not visible from the browser.
  });

  test("repo.Insert errors on the success path, propagated", async ({ page }) => {
    // Indistinguishable, at this layer, from the two other 500s above
    // ("repo.GetByBookingRef errors" and "omise.CreateCharge errors") — all
    // three are just "charge POST came back 500" to the browser.
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 500, body: { error: "internal" } });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
  });

  test("bookingClient.ConfirmBooking errors after a successful charge, propagated, and flagged — money was already captured with no compensation path", async ({
    page,
  }) => {
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await mockChargeResponse(page, { status: 500, body: { error: "confirm_failed" } });
    await payButton(page).click();

    await expect(page.getByText(genericFailureText)).toBeVisible();
    // This is the dangerous one: from here, the customer sees the exact
    // same "please try again" banner as a plain decline — nothing
    // distinguishes "your card was never charged, retry freely" from "your
    // card WAS charged, retrying may double-charge you". Reproducing the
    // confusing UX is the only thing E2E can do here; proving whether a
    // double charge actually happened needs the Go test (or a real
    // reconciliation check), not this layer.
  });
});

// ─────────────────────────────────────────────────────────────────────────
// §4b — TS pure-function unit-layer cases (demo-story.md §4b, 7 of 7),
// forced through the browser instead of calling
// formatCountdown/formatDeparture/formatCardNumber/... directly.
//
// None of these functions are exported for a test to import and call in
// this world — "traditional" thinking's only lever is to type into a field
// (or wait for a render) and read the formatted result back off the DOM.
// Case 1 needs Playwright's clock-mocking API just to pin down what a
// one-line, already-deterministic function returns — that's a lot of
// machinery for a pure function. Case 5 is worse: it silently passes for
// the wrong reason (see the comment there).
// ─────────────────────────────────────────────────────────────────────────
test.describe("Payment — TS-pure-function cases, forced through the browser", () => {
  test('formatCountdown(65) → "01:05" (zero-padded minutes and seconds)', async ({ page }) => {
    // Freeze the clock so page-load latency can't eat into the 65 seconds
    // before we get to read the countdown back — otherwise this is flaky
    // by construction. A unit test needs none of this.
    //
    // Note install({ time }) alone is NOT enough: it only seeds the start
    // time, the clock still ticks at real wall-clock speed after that — the
    // countdown will happily decrement while the dev server compiles the
    // page. pauseAt() is what actually freezes it. Found by running this
    // test enough times to catch it flake; see the note in
    // docs/stories/demo-story-traditional.md.
    const fixedNow = new Date("2026-09-10T07:00:00.000Z").getTime();
    await page.clock.pauseAt(fixedNow);

    await mockBookingGet(page, {
      status: "PENDING",
      expiresAt: new Date(fixedNow + 65_000).toISOString(),
      totalAmountMinor: 231500,
    });
    await page.goto(paymentUrl());

    await expect(page.getByTestId("countdown")).toHaveText("01:05");
  });

  test("formatDeparture renders the correct weekday/day/month across a UTC midnight boundary", async ({
    page,
  }) => {
    await gotoReadyPayment(page, {}, { departureTime: "2026-01-01T00:30:00Z" });

    // 2026-01-01T00:30:00Z: local midnight-adjacent time in most western
    // timezones would roll back to 2025-12-31 if this accidentally used
    // local time instead of UTC.
    await expect(page.getByText("Thu 1 Jan")).toBeVisible();
  });

  test("formatCardNumber strips non-digits, groups by 4, truncates at 16", async ({ page }) => {
    await gotoReadyPayment(page);
    const cardNumber = page.getByPlaceholder("0000 0000 0000 0000");

    // Note: docs/stories/demo-story.md's own illustrative Vitest example
    // uses raw = "4242-4242 4242424299999" and asserts "4242 4242 4242
    // 4299" — but that example was never executed, and running the real
    // function against that exact input actually yields
    // "4242 4242 4242 4242" (the "9999" only shows up after the 16-digit
    // cut, so it's dropped by truncation, not kept). This is exactly the
    // gap the workshop is about: an illustrative code block can carry a
    // wrong expectation indefinitely because nothing ever runs it. Digits
    // chosen below to make the truncation itself unambiguous instead.
    await cardNumber.fill("4242-4242 5555666677778888");

    await expect(cardNumber).toHaveValue("4242 4242 5555 6666");
  });

  test("formatExpiry turns raw digits into MM/YY, truncates at 4 digits", async ({ page }) => {
    await gotoReadyPayment(page);
    const expiry = page.getByPlaceholder("MM/YY");

    await expiry.fill("122999");

    await expect(expiry).toHaveValue("12/29");
  });

  test("formatCvv strips non-digits, truncates at 4", async ({ page }) => {
    await gotoReadyPayment(page);
    const cvv = page.getByPlaceholder("•••");

    // pressSequentially (real keystrokes), not .fill() — the CVV input also
    // carries a native maxLength={4}, which caps how many raw characters
    // the DOM will ever hold. This particular string happens to land on
    // "1234" the same way formatCvv's own truncate-at-4 would — but that's
    // luck, not proof: the native attribute is doing most of the work here,
    // not the function under test. A different 9-character mix of letters
    // and digits can pass or fail for the wrong reason. The unit test has
    // no such ambiguity — it calls formatCvv("1a2b3c4d5") once, directly.
    await cvv.pressSequentially("1a2b3c4d5");

    await expect(cvv).toHaveValue("1234");
  });

  test("validateCardFields flags a card number that isn't exactly 16 digits", async ({ page }) => {
    // Duplicate coverage of the "Card number ≠16 digits" case in §2 above —
    // same guard clause, same assertion, filed under a different name
    // because the pyramid version files it under two different test suites
    // (a hook test AND a formatting-helper test import the same validator
    // from two angles).
    await gotoReadyPayment(page);
    await fillValidCard(page, { ...VALID_CARD, number: "4242 4242" });
    await agreeToTerms(page);
    await payButton(page).click();

    await expect(page.getByText("Enter a valid 16-digit card number")).toBeVisible();
  });

  test("validateCardFields returns {} when every field is valid", async ({ page }) => {
    const charge = await mockChargeTracked(page);
    await gotoReadyPayment(page);
    await fillValidCard(page);
    await agreeToTerms(page);
    await payButton(page).click();

    await expect(page).toHaveURL(/\/bookings\/confirmation/);
    expect(charge.wasCalled()).toBe(true);
  });

  test.skip("Pricing (baseFareMinor/taxMinor/totalMinor) — deferred, see demo-story.md §4b case 7", async () => {
    // Intentionally left unimplemented — nothing changes about the
    // pyramid version's reasoning just because we're pretending
    // everything is E2E: pricing still isn't an exported pure function
    // today (it's inline inside usePaymentClient), so there's nothing
    // here to call, unit-style or otherwise. A real rounding edge case
    // (odd cents on taxMinor's 15% calculation) belongs here once
    // `computeTotal({ basePriceMinor, passengers, promoApplied })` exists
    // — not folded into a UI assertion as a workaround.
  });
});
