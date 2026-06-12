import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReviewCheckIn } from "./useReviewCheckIn";
import { mockReviewPassengers } from "@/lib/mock/passenger";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ ref: "QM1234" }),
  useRouter: () => ({ push: mockPush }),
}));

describe("useReviewCheckIn", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initialises with the booking ref, review passengers, and confirming false", () => {
    const { result } = renderHook(() => useReviewCheckIn());

    expect(result.current.ref).toBe("QM1234");
    expect(result.current.passengers).toEqual(mockReviewPassengers);
    expect(result.current.confirming).toBe(false);
  });

  it("handleConfirm sets confirming true, then navigates to the boarding pass", () => {
    const { result } = renderHook(() => useReviewCheckIn());

    act(() => {
      result.current.handleConfirm();
    });

    expect(result.current.confirming).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockPush).toHaveBeenCalledWith("/passes/QM1234");
  });
});
