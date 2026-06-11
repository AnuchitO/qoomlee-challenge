import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BookingClient from "./BookingClient";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// flight with simple price so math is easy to verify:
// basePriceMinor=10000 → ฿100 per person
// taxes = round(10000 * 0.15) = 1500 → ฿15
// total = 11500 → ฿115
const flight = {
  id: 1,
  flightNumber: "QQ101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-10-24T08:00:00Z",
  arrivalTime: "2026-10-24T11:30:00Z",
  basePriceMinor: 10000,
  currency: "THB",
  availableSeats: 50,
  status: "SCHEDULED",
  durationMinutes: 210,
};

const fillValidForm = () => {
  fireEvent.change(screen.getByPlaceholderText("e.g. John"), { target: { value: "John" } });
  fireEvent.change(screen.getByPlaceholderText("e.g. Doe"), { target: { value: "Doe" } });
  fireEvent.change(screen.getByPlaceholderText("john.doe@example.com"), {
    target: { value: "john@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("000 000 000"), { target: { value: "0812345678" } });
};

beforeEach(() => {
  mockPush.mockClear();
});

describe("BookingClient — passenger form", () => {
  it("renders Passenger Details heading", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByText("Passenger Details")).toBeInTheDocument();
  });

  it("renders all form field labels", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
  });

  it("renders the +66 country code prefix", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByText("+66")).toBeInTheDocument();
  });

  it("renders Continue to Payment button", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByRole("button", { name: /continue to payment/i })).toBeInTheDocument();
  });

  it("shows Required errors for all empty fields on submit", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
    expect(screen.getAllByText("Required")).toHaveLength(3); // firstName, lastName, phone
    expect(screen.getByText("Valid email required")).toBeInTheDocument();
  });

  it("shows email validation error for an address without @", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. John"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Doe"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("john.doe@example.com"), {
      target: { value: "notanemail" },
    });
    fireEvent.change(screen.getByPlaceholderText("000 000 000"), {
      target: { value: "0812345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
    expect(screen.getByText("Valid email required")).toBeInTheDocument();
  });

  it("does not call router.push when form is invalid", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("calls router.push with /payment route when form is valid", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/payment"));
  });

  it("includes passenger data in the navigation URL", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain("firstName=John");
    expect(url).toContain("lastName=Doe");
    expect(url).toContain("email=john%40example.com");
  });

  it("includes flight data in the navigation URL", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain("flightNumber=QQ101");
    expect(url).toContain("origin=BKK");
    expect(url).toContain("destination=SIN");
  });
});

describe("BookingClient — payment summary", () => {
  it("renders Payment Summary section heading", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByText(/payment summary/i)).toBeInTheDocument();
  });

  it("shows '1x Adult' label for 1 passenger", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByText("Base Fare (1x Adult)")).toBeInTheDocument();
  });

  it("shows '2x Adult' label for 2 passengers", () => {
    render(<BookingClient flight={flight} passengers={2} />);
    expect(screen.getByText("Base Fare (2x Adult)")).toBeInTheDocument();
  });

  it("shows Taxes & Fees row", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByText("Taxes & Fees")).toBeInTheDocument();
  });

  it("shows Total Amount row", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByText("Total Amount")).toBeInTheDocument();
  });

  it("shows Upgrade to Business upsell card", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    expect(screen.getByText("Upgrade to Business")).toBeInTheDocument();
    expect(screen.getByText(/lounge access/i)).toBeInTheDocument();
  });

  it("calculates base fare as price × passengers", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    // basePriceMinor=10000 → ฿100.00
    expect(screen.getByText("฿100.00")).toBeInTheDocument();
  });

  it("scales base fare for multiple passengers", () => {
    render(<BookingClient flight={flight} passengers={2} />);
    // 2 × ฿100 = ฿200.00
    expect(screen.getByText("฿200.00")).toBeInTheDocument();
  });

  it("calculates taxes as 15% of base fare", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    // round(10000 × 0.15) = 1500 → ฿15.00
    expect(screen.getByText("฿15.00")).toBeInTheDocument();
  });

  it("calculates total as base fare + taxes", () => {
    render(<BookingClient flight={flight} passengers={1} />);
    // 10000 + 1500 = 11500 → ฿115.00
    expect(screen.getByText("฿115.00")).toBeInTheDocument();
  });
});
