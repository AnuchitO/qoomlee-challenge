import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVerifyEmail } from "./useVerifyEmail";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("useVerifyEmail", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initialises with an empty 6-digit OTP and a 60s countdown", () => {
    const { result } = renderHook(() => useVerifyEmail());

    expect(result.current.otp).toEqual(["", "", "", "", "", ""]);
    expect(result.current.countdown).toBe(60);
    expect(result.current.canResend).toBe(false);
    expect(result.current.complete).toBe(false);
  });

  it("counts down once per second", () => {
    const { result } = renderHook(() => useVerifyEmail());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.countdown).toBe(59);

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(result.current.countdown).toBe(56);
  });

  it("allows resending once the countdown reaches 0", () => {
    const { result } = renderHook(() => useVerifyEmail());

    for (let i = 0; i < 60; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(result.current.countdown).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it("handleChange accepts a single digit and ignores non-digit input", () => {
    const { result } = renderHook(() => useVerifyEmail());

    act(() => {
      result.current.handleChange(0, "5");
    });

    expect(result.current.otp[0]).toBe("5");

    act(() => {
      result.current.handleChange(1, "ab");
    });

    expect(result.current.otp[1]).toBe("");
  });

  it("complete becomes true once all 6 digits are filled", () => {
    const { result } = renderHook(() => useVerifyEmail());

    "123456".split("").forEach((digit, i) => {
      act(() => {
        result.current.handleChange(i, digit);
      });
    });

    expect(result.current.otp).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(result.current.complete).toBe(true);
  });

  it("handleResend resets the countdown and clears the OTP", () => {
    const { result } = renderHook(() => useVerifyEmail());

    for (let i = 0; i < 60; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    act(() => {
      result.current.handleChange(0, "1");
    });

    expect(result.current.canResend).toBe(true);
    expect(result.current.otp[0]).toBe("1");

    act(() => {
      result.current.handleResend();
    });

    expect(result.current.countdown).toBe(60);
    expect(result.current.canResend).toBe(false);
    expect(result.current.otp).toEqual(["", "", "", "", "", ""]);
  });

  it("handleVerify navigates to /flights", () => {
    const { result } = renderHook(() => useVerifyEmail());

    act(() => {
      result.current.handleVerify();
    });

    expect(mockPush).toHaveBeenCalledWith("/flights");
  });
});
