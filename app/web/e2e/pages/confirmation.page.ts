import { expect, type Page } from "@playwright/test";

export class ConfirmationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading() {
    return this.page.getByRole("heading", { name: /booking confirmed/i });
  }

  async expectConfirmed(details: {
    bookingRef: string;
    passengerName?: string;
    flightNumber?: string;
  }) {
    await expect(this.page).toHaveURL(/\/bookings\/confirmation/, { timeout: 5000 });
    await expect(this.page).toHaveURL(new RegExp(`ref=${details.bookingRef}`));
    await expect(this.heading).toBeVisible();
    await expect(this.page.getByText(details.bookingRef)).toBeVisible();

    if (details.passengerName) {
      await expect(
        this.page.getByText(new RegExp(details.passengerName, "i")).first(),
      ).toBeVisible();
    }
    if (details.flightNumber) {
      await expect(this.page.getByText(details.flightNumber).first()).toBeVisible();
    }
  }
}
