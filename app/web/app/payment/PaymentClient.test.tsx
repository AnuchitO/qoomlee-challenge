import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import PaymentClient from "./PaymentClient";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
}));

// price=10000 → $100/person, so math is easy
// base=10000, tax=round(10000*0.15)=1500, insurance=59000
// total without promo = 70500 → $705.00
// total with promo    = 70500-50000 = 20500 → $205.00
const BASE_PROPS = {
  flightNumber: "QQ101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-10-24T08:00:00Z",
  basePriceMinor: 10000,
  currency: "USD",
  passengers: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "0812345678",
};

const fillValidCardForm = () => {
  fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), { target: { value: "John Doe" } });
  fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234567890123456" } });
  fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "1228" } });
  fireEvent.change(screen.getByPlaceholderText("•••"), { target: { value: "123" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /i agree/i }));
};

beforeEach(() => {
  mockPush.mockClear();
});

describe("PaymentClient — layout", () => {
  it("renders Secure Payment heading", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    expect(screen.getByText("Secure Payment")).toBeInTheDocument();
  });

  it("renders the progress stepper", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    expect(screen.getByText("Flights")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
  });

  it("renders the booking summary with flight info", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    expect(screen.getByText(/QQ101.*BKK.*SIN/)).toBeInTheDocument();
  });

  it("renders the countdown timer", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    expect(screen.getByTestId("countdown")).toBeInTheDocument();
    expect(screen.getByTestId("countdown").textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it("renders all four payment method tabs", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    expect(screen.getByRole("button", { name: "Card" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PromptPay" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bank" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Other" })).toBeInTheDocument();
  });

  it("shows the card form by default", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    expect(screen.getByPlaceholderText("e.g. Johnathan Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0000 0000 0000 0000")).toBeInTheDocument();
  });

  it("shows a coming-soon message when a non-card method is selected", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: "PromptPay" }));
    expect(screen.getByText(/PromptPay.*coming soon/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("0000 0000 0000 0000")).not.toBeInTheDocument();
  });
});

describe("PaymentClient — pricing", () => {
  it("shows base fare (price × passengers)", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    // 10000 minor = $100.00
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  it("shows taxes as 15% of base fare", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    // round(10000 × 0.15) = 1500 → $15.00
    expect(screen.getByText("$15.00")).toBeInTheDocument();
  });

  it("shows Travel Insurance line", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    expect(screen.getByText("Travel Insurance")).toBeInTheDocument();
  });

  it("shows Economy Seat as Free", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("shows the total amount in the pay button", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    // total = 10000+1500+59000 = 70500 → $705.00
    expect(screen.getByRole("button", { name: /pay.*705.*securely/i })).toBeInTheDocument();
  });

  it("scales base fare for multiple passengers", () => {
    render(<PaymentClient {...BASE_PROPS} passengers={2} />);
    // 2 × $100.00 = $200.00
    expect(screen.getByText("$200.00")).toBeInTheDocument();
  });
});

describe("PaymentClient — promo code", () => {
  it("applies QOOMFIRST promo and shows success banner", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "QOOMFIRST" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText(/QOOMFIRST applied/i)).toBeInTheDocument();
  });

  it("shows the promo discount line in the summary after applying", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "QOOMFIRST" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("Promo Discount")).toBeInTheDocument();
  });

  it("reduces the total when promo is applied", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "QOOMFIRST" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    // total = 70500 - 50000 = 20500 → $205.00
    expect(screen.getByRole("button", { name: /pay.*205.*securely/i })).toBeInTheDocument();
  });

  it("shows an error for an invalid promo code", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "BADCODE" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("Invalid promo code")).toBeInTheDocument();
  });

  it("accepts promo code case-insensitively", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "qoomfirst" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText(/QOOMFIRST applied/i)).toBeInTheDocument();
  });
});

describe("PaymentClient — card form validation", () => {
  it("shows Required error for empty cardholder name", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("shows card number error for fewer than 16 digits", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    expect(screen.getByText("Enter a valid 16-digit card number")).toBeInTheDocument();
  });

  it("shows expiry format error for wrong format", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234567890123456" } });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    expect(screen.getByText("Use MM/YY format")).toBeInTheDocument();
  });

  it("shows CVV error for non-numeric or too-short CVV", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234567890123456" } });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "1228" } });
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    expect(screen.getByText("3 or 4 digits required")).toBeInTheDocument();
  });

  it("shows T&C error when checkbox is unchecked", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234567890123456" } });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "1228" } });
    fireEvent.change(screen.getByPlaceholderText("•••"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    expect(screen.getByText("You must agree to the terms to proceed")).toBeInTheDocument();
  });

  it("does not navigate when form is invalid", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("PaymentClient — successful payment", () => {
  it("navigates to /bookings/confirmation on valid card submission", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fillValidCardForm();
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush.mock.calls[0][0]).toContain("/bookings/confirmation");
  });

  it("includes a QM-prefixed booking reference in the URL", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fillValidCardForm();
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    expect(mockPush.mock.calls[0][0]).toMatch(/ref=QM[A-Z0-9]{4}/);
  });

  it("includes passenger and flight data in the confirmation URL", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fillValidCardForm();
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain("flightNumber=QQ101");
    expect(url).toContain("firstName=John");
    expect(url).toContain("lastName=Doe");
    expect(url).toContain("email=john%40example.com");
  });

  it("includes the total amount in the confirmation URL", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fillValidCardForm();
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain("totalMinor=70500");
  });

  it("reflects promo discount in the total passed to confirmation", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "QOOMFIRST" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    fillValidCardForm();
    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));
    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain("totalMinor=20500");
  });
});

describe("PaymentClient — card number formatting", () => {
  it("formats card number into groups of 4 as the user types", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    const input = screen.getByPlaceholderText("0000 0000 0000 0000") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "4111111111111111" } });
    expect(input.value).toBe("4111 1111 1111 1111");
  });
});

describe("PaymentClient — expiry formatting", () => {
  it("auto-inserts slash after month digits", () => {
    render(<PaymentClient {...BASE_PROPS} />);
    const input = screen.getByPlaceholderText("MM/YY") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1228" } });
    expect(input.value).toBe("12/28");
  });
});
