import { test, expect } from "./fixtures";
import { mockAllServices, DEFAULT_BOOKING_REF } from "./mocks";
import { DEFAULT_SEARCH, DEFAULT_FLIGHT, DEFAULT_PASSENGER, VALID_CARD } from "./helpers/test-data";

test.describe("Traveller books and pays for a flight", () => {
  test("Given a searched flight, When the traveller books it and pays, Then they land on the confirmation page with their PNR", async ({
    page,
    flightResultsPage,
    bookingPage,
    paymentPage,
    confirmationPage,
  }) => {
    await test.step("Given the flight, booking, and payment services are mocked", async () => {
      await mockAllServices(page);
    });

    await test.step("Given the traveller views search results for their route", async () => {
      await flightResultsPage.goto(DEFAULT_SEARCH);
      await expect(flightResultsPage.flightNumber(DEFAULT_FLIGHT.flightNumber)).toBeVisible({
        timeout: 5000,
      });
      await expect(
        flightResultsPage.route(DEFAULT_SEARCH.origin, DEFAULT_SEARCH.destination),
      ).toBeVisible();
    });

    await test.step("When the traveller selects a flight", async () => {
      await flightResultsPage.selectFlight();
    });

    await test.step("Then they land on the booking page for that flight", async () => {
      await expect(page).toHaveURL(/\/bookings\/new/);
      await expect(bookingPage.flightNumber(DEFAULT_FLIGHT.flightNumber)).toBeVisible();
    });

    await test.step("When the traveller fills in passenger details and continues", async () => {
      await bookingPage.fillAndSubmit(DEFAULT_PASSENGER);
    });

    await test.step("Then they land on the payment page for their booking", async () => {
      await expect(page).toHaveURL(/\/payment/, { timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(`ref=${DEFAULT_BOOKING_REF}`));
    });

    await test.step("When the traveller pays with a valid card", async () => {
      await paymentPage.fillAndPay(VALID_CARD);
    });

    await test.step("Then they land on the confirmation page showing their PNR", async () => {
      await confirmationPage.waitForConfirmationPage();
      await expect(page).toHaveURL(new RegExp(`ref=${DEFAULT_BOOKING_REF}`));
      await expect(confirmationPage.heading).toBeVisible();
      await expect(confirmationPage.bookingRef(DEFAULT_BOOKING_REF)).toBeVisible();
      await expect(confirmationPage.passengerName(DEFAULT_PASSENGER.firstName)).toBeVisible();
      await expect(confirmationPage.flightNumber(DEFAULT_FLIGHT.flightNumber)).toBeVisible();
    });
  });
});
