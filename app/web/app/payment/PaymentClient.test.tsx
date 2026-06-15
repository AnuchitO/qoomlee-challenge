import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import PaymentClient from "./PaymentClient";
import type { PaymentClientProps } from "./usePaymentClient";
import { getJson } from "@/lib/api/httpClient";
import { ok, err } from "@/lib/result/types";
import { HttpError } from "@/lib/api/errors";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: vi.fn() }),
}));

vi.mock("@/lib/api/httpClient", () => ({
  getJson: vi.fn(),
}));

// price=10000 → ฿100/person, so math is easy
// base=10000, tax=round(10000*0.15)=1500, insurance=59000
// total without promo = 70500 → ฿705
// total with promo    = 70500-50000 = 20500 → ฿205
const BASE_PROPS: PaymentClientProps = {
  bookingRef: "QM7X2K",
  flightNumber: "QQ101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-10-24T08:00:00Z",
  basePriceMinor: 10000,
  currency: "THB",
  passengers: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "0812345678",
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const renderPayment = async (props: Partial<PaymentClientProps> = {}) => {
  render(<PaymentClient {...BASE_PROPS} {...props} />);
  await flush();
};

const fillValidCardForm = () => {
  fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), {
    target: { value: "John Doe" },
  });
  fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), {
    target: { value: "1234567890123456" },
  });
  fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "1228" } });
  fireEvent.change(screen.getByPlaceholderText("•••"), { target: { value: "123" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /i agree/i }));
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  mockPush.mockClear();
  mockReplace.mockClear();
  vi.mocked(getJson).mockReset();
  vi.mocked(getJson).mockResolvedValue(
    ok({ status: "PENDING", expiresAt: "2026-01-01T00:15:00Z" }),
  );
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PaymentClient — layout", () => {
  it("renders Secure Payment heading", async () => {
    await renderPayment();
    expect(screen.getByText("Secure Payment")).toBeInTheDocument();
  });

  it("renders the progress stepper", async () => {
    await renderPayment();
    expect(screen.getByText("Flights")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
  });

  it("renders the booking summary with flight info", async () => {
    await renderPayment();
    expect(screen.getByText(/QQ101.*BKK.*SIN/)).toBeInTheDocument();
  });

  it("renders the countdown timer", async () => {
    await renderPayment();
    expect(screen.getByTestId("countdown")).toBeInTheDocument();
    expect(screen.getByTestId("countdown").textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it("renders all four payment method tabs", async () => {
    await renderPayment();
    expect(screen.getByRole("button", { name: "Card" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PromptPay" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bank" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Other" })).toBeInTheDocument();
  });

  it("shows the card form by default", async () => {
    await renderPayment();
    expect(screen.getByPlaceholderText("e.g. Johnathan Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0000 0000 0000 0000")).toBeInTheDocument();
  });

  it("shows a coming-soon message when a non-card method is selected", async () => {
    await renderPayment();

    fireEvent.click(screen.getByRole("button", { name: "PromptPay" }));

    expect(screen.getByText(/PromptPay.*coming soon/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("0000 0000 0000 0000")).not.toBeInTheDocument();
  });
});

describe("PaymentClient — pricing", () => {
  it("shows base fare (price × passengers)", async () => {
    await renderPayment();
    // 10000 minor = ฿100.00
    expect(screen.getByText("฿100.00")).toBeInTheDocument();
  });

  it("shows taxes as 15% of base fare", async () => {
    await renderPayment();
    // round(10000 × 0.15) = 1500 → ฿15.00
    expect(screen.getByText("฿15.00")).toBeInTheDocument();
  });

  it("shows Travel Insurance line", async () => {
    await renderPayment();
    expect(screen.getByText("Travel Insurance")).toBeInTheDocument();
  });

  it("shows Economy Seat as Free", async () => {
    await renderPayment();
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("shows the total amount in the pay button", async () => {
    await renderPayment();
    // total = 10000+1500+59000 = 70500 → ฿705
    expect(screen.getByRole("button", { name: /pay.*705.*securely/i })).toBeInTheDocument();
  });

  it("scales base fare for multiple passengers", async () => {
    await renderPayment({ passengers: 2 });
    // 2 × ฿100 = ฿200.00
    expect(screen.getByText("฿200.00")).toBeInTheDocument();
  });
});

describe("PaymentClient — promo code", () => {
  it("applies QOOMFIRST promo and shows success banner", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "QOOMFIRST" } });

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText(/QOOMFIRST applied/i)).toBeInTheDocument();
  });

  it("shows the promo discount line in the summary after applying", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "QOOMFIRST" } });

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText("Promo Discount")).toBeInTheDocument();
  });

  it("reduces the total when promo is applied", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "QOOMFIRST" } });

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    // total = 70500 - 50000 = 20500 → ฿205
    expect(screen.getByRole("button", { name: /pay.*205.*securely/i })).toBeInTheDocument();
  });

  it("shows an error for an invalid promo code", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "BADCODE" } });

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText("Invalid promo code")).toBeInTheDocument();
  });

  it("accepts promo code case-insensitively", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "qoomfirst" } });

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText(/QOOMFIRST applied/i)).toBeInTheDocument();
  });
});

describe("PaymentClient — card form validation", () => {
  it("shows Required error for empty cardholder name", async () => {
    await renderPayment();

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("shows card number error for fewer than 16 digits", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), {
      target: { value: "1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    expect(screen.getByText("Enter a valid 16-digit card number")).toBeInTheDocument();
  });

  it("shows expiry format error for wrong format", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "12" } });

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    expect(screen.getByText("Use MM/YY format")).toBeInTheDocument();
  });

  it("shows CVV error for non-numeric or too-short CVV", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "1228" } });

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    expect(screen.getByText("3 or 4 digits required")).toBeInTheDocument();
  });

  it("shows T&C error when checkbox is unchecked", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("e.g. Johnathan Doe"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), { target: { value: "1228" } });
    fireEvent.change(screen.getByPlaceholderText("•••"), { target: { value: "123" } });

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    expect(screen.getByText("You must agree to the terms to proceed")).toBeInTheDocument();
  });

  it("does not navigate when form is invalid", async () => {
    await renderPayment();

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("PaymentClient — successful payment", () => {
  it("navigates to /bookings/confirmation on valid card submission", async () => {
    await renderPayment();
    fillValidCardForm();

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush.mock.calls[0]![0]).toContain("/bookings/confirmation");
  });

  it("includes a QM-prefixed booking reference in the URL", async () => {
    await renderPayment();
    fillValidCardForm();

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    expect(mockPush.mock.calls[0]![0]).toMatch(/ref=QM[A-Z0-9]{4}/);
  });

  it("includes passenger and flight data in the confirmation URL", async () => {
    await renderPayment();
    fillValidCardForm();

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).toContain("flightNumber=QQ101");
    expect(url).toContain("firstName=John");
    expect(url).toContain("lastName=Doe");
    expect(url).toContain("email=john%40example.com");
  });

  it("includes the total amount in the confirmation URL", async () => {
    await renderPayment();
    fillValidCardForm();

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).toContain("totalMinor=70500");
  });

  it("reflects promo discount in the total passed to confirmation", async () => {
    await renderPayment();
    fireEvent.change(screen.getByPlaceholderText("Promo code"), { target: { value: "QOOMFIRST" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    fillValidCardForm();

    fireEvent.click(screen.getByRole("button", { name: /pay.*securely/i }));

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).toContain("totalMinor=20500");
  });
});

describe("PaymentClient — card number formatting", () => {
  it("formats card number into groups of 4 as the user types", async () => {
    await renderPayment();
    const input = screen.getByPlaceholderText("0000 0000 0000 0000") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "4111111111111111" } });

    expect(input.value).toBe("4111 1111 1111 1111");
  });
});

describe("PaymentClient — expiry formatting", () => {
  it("auto-inserts slash after month digits", async () => {
    await renderPayment();
    const input = screen.getByPlaceholderText("MM/YY") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "1228" } });

    expect(input.value).toBe("12/28");
  });
});

describe("PaymentClient — booking lookup", () => {
  it("shows a loading state while the booking is being fetched", async () => {
    vi.mocked(getJson).mockReturnValue(new Promise(() => {}));

    render(<PaymentClient {...BASE_PROPS} />);
    await flush();

    expect(screen.queryByTestId("countdown")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pay.*securely/i })).not.toBeInTheDocument();
  });

  it("redirects to /bookings/new when bookingRef is missing", async () => {
    await renderPayment({ bookingRef: "" });

    expect(mockReplace).toHaveBeenCalledWith("/bookings/new");
  });

  it("redirects to /bookings/new when the booking is not found", async () => {
    vi.mocked(getJson).mockResolvedValue(err(HttpError.notFound("not found")));

    await renderPayment();

    expect(mockReplace).toHaveBeenCalledWith("/bookings/new");
  });

  it("calls GET /api/bookings/:ref with the session auth header", async () => {
    await renderPayment();

    expect(getJson).toHaveBeenCalledWith(
      expect.stringContaining(`/api/bookings/${BASE_PROPS.bookingRef}`),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.any(String) }),
      }),
    );
  });

  it("seeds the countdown from the server-provided expiresAt", async () => {
    vi.mocked(getJson).mockResolvedValue(
      ok({ status: "PENDING", expiresAt: "2026-01-01T00:05:00Z" }),
    );

    await renderPayment();

    expect(screen.getByTestId("countdown").textContent).toBe("05:00");
  });

  it("redirects to /bookings/confirmation when the booking is already CONFIRMED", async () => {
    vi.mocked(getJson).mockResolvedValue(ok({ status: "CONFIRMED" }));

    await renderPayment();

    expect(mockReplace).toHaveBeenCalledWith("/bookings/confirmation?ref=QM7X2K");
  });

  it("shows the expired panel and hides the form when the booking is EXPIRED", async () => {
    vi.mocked(getJson).mockResolvedValue(ok({ status: "EXPIRED" }));

    await renderPayment();

    expect(screen.getByText(/booking hold has expired/i)).toBeInTheDocument();
    expect(screen.queryByTestId("countdown")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pay.*securely/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /flight search/i })).toBeInTheDocument();
  });
});
