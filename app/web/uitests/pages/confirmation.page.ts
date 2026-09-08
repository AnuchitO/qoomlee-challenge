import type { Page } from "@playwright/test";

export class ConfirmationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading() {
    return this.page.getByRole("heading", { name: /booking confirmed/i });
  }

  bookingRef(ref: string) {
    return this.page.getByText(ref);
  }

  passengerName(name: string) {
    return this.page.getByText(new RegExp(name, "i")).first();
  }

  flightNumber(code: string) {
    return this.page.getByText(code).first();
  }

  /** Waits for navigation to the confirmation page — readiness only, not a business assertion. */
  async waitForConfirmationPage() {
    await this.page.waitForURL(/\/bookings\/confirmation/, { timeout: 5000 });
  }
}
