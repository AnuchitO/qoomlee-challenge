import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import ManageBookingPageClient from "./ManageBookingPageClient";
import { getJson } from "@/lib/api/httpClient";
import { ok, err } from "@/lib/result/types";
import { HttpError } from "@/lib/api/errors";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("ref=QM7X2K"),
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/bookings/detail",
}));

vi.mock("@/lib/api/httpClient", () => ({
  getJson: vi.fn(),
}));

const BOOKING_DETAIL = {
  bookingRef: "QM7X2K",
  status: "CONFIRMED",
  totalAmountMinor: 931500,
  totalAmount: "9315.00",
  currency: "THB",
  passenger: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
  },
  flight: {
    flightNumber: "QQ101",
    origin: "BKK",
    destination: "SIN",
    departureTime: "2026-10-24T08:00:00Z",
    arrivalTime: "2026-10-24T09:30:00Z",
  },
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("ManageBookingPageClient — QML-047", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    vi.mocked(getJson).mockReset();
    vi.mocked(getJson).mockResolvedValue(ok(BOOKING_DETAIL));
  });

  // AC1 — loading
  it("shows a loading skeleton while the booking is being fetched", () => {
    vi.mocked(getJson).mockReturnValue(new Promise(() => {}));
    render(<ManageBookingPageClient />);
    expect(screen.queryByText("QQ101")).not.toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  // AC2 — real route
  it("shows the real origin and destination from the booking", async () => {
    render(<ManageBookingPageClient />);
    await flush();
    expect(screen.getByText(/BKK.*SIN|SIN.*BKK/)).toBeInTheDocument();
  });

  // AC3 — real flight number
  it("shows the real flight number in the segment header", async () => {
    render(<ManageBookingPageClient />);
    await flush();
    expect(screen.getByText(/QQ101/)).toBeInTheDocument();
  });

  // AC3 — real departure date
  it("shows the real departure date in the segment header", async () => {
    render(<ManageBookingPageClient />);
    await flush();
    // 2026-10-24 → "Sat, Oct 24, 2026" or similar
    expect(screen.getAllByText(/Oct.*24.*2026|24.*Oct.*2026|Sat.*24/i)[0]).toBeInTheDocument();
  });

  // AC4 — real times
  it("shows the real departure time", async () => {
    render(<ManageBookingPageClient />);
    await flush();
    expect(screen.getByText("08:00")).toBeInTheDocument();
  });

  it("shows the real arrival time", async () => {
    render(<ManageBookingPageClient />);
    await flush();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  // AC5 — real passenger name
  it("shows the real passenger full name", async () => {
    render(<ManageBookingPageClient />);
    await flush();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  // AC6 — not found
  it("redirects to /bookings when the booking is not found", async () => {
    vi.mocked(getJson).mockResolvedValue(err(HttpError.notFound("not found")));
    render(<ManageBookingPageClient />);
    await flush();
    expect(mockReplace).toHaveBeenCalledWith("/bookings");
  });

  it("fetches the booking using the ref from the URL", async () => {
    render(<ManageBookingPageClient />);
    await flush();
    expect(getJson).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookings/QM7X2K"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.any(String) }),
      }),
    );
  });
});
