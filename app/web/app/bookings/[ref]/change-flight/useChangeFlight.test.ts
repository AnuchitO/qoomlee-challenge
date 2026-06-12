import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChangeFlight } from "./useChangeFlight";
import { mockFlightAlternatives } from "@/lib/mock/flights";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ ref: "QM1234" }),
  useRouter: () => ({ push: mockPush }),
}));

describe("useChangeFlight", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initialises with the booking ref, alternatives, and a default selected date", () => {
    const { result } = renderHook(() => useChangeFlight());

    expect(result.current.ref).toBe("QM1234");
    expect(result.current.alternatives).toEqual(mockFlightAlternatives);
    expect(result.current.selectedDate).toBe("2024-10-24");
    expect(result.current.confirming).toBeNull();
  });

  it("handleDateChange updates the selected date", () => {
    const { result } = renderHook(() => useChangeFlight());

    act(() => {
      result.current.handleDateChange({
        target: { value: "2024-11-01" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.selectedDate).toBe("2024-11-01");
  });

  it("handleSelect marks the flight as confirming, then navigates to the booking", () => {
    const { result } = renderHook(() => useChangeFlight());

    act(() => {
      result.current.handleSelect("QQ107");
    });
    expect(result.current.confirming).toBe("QQ107");
    expect(mockPush).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(mockPush).toHaveBeenCalledWith("/bookings/QM1234");
  });
});
