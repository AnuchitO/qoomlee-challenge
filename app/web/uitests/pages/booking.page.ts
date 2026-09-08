import type { Page } from "@playwright/test";
import { DEFAULT_FLIGHT } from "../helpers/test-data";

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

  flightNumber(code: string) {
    return this.page.getByText(code);
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
      flightId: String(params?.flightId ?? DEFAULT_FLIGHT.id),
      flightNumber: params?.flightNumber ?? DEFAULT_FLIGHT.flightNumber,
      origin: params?.origin ?? DEFAULT_FLIGHT.origin,
      destination: params?.destination ?? DEFAULT_FLIGHT.destination,
      departureTime: params?.departureTime ?? DEFAULT_FLIGHT.departureTime,
      price: String(params?.price ?? DEFAULT_FLIGHT.basePriceMinor),
      currency: params?.currency ?? DEFAULT_FLIGHT.currency,
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
}
