import { test, expect } from "./fixtures";
import { mockAllServices, DEFAULT_BOOKING_REF } from "./mocks";

test.describe("Traveller books and pays for a flight", () => {
  test("happy path: search → select flight → passenger details → pay → booking confirmation (PNR)", async ({
    page,
    flightResultsPage,
    bookingPage,
    paymentPage,
    confirmationPage,
  }) => {
    await mockAllServices(page);

    // Step 1: view search results
    await flightResultsPage.goto({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-10-24",
    });
    await flightResultsPage.expectFlightVisible("QQ101", "BKK", "SIN");

    // Step 2: select a flight
    await flightResultsPage.selectFlight();
    await bookingPage.expectOnBookingPage();
    await bookingPage.expectFlightVisible("QQ101");

    // Step 3: fill passenger details
    await bookingPage.fillAndSubmit({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "0812345678",
    });
    await paymentPage.expectOnPaymentPage(DEFAULT_BOOKING_REF);

    // Step 4: fill card details and pay
    await paymentPage.fillAndPay({
      name: "Jane Smith",
      number: "4111111111111111",
      expiry: "1228",
      cvv: "123",
    });

    // Step 5: booking confirmation
    await confirmationPage.expectConfirmed({
      bookingRef: DEFAULT_BOOKING_REF,
      passengerName: "jane",
      flightNumber: "QQ101",
    });
  });
});
