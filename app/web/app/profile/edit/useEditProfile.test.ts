import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditProfile } from "./useEditProfile";
import { mockProfile } from "@/lib/profile/mock";

const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe("useEditProfile", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockBack.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initialises the form from the user's profile data and saving is false", () => {
    const { result } = renderHook(() => useEditProfile());

    expect(result.current.form).toEqual(mockProfile);
    expect(result.current.saving).toBe(false);
  });

  it("set(key) updates a single form field", () => {
    const { result } = renderHook(() => useEditProfile());

    act(() => {
      result.current.set("fullName")({
        target: { value: "Jane Doe" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.form.fullName).toBe("Jane Doe");
    expect(result.current.form.email).toBe(mockProfile.email);
  });

  it("handleSave sets saving true, then resets saving and navigates back", () => {
    const { result } = renderHook(() => useEditProfile());
    const preventDefault = vi.fn();

    act(() => {
      result.current.handleSave({ preventDefault } as unknown as React.FormEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.saving).toBe(true);
    expect(mockBack).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.saving).toBe(false);
    expect(mockBack).toHaveBeenCalled();
  });
});
