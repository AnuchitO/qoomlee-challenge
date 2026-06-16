import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import BookingsPageClient from "./BookingsPageClient";
import { getJson } from "@/lib/api/httpClient";
import { ok } from "@/lib/result/types";
import type { Summary } from "./BookingsPageClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/bookings",
}));

vi.mock("@/lib/api/httpClient", () => ({
  getJson: vi.fn(),
}));

vi.mock("@/lib/session/sessionToken", () => ({
  authHeaders: () => ({ Authorization: "Bearer test-token" }),
}));

const confirmed: Summary = {
  bookingRef: "SEED01",
  status: "CONFIRMED",
  flightNumber: "QM101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-07-01T08:00:00Z",
  passengers: 1,
  totalAmount: "3500.00",
  currency: "THB",
};

describe("BookingsPageClient", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    vi.mocked(getJson).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a green 'Confirmed' badge for CONFIRMED bookings", async () => {
    vi.mocked(getJson).mockResolvedValue(ok([confirmed]));

    render(<BookingsPageClient />);

    await waitFor(() => expect(screen.getByText("Confirmed")).toBeInTheDocument());
    expect(screen.getByText("Confirmed").className).toContain("green");
  });

  it("shows an amber 'Awaiting payment · expires in Xm' badge for PENDING bookings", async () => {
    const pending: Summary = {
      ...confirmed,
      bookingRef: "SEED02",
      status: "PENDING",
      expiresAt: new Date("2026-06-15T12:12:00Z").toISOString(),
    };
    vi.mocked(getJson).mockResolvedValue(ok([pending]));

    render(<BookingsPageClient />);

    await waitFor(() =>
      expect(screen.getByText("Awaiting payment · expires in 12m")).toBeInTheDocument(),
    );
  });

  it("shows a grey 'Expired' badge for EXPIRED bookings", async () => {
    const expired: Summary = { ...confirmed, bookingRef: "SEED03", status: "EXPIRED" };
    vi.mocked(getJson).mockResolvedValue(ok([expired]));

    render(<BookingsPageClient />);

    await waitFor(() => expect(screen.getByText("Expired")).toBeInTheDocument());
  });

  it("shows the empty state when there are no bookings", async () => {
    vi.mocked(getJson).mockResolvedValue(ok([]));

    render(<BookingsPageClient />);

    await waitFor(() => expect(screen.getByText("No bookings yet")).toBeInTheDocument());
  });

  it("calls GET /api/bookings with the session auth header", async () => {
    vi.mocked(getJson).mockResolvedValue(ok([]));

    render(<BookingsPageClient />);

    await waitFor(() => expect(getJson).toHaveBeenCalled());
    expect(getJson).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookings"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      }),
    );
  });

  it("shows the loading skeleton before bookings arrive", () => {
    vi.mocked(getJson).mockReturnValue(new Promise(() => {}));

    render(<BookingsPageClient />);

    expect(screen.queryByText("No bookings yet")).not.toBeInTheDocument();
    expect(screen.queryByText("Confirmed")).not.toBeInTheDocument();
  });
});
