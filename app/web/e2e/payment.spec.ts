import { test, expect } from "@playwright/test";

/**
 * docs/stories/demo-story.md §1 — E2E layer, both cases.
 *
 * Deliberately plain @playwright/test — no page objects, no route mocking.
 * Runs against the real stack (docker compose up) and its seeded data, so
 * each test.step reads as the Given/When/Then it's named after, with
 * nothing hidden behind a fixture.
 */

test("Given a searched flight and valid passenger details, When the passenger pays with a valid test card, Then they land on the confirmation page showing the same PNR the booking was created with", async ({
  page,
}) => {
  let bookingRef = "";

  await test.step("Given a passenger has searched and selected a flight", async () => {
    // BKK -> SIN on this exact date is real seeded data (infra/db/qoomlee/02_seed.sql,
    // flight id=11/QM101 among others) — not illustrative, it's what's actually there.
    await page.goto(
      "/flights/results?origin=BKK&destination=SIN&departure=2026-09-15&passengers=1&cabin=economy",
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
    await page.getByPlaceholder("john.doe@example.com").fill("jane.doe@test.com");
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
  await test.step("Given a CONFIRMED booking (SEED01)", async () => {
    // seeded by infra/db/qoomlee/02_seed.sql — status CONFIRMED
  });

  await test.step("When the payment page loads for it", async () => {
    await page.goto("/payment?ref=SEED01");
  });

  await test.step("Then it redirects to confirmation, skipping the form", async () => {
    // Next.js appends a trailing slash before the query string on this route.
    await expect(page).toHaveURL(/\/bookings\/confirmation\/?\?ref=SEED01/);
    await expect(page.getByPlaceholder("0000 0000 0000 0000")).not.toBeVisible();
  });
});
