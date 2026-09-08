import type { Page } from "@playwright/test";

export class FlightResultsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  flightNumber(code: string) {
    return this.page.getByText(code);
  }

  route(origin: string, destination: string) {
    return this.page
      .getByText(new RegExp(`${origin}.*${destination}|${destination}.*${origin}`))
      .first();
  }

  get selectButton() {
    return this.page.getByRole("button", { name: /select/i }).first();
  }

  async goto(params: {
    origin: string;
    destination: string;
    departure: string;
    passengers?: number;
    cabin?: string;
  }) {
    const query = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departure: params.departure,
      passengers: String(params.passengers ?? 1),
      cabin: params.cabin ?? "economy",
    });
    await this.page.goto(`/flights/results?${query}`);
    await this.page.waitForLoadState("networkidle");
  }

  async selectFlight() {
    await this.selectButton.click();
  }
}
