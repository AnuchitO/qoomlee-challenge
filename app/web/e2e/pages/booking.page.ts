import { expect, type Page } from "@playwright/test";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export { UUID_RE };

export class BookingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get firstName() {
    return this.page.getByPlaceholder("e.g. John");
  }

  get lastName() {
    return this.page.getByPlaceholder("e.g. Doe");
  }

  get email() {
    return this.page.getByPlaceholder("john.doe@example.com");
  }

  get phone() {
    return this.page.getByPlaceholder("000 000 000");
  }

  get continueButton() {
    return this.page.getByRole("button", { name: /continue to payment/i });
  }

  async goto(params?: {
    flightId?: number;
    flightNumber?: string;
    origin?: string;
    destination?: string;
    departureTime?: string;
    price?: number;
    currency?: string;
    passengers?: number;
  }) {
    const p = {
      flightId: String(params?.flightId ?? 1),
      flightNumber: params?.flightNumber ?? "QQ101",
      origin: params?.origin ?? "BKK",
      destination: params?.destination ?? "SIN",
      departureTime: params?.departureTime ?? "2026-10-24T08:00:00Z",
      price: String(params?.price ?? 810000),
      currency: params?.currency ?? "THB",
      passengers: String(params?.passengers ?? 1),
    };
    const query = new URLSearchParams(p);
    await this.page.goto(`/bookings/new?${query}`);
  }

  async fillPassengerDetails(passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    await this.firstName.fill(passenger.firstName);
    await this.lastName.fill(passenger.lastName);
    await this.email.fill(passenger.email);
    await this.phone.fill(passenger.phone);
  }

  async submitBooking() {
    await this.continueButton.click();
  }

  async fillAndSubmit(passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    await this.fillPassengerDetails(passenger);
    await this.submitBooking();
  }

  async waitForToken() {
    await this.page.waitForURL(/bookingToken=/, { timeout: 10000 });
  }

  getTokenFromUrl(): string | null {
    return new URL(this.page.url()).searchParams.get("bookingToken");
  }

  async expectOnBookingPage() {
    await expect(this.page).toHaveURL(/\/bookings\/new/);
  }

  async expectFlightVisible(flightNumber: string) {
    await expect(this.page.getByText(flightNumber)).toBeVisible();
  }
}
