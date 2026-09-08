import { test, expect, type Page } from "@playwright/test";

/**
 * docs/stories/demo-story.md §1 — E2E layer, both cases.
 *
 * Deliberately plain @playwright/test — no page objects, no route mocking.
 * Runs against the real stack (docker compose up) and its seeded data, so
 * each test.step reads as the Given/When/Then it's named after, with
 * nothing hidden behind a fixture. See ./README.md for how this tier
 * differs from ../uitests/ (the fast, mocked UI-tests loop) and how it
 * stays repeatable without a hardcoded date.
 */

/**
 * Runs the full search → book → pay flow for a fresh booking and returns
 * its PNR. Used only by test 2 below, so it can start from a genuinely
 * CONFIRMED booking instead of depending on a specific pre-seeded row
 * (e.g. SEED01) that could be mutated or aged out by another test run.
 * Not a page object — just enough to avoid repeating test 1's ~15 lines.
 */
async function payForNewBooking(page: Page): Promise<{ bookingRef: string }> {
  const departure = process.env.E2E_REAL_QM101_DEPARTURE;
  if (!departure) {
    throw new Error(
      "E2E_REAL_QM101_DEPARTURE is unset — global-setup.ts should have set it before any test ran.",
    );
  }

  await page.goto(
    `/flights/results?origin=BKK&destination=SIN&departure=${departure}&passengers=1&cabin=economy`,
  );
  await page
    .getByRole("button", { name: /select/i })
    .first()
    .click();

  const uniqueEmail = `jane.doe+${Date.now()}@test.com`;
  await page.getByPlaceholder("e.g. John").fill("Jane");
  await page.getByPlaceholder("e.g. Doe").fill("Doe");
  await page.getByPlaceholder("john.doe@example.com").fill(uniqueEmail);
  await page.getByPlaceholder("000 000 000").fill("0800000000");
  await page.getByRole("button", { name: /continue to payment/i }).click();

  await expect(page).toHaveURL(/\/payment\/?\?/);
  const bookingRef = new URL(page.url()).searchParams.get("ref") ?? "";
  expect(bookingRef).toMatch(/^[A-Z0-9]{6}$/);

  await page.getByPlaceholder("e.g. Johnathan Doe").fill("Jane Doe");
  await page.getByPlaceholder("0000 0000 0000 0000").fill("4242 4242 4242 4242");
  await page.getByPlaceholder("MM/YY").fill("12/29");
  await page.getByPlaceholder("•••").fill("123");
  await page.getByLabel(/agree to the terms/i).check();
  await page.getByRole("button", { name: /pay .* securely/i }).click();

  await expect(page).toHaveURL(/\/bookings\/confirmation/);
  return { bookingRef };
}

test("Given a searched flight and valid passenger details, When the passenger pays with a valid test card, Then they land on the confirmation page showing the same PNR the booking was created with", async ({
  page,
}) => {
  let bookingRef = "";

  await test.step("Given a passenger has searched and selected a flight", async () => {
    // BKK -> SIN on QM101 is real seeded data (infra/db/qoomlee/02_seed.sql,
    // flight id=11 among others) — not illustrative, it's what's actually
    // there. The date itself is discovered fresh in global-setup.ts rather
    // than hardcoded, since the seed computes it relative to whenever the
    // DB was last (re)initialized, not relative to "now".
    const departure = process.env.E2E_REAL_QM101_DEPARTURE;
    if (!departure) {
      throw new Error(
        "E2E_REAL_QM101_DEPARTURE is unset — global-setup.ts should have set it before any test ran.",
      );
    }
    await page.goto(
      `/flights/results?origin=BKK&destination=SIN&departure=${departure}&passengers=1&cabin=economy`,
    );
    await page
      .getByRole("button", { name: /select/i })
      .first()
      .click();
  });

  await test.step("And filled in valid passenger details", async () => {
    // Real /bookings/new form fields, matched by placeholder (no <label for>).
    await page.getByPlaceholder("e.g. John").fill("Jane");
    await page.getByPlaceholder("e.g. Doe").fill("Doe");
    await page.getByPlaceholder("john.doe@example.com").fill(`jane.doe+${Date.now()}@test.com`);
    await page.getByPlaceholder("000 000 000").fill("0800000000");
    await page.getByRole("button", { name: /continue to payment/i }).click();

    await expect(page).toHaveURL(/\/payment\/?\?/);
    bookingRef = new URL(page.url()).searchParams.get("ref") ?? "";
    expect(bookingRef).toMatch(/^[A-Z0-9]{6}$/);
  });

  await test.step("When they pay with a valid test card", async () => {
    await page.getByPlaceholder("e.g. Johnathan Doe").fill("Jane Doe");
    await page.getByPlaceholder("0000 0000 0000 0000").fill("4242 4242 4242 4242");
    await page.getByPlaceholder("MM/YY").fill("12/29");
    await page.getByPlaceholder("•••").fill("123");
    await page.getByLabel(/agree to the terms/i).check();
    await page.getByRole("button", { name: /pay .* securely/i }).click();
  });

  await test.step("Then they land on the confirmation page showing the same PNR", async () => {
    await expect(page).toHaveURL(/\/bookings\/confirmation/);
    await expect(page.getByText(bookingRef)).toBeVisible();
  });
});

test("Given a booking that's already CONFIRMED (e.g. back-button after paying), When the payment page loads, Then it redirects straight to the confirmation page — no card form, no second charge", async ({
  page,
}) => {
  let bookingRef = "";

  await test.step("Given a CONFIRMED booking", async () => {
    // A freshly created-and-paid booking, not a fixed seed ref (e.g.
    // SEED01) — a static ref can be mutated by another run/test against the
    // same real DB, or (like the flight date above) simply age out. Paying
    // for a new booking here proves the same thing the seed comment used to
    // assert, without depending on the seed staying in that exact state.
    ({ bookingRef } = await payForNewBooking(page));
  });

  await test.step("When the payment page loads for it again", async () => {
    await page.goto(`/payment?ref=${bookingRef}`);
  });

  await test.step("Then it redirects to confirmation, skipping the form", async () => {
    // Next.js appends a trailing slash before the query string on this route.
    await expect(page).toHaveURL(new RegExp(`/bookings/confirmation/?\\?ref=${bookingRef}`));
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).not.toBeVisible();
  });
});
