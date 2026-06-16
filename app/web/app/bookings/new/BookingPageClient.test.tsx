import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BookingPageClient from "./BookingPageClient";

const mockUseSearchParams = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/bookings/new",
  useSearchParams: () => mockUseSearchParams(),
}));

describe("BookingPageClient — one-way", () => {
  it("renders the Book Your Flight heading", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        flightId: "1",
        flightNumber: "QQ101",
        origin: "BKK",
        destination: "SIN",
        departureTime: "2026-10-24T08:00:00Z",
        price: "810000",
        currency: "THB",
        passengers: "1",
        bookingToken: "test-token",
      }),
    );
    render(<BookingPageClient />);
    expect(screen.getByText("Book Your Flight")).toBeInTheDocument();
  });

  it("shows a single flight summary card when no return flight is present", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        flightId: "1",
        flightNumber: "QQ101",
        origin: "BKK",
        destination: "SIN",
        departureTime: "2026-10-24T08:00:00Z",
        price: "810000",
        currency: "THB",
        passengers: "1",
        bookingToken: "test-token-one-way",
      }),
    );

    render(<BookingPageClient />);

    expect(screen.getAllByText("QQ101")).toHaveLength(1);
  });
});

describe("BookingPageClient — round trip", () => {
  it("shows two flight summary cards when returnFlightId is present", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        outboundFlightId: "1",
        outboundFlightNumber: "QM101",
        outboundOrigin: "BKK",
        outboundDestination: "SIN",
        outboundDepartureTime: "2026-06-15T08:00:00Z",
        outboundPrice: "420000",
        outboundCurrency: "THB",
        returnFlightId: "2",
        returnFlightNumber: "QM202",
        returnOrigin: "SIN",
        returnDestination: "BKK",
        returnDepartureTime: "2026-06-20T08:00:00Z",
        returnPrice: "390000",
        currency: "THB",
        passengers: "1",
        bookingToken: "test-token-round-trip-1",
      }),
    );

    render(<BookingPageClient />);

    expect(screen.getByText("QM101")).toBeInTheDocument();
    expect(screen.getByText("QM202")).toBeInTheDocument();
  });

  it("shows a combined total based on both flights' prices", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        outboundFlightId: "1",
        outboundFlightNumber: "QM101",
        outboundOrigin: "BKK",
        outboundDestination: "SIN",
        outboundDepartureTime: "2026-06-15T08:00:00Z",
        outboundPrice: "10000",
        outboundCurrency: "THB",
        returnFlightId: "2",
        returnFlightNumber: "QM202",
        returnOrigin: "SIN",
        returnDestination: "BKK",
        returnDepartureTime: "2026-06-20T08:00:00Z",
        returnPrice: "10000",
        currency: "THB",
        passengers: "1",
        bookingToken: "test-token-round-trip-2",
      }),
    );

    render(<BookingPageClient />);

    // base fare = (10000 + 10000) * 1 = 20000 → ฿200.00
    expect(screen.getByText("฿200.00")).toBeInTheDocument();
    // taxes = round(20000 * 0.15) = 3000 → ฿30.00
    expect(screen.getByText("฿30.00")).toBeInTheDocument();
    // total = 23000 → ฿230.00
    expect(screen.getByText("฿230.00")).toBeInTheDocument();
  });
});
