import { describe, it, expect, vi } from "vitest";
import { showDatePicker } from "./datePicker";

function makeRef(input: HTMLInputElement | null) {
  return { current: input };
}

describe("showDatePicker", () => {
  it("calls showPicker() on the input when it is available", () => {
    const input = { showPicker: vi.fn(), focus: vi.fn() } as unknown as HTMLInputElement;
    showDatePicker(makeRef(input));
    expect(input.showPicker).toHaveBeenCalledOnce();
    expect(input.focus).not.toHaveBeenCalled();
  });

  it("falls back to focus() when showPicker() throws", () => {
    const input = {
      showPicker: vi.fn(() => { throw new DOMException("NotAllowedError"); }),
      focus: vi.fn(),
    } as unknown as HTMLInputElement;
    showDatePicker(makeRef(input));
    expect(input.showPicker).toHaveBeenCalledOnce();
    expect(input.focus).toHaveBeenCalledOnce();
  });

  it("does nothing when ref.current is null", () => {
    expect(() => showDatePicker(makeRef(null))).not.toThrow();
  });
});
