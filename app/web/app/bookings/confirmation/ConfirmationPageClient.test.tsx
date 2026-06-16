import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ConfirmationPageClient from "./ConfirmationPageClient";

const mockUseSearchParams = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/bookings/confirmation",
  useSearchParams: () => mockUseSearchParams(),
}));

vi.mock("./CopyPNR", () => ({ default: () => null }));

const BASE_PARAMS = new URLSearchParams({
  ref: "QM7X2K",
  flightNumber: "QQ101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-10-24T08:00:00Z",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  totalMinor: "931500",
  currency: "THB",
});

describe("ConfirmationPageClient", () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue(BASE_PARAMS);
  });

  it("renders Booking Confirmed heading", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
  });

  it("renders the success hero section", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByTestId("confirmation-hero")).toBeInTheDocument();
  });

  it("displays the booking reference prominently", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByTestId("booking-ref")).toHaveTextContent("QM7X2K");
  });

  it("renders the Booking Reference label", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByText("Booking Reference")).toBeInTheDocument();
  });

  it("shows the flight number in booking details", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByTestId("flight-number")).toHaveTextContent("QQ101");
  });

  it("shows origin in the route", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByTestId("route")).toHaveTextContent("BKK");
  });

  it("shows destination in the route", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByTestId("route")).toHaveTextContent("SIN");
  });

  it("shows the flight summary line with flight number and route", () => {
    render(<ConfirmationPageClient />);
    const summary = screen.getByTestId("flight-summary-line");
    expect(summary).toHaveTextContent("QQ101");
    expect(summary).toHaveTextContent("BKK");
    expect(summary).toHaveTextContent("SIN");
  });

  it("shows the departure date in the flight summary", () => {
    render(<ConfirmationPageClient />);
    // 2026-10-24 UTC → "Sat 24 Oct 2026"
    expect(screen.getByTestId("flight-summary-line")).toHaveTextContent("Oct");
  });

  it("shows the passenger full name", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByTestId("passenger-name")).toHaveTextContent("John Doe");
  });

  it("shows the passenger email address", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByTestId("passenger-email")).toHaveTextContent("john@example.com");
  });

  it("shows the total amount paid", () => {
    render(<ConfirmationPageClient />);
    // 931500 minor → ฿9,315.00
    expect(screen.getByTestId("total-amount")).toHaveTextContent("฿9,315.00");
  });

  it("shows the Total Paid label", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByText("Total Paid")).toBeInTheDocument();
  });

  it("shows email confirmation notice with the passenger email", () => {
    render(<ConfirmationPageClient />);
    expect(screen.getByText(/A confirmation email has been sent to/)).toBeInTheDocument();
    expect(screen.getByText("john@example.com", { selector: ".font-medium" })).toBeInTheDocument();
  });

  it("renders gracefully when only the booking reference is provided", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams({ ref: "ABC123" }));
    render(<ConfirmationPageClient />);
    expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
    expect(screen.getByTestId("booking-ref")).toHaveTextContent("ABC123");
  });

  it("shows 'your inbox' when email is not provided", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams({ ref: "ABC123" }));
    render(<ConfirmationPageClient />);
    expect(screen.getByText("your inbox")).toBeInTheDocument();
  });
});
