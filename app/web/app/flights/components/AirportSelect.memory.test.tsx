import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import AirportSelect from "./AirportSelect";

// Intentionally do NOT mock react-dom here — the mobile bottom sheet (portal)
// is what schedules the closeSheet timeout we're testing.

const base = {
  value: "",
  onChange: vi.fn(),
  icon: "flight_takeoff",
  placeholder: "Select origin",
};

describe("AirportSelect — memory: closeSheet timer cleanup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears the pending closeSheet timeout when unmounted before it fires", () => {
    const { unmount } = render(<AirportSelect {...base} />);

    fireEvent.click(screen.getByText("Select origin"));
    // Flush the open-effect's focus timeouts + the slide-up animation frame.
    vi.advanceTimersByTime(400);

    const backdrop = document.querySelector(".bg-black\\/40") as HTMLElement;
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop);

    // closeSheet schedules a 280ms timeout to finish closing.
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
