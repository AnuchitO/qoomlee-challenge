/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixture use(), not React hooks */
import { test as base } from "@playwright/test";
import { FlightSearchPage } from "./pages/flight-search.page";
import { FlightResultsPage } from "./pages/flight-results.page";
import { BookingPage } from "./pages/booking.page";
import { PaymentPage } from "./pages/payment.page";
import { ConfirmationPage } from "./pages/confirmation.page";

type E2EFixtures = {
  flightSearchPage: FlightSearchPage;
  flightResultsPage: FlightResultsPage;
  bookingPage: BookingPage;
  paymentPage: PaymentPage;
  confirmationPage: ConfirmationPage;
};

export const test = base.extend<E2EFixtures>({
  flightSearchPage: async ({ page }, use) => {
    await use(new FlightSearchPage(page));
  },
  flightResultsPage: async ({ page }, use) => {
    await use(new FlightResultsPage(page));
  },
  bookingPage: async ({ page }, use) => {
    await use(new BookingPage(page));
  },
  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
});

export { expect } from "@playwright/test";
