import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDelayedAction } from "./useDelayedAction";

describe("useDelayedAction", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls the callback after the given delay", () => {
    const { result } = renderHook(() => useDelayedAction());
    const callback = vi.fn();

    result.current(callback, 1000);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not call the callback after the component unmounts", () => {
    const { result, unmount } = renderHook(() => useDelayedAction());
    const callback = vi.fn();

    result.current(callback, 1000);
    unmount();

    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
  });

  it("cancels a previously scheduled callback when scheduling a new one", () => {
    const { result } = renderHook(() => useDelayedAction());
    const first = vi.fn();
    const second = vi.fn();

    result.current(first, 1000);
    result.current(second, 1000);

    vi.advanceTimersByTime(1000);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
