import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import DateRangePicker from "./DateRangePicker";

const base = {
  departureDate: null,
  returnDate: null,
  isReturnEnabled: false,
  onDepartureChange: vi.fn(),
  onReturnChange: vi.fn(),
  onAddReturn: vi.fn(),
};

beforeEach(() => {
  base.onDepartureChange = vi.fn();
  base.onReturnChange = vi.fn();
  base.onAddReturn = vi.fn();
});

describe("DateRangePicker", () => {
  it("renders Departure and Return section labels", () => {
    render(<DateRangePicker {...base} />);

    expect(screen.getByText("Departure date")).toBeInTheDocument();
    expect(screen.getByText("Return Date")).toBeInTheDocument();
  });

  it("shows 'Add return' button when isReturnEnabled is false", () => {
    render(<DateRangePicker {...base} isReturnEnabled={false} />);

    expect(screen.getByText("Add return")).toBeInTheDocument();
  });

  it("hides 'Add return' and shows Return trigger when isReturnEnabled is true", () => {
    render(<DateRangePicker {...base} isReturnEnabled={true} />);

    expect(screen.queryByText("Add return")).not.toBeInTheDocument();
    expect(screen.getByTestId("return-trigger")).toBeInTheDocument();
  });

  it("calls onAddReturn when 'Add return' is clicked", () => {
    const onAddReturn = vi.fn();
    render(<DateRangePicker {...base} onAddReturn={onAddReturn} />);

    fireEvent.click(screen.getByText("Add return"));

    expect(onAddReturn).toHaveBeenCalledOnce();
  });

  it("opens the return date calendar when 'Add return' is clicked", () => {
    render(<DateRangePicker {...base} />);

    fireEvent.click(screen.getByText("Add return"));

    // Calendar opens at the return step — day buttons (numeric text) appear
    const dayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent ?? ""));
    expect(dayButtons.length).toBeGreaterThan(0);
  });

  it("opens calendar when departure trigger is clicked", () => {
    render(<DateRangePicker {...base} />);

    fireEvent.click(screen.getByTestId("departure-trigger"));

    // calendar is open when day buttons (numbers) become visible
    const dayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent ?? ""));
    expect(dayButtons.length).toBeGreaterThan(0);
  });

  it("opens calendar at return step when return trigger is clicked", () => {
    render(<DateRangePicker {...base} isReturnEnabled={true} />);
    // click the inner role=button inside the return trigger
    const returnTrigger = screen.getByTestId("return-trigger");
    const innerBtn = returnTrigger.querySelector('[role="button"]') ?? returnTrigger;

    fireEvent.click(innerBtn);

    const dayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent ?? ""));
    expect(dayButtons.length).toBeGreaterThan(0);
  });

  it("calls onDepartureChange when a day is clicked in departure step", () => {
    const onDepartureChange = vi.fn();
    render(<DateRangePicker {...base} onDepartureChange={onDepartureChange} />);
    fireEvent.click(screen.getByTestId("departure-trigger"));
    // click first enabled day button (a number)
    const dayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent ?? "") && !b.hasAttribute("disabled"));

    fireEvent.click(dayButtons[0]!);

    expect(onDepartureChange).toHaveBeenCalledOnce();
    expect(onDepartureChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("calls onReturnChange when a return date is selected after departure", () => {
    const onReturnChange = vi.fn();
    // Pre-set a departure date so the return step is valid
    const today = new Date();
    const dep = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const depISO = dep.toISOString().split("T")[0]!;
    render(
      <DateRangePicker
        {...base}
        departureDate={depISO}
        isReturnEnabled={true}
        onReturnChange={onReturnChange}
      />,
    );
    const returnTrigger = screen.getByTestId("return-trigger");
    const innerBtn = returnTrigger.querySelector('[role="button"]') ?? returnTrigger;
    fireEvent.click(innerBtn);
    // find enabled day buttons with value > departure day
    const dayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent ?? "") && !b.hasAttribute("disabled"));

    fireEvent.click(dayButtons[0]!);

    expect(onReturnChange).toHaveBeenCalledOnce();
    expect(onReturnChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("shows departureError message", () => {
    render(<DateRangePicker {...base} departureError="Please select a departure date" />);

    expect(screen.getByText("Please select a departure date")).toBeInTheDocument();
  });

  it("shows returnError message when return is enabled", () => {
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={true}
        returnError="Please select a return date"
      />,
    );

    expect(screen.getByText("Please select a return date")).toBeInTheDocument();
  });

  it("applies boxMinHeight style to date triggers", () => {
    const { container } = render(<DateRangePicker {...base} boxMinHeight={70} />);

    const styledEl = container.querySelector("[style*='min-height']");

    expect(styledEl).toBeInTheDocument();
  });

  it("renders previous/next month navigation inside the open calendar", () => {
    render(<DateRangePicker {...base} />);

    fireEvent.click(screen.getByTestId("departure-trigger"));

    expect(screen.getByLabelText("Previous month")).toBeInTheDocument();
    expect(screen.getByLabelText("Next month")).toBeInTheDocument();
  });

  it("navigates to next month when next arrow is clicked", () => {
    render(<DateRangePicker {...base} />);
    fireEvent.click(screen.getByTestId("departure-trigger"));
    const now = new Date();
    const nextMonthLabel = new Date(now.getFullYear(), now.getMonth() + 2).toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" },
    );

    fireEvent.click(screen.getByLabelText("Next month"));

    expect(screen.getByText(nextMonthLabel)).toBeInTheDocument();
  });
});

// ── User journey tests ────────────────────────────────────────────────────────
// These tests describe the full flow from the user's perspective so regressions
// in any layer (state, portal, outside-click handler) are immediately visible.

const enabledDays = () =>
  screen
    .getAllByRole("button")
    .filter((b) => /^\d{1,2}$/.test(b.textContent ?? "") && !b.hasAttribute("disabled"));

describe("DateRangePicker — user journey: one-way trip", () => {
  it("user opens the calendar, picks a departure date, and the calendar closes", () => {
    const onDepartureChange = vi.fn();
    render(<DateRangePicker {...base} onDepartureChange={onDepartureChange} />);

    // user taps the departure field
    fireEvent.click(screen.getByTestId("departure-trigger"));

    expect(enabledDays().length).toBeGreaterThan(0);

    // user taps a day
    fireEvent.click(enabledDays()[0]!);

    // date was registered
    expect(onDepartureChange).toHaveBeenCalledOnce();
    expect(onDepartureChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    // calendar is gone
    expect(enabledDays()).toHaveLength(0);
  });
});

describe("DateRangePicker — user journey: round trip", () => {
  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0]!;
  };

  it("user picks departure then return — both callbacks fire and calendar closes after return", () => {
    const onDepartureChange = vi.fn();
    const onReturnChange = vi.fn();
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={true}
        onDepartureChange={onDepartureChange}
        onReturnChange={onReturnChange}
      />,
    );

    // step 1: open and pick departure
    fireEvent.click(screen.getByTestId("departure-trigger"));
    fireEvent.click(enabledDays()[0]!);

    expect(onDepartureChange).toHaveBeenCalledOnce();
    // calendar stays open for return step (still shows day buttons)
    expect(enabledDays().length).toBeGreaterThan(0);

    // step 2: pick return
    fireEvent.click(enabledDays()[0]!);

    expect(onReturnChange).toHaveBeenCalledOnce();
    // calendar closes
    expect(enabledDays()).toHaveLength(0);
  });

  it("user can open the return trigger directly when departure is already set", () => {
    const onReturnChange = vi.fn();
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={true}
        departureDate={tomorrow()}
        onReturnChange={onReturnChange}
      />,
    );

    // user taps the Return field
    const returnTrigger = screen.getByTestId("return-trigger");
    fireEvent.click(returnTrigger.querySelector('[role="button"]') ?? returnTrigger);

    // picks a return day
    fireEvent.click(enabledDays()[0]!);

    expect(onReturnChange).toHaveBeenCalledOnce();
    expect(onReturnChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    expect(enabledDays()).toHaveLength(0);
  });

  it("user can clear the return date with the X button", () => {
    const onReturnChange = vi.fn();
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={true}
        departureDate={tomorrow()}
        returnDate={tomorrow()}
        onReturnChange={onReturnChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Clear return date"));

    expect(onReturnChange).toHaveBeenCalledWith(null);
  });
});

// ── User journey: reverse flow (return picked before departure) ───────────────
//
// When a user opens the return trigger without a departure date set they can
// pick the return date first.  The calendar must stay open and switch to the
// departure step so they can pick the departure without reopening the calendar.
// Picking the departure then closes the calendar automatically.

describe("DateRangePicker — user journey: reverse flow (return before departure)", () => {
  const openReturnTrigger = () => {
    const returnTrigger = screen.getByTestId("return-trigger");
    fireEvent.click(returnTrigger.querySelector('[role="button"]') ?? returnTrigger);
  };

  // Helper: picks the last visible enabled day as return date so there is always
  // room (enabled days before it) for the departure selection.
  const pickLastEnabledAsReturn = () => {
    const days = enabledDays();
    fireEvent.click(days[days.length - 1]!);
  };

  it("calendar stays open after return is picked when no departure is set yet", () => {
    render(<DateRangePicker {...base} isReturnEnabled={true} />);

    openReturnTrigger();

    expect(enabledDays().length).toBeGreaterThan(0);

    pickLastEnabledAsReturn();

    // calendar must remain open so the user can pick departure
    expect(enabledDays().length).toBeGreaterThan(0);
  });

  it("fires onReturnChange when return date is picked first", () => {
    const onReturnChange = vi.fn();
    render(<DateRangePicker {...base} isReturnEnabled={true} onReturnChange={onReturnChange} />);

    openReturnTrigger();
    pickLastEnabledAsReturn();

    expect(onReturnChange).toHaveBeenCalledOnce();
    expect(onReturnChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("fires onDepartureChange and closes the calendar when departure is picked after return", () => {
    const onDepartureChange = vi.fn();
    const onReturnChange = vi.fn();
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={true}
        onDepartureChange={onDepartureChange}
        onReturnChange={onReturnChange}
      />,
    );

    // Step 1: open return trigger and pick the last visible day as return
    openReturnTrigger();
    pickLastEnabledAsReturn();

    expect(onReturnChange).toHaveBeenCalledOnce();
    expect(enabledDays().length).toBeGreaterThan(0); // still open in departure step

    // Step 2: pick first enabled day as departure (guaranteed before the return date)
    fireEvent.click(enabledDays()[0]!);

    expect(onDepartureChange).toHaveBeenCalledOnce();
    expect(onDepartureChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    // calendar closes automatically
    expect(enabledDays()).toHaveLength(0);
  });

  it("disables dates on/after the committed return date when selecting departure", () => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    const returnISO = d.toISOString().split("T")[0]!;
    const returnDayStr = String(d.getDate());
    render(<DateRangePicker {...base} isReturnEnabled={true} returnDate={returnISO} />);

    // Open departure trigger — reverseMode is active because returnDate is set
    fireEvent.click(screen.getByTestId("departure-trigger"));

    // The button for the return date itself must be disabled
    const returnDayBtn = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === returnDayStr && b.hasAttribute("disabled"));
    expect(returnDayBtn).toBeTruthy();
  });

  it("enabled days before the return date can still be clicked in departure step", () => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    const returnISO = d.toISOString().split("T")[0]!;
    const onDepartureChange = vi.fn();
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={true}
        returnDate={returnISO}
        onDepartureChange={onDepartureChange}
      />,
    );

    fireEvent.click(screen.getByTestId("departure-trigger"));

    expect(enabledDays().length).toBeGreaterThan(0);

    // The first enabled day is before the return — clicking it should fire onDepartureChange
    fireEvent.click(enabledDays()[0]!);

    expect(onDepartureChange).toHaveBeenCalledOnce();
  });

  it("does not affect normal round-trip flow: picking departure still advances to return step", () => {
    const onDepartureChange = vi.fn();
    render(
      <DateRangePicker {...base} isReturnEnabled={true} onDepartureChange={onDepartureChange} />,
    );

    // Normal flow: no returnDate set, pick departure → should stay open for return
    fireEvent.click(screen.getByTestId("departure-trigger"));
    fireEvent.click(enabledDays()[0]!);

    expect(onDepartureChange).toHaveBeenCalledOnce();
    // calendar stays open (advanced to return step)
    expect(enabledDays().length).toBeGreaterThan(0);
  });

  it("does not affect one-way flow: calendar still closes after departure is picked", () => {
    const onDepartureChange = vi.fn();
    render(
      <DateRangePicker {...base} isReturnEnabled={false} onDepartureChange={onDepartureChange} />,
    );

    fireEvent.click(screen.getByTestId("departure-trigger"));
    fireEvent.click(enabledDays()[0]!);

    expect(onDepartureChange).toHaveBeenCalledOnce();
    expect(enabledDays()).toHaveLength(0); // closed immediately for one-way
  });
});

// ── User journey: "Add return" from one-way, return picked before departure ───
//
// On first load the trip type defaults to one-way (isReturnEnabled=false).
// Clicking "+ Add return" opens the calendar at the return step. If no
// departure date is selected yet, the calendar must behave like the round-trip
// reverse flow: stay open after the return date is picked and switch to the
// departure step, instead of closing immediately.

describe("DateRangePicker — user journey: Add return from one-way (return before departure)", () => {
  const pickLastEnabledAsReturn = () => {
    const days = enabledDays();
    fireEvent.click(days[days.length - 1]!);
  };

  it("stays open and switches to departure step after picking return via 'Add return'", () => {
    const onReturnChange = vi.fn();
    render(<DateRangePicker {...base} isReturnEnabled={false} onReturnChange={onReturnChange} />);

    fireEvent.click(screen.getByText("Add return"));

    expect(enabledDays().length).toBeGreaterThan(0);

    pickLastEnabledAsReturn();

    expect(onReturnChange).toHaveBeenCalledOnce();
    expect(onReturnChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    // calendar must remain open so the user can pick departure next
    expect(enabledDays().length).toBeGreaterThan(0);
  });

  it("fires onDepartureChange and closes the calendar when departure is picked after return", () => {
    const onDepartureChange = vi.fn();
    const onReturnChange = vi.fn();
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={false}
        onDepartureChange={onDepartureChange}
        onReturnChange={onReturnChange}
      />,
    );

    fireEvent.click(screen.getByText("Add return"));
    pickLastEnabledAsReturn();

    expect(onReturnChange).toHaveBeenCalledOnce();
    expect(enabledDays().length).toBeGreaterThan(0); // still open in departure step

    fireEvent.click(enabledDays()[0]!);

    expect(onDepartureChange).toHaveBeenCalledOnce();
    expect(onDepartureChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    // calendar closes automatically
    expect(enabledDays()).toHaveLength(0);
  });
});

// ── Regression: no range band on one-way trips ────────────────────────────────
//
// Bug: in one-way mode (isReturnEnabled=false), reopening the departure
// calendar after a date was already picked and hovering a later date showed
// a range "band" highlight between the selected date and the hovered date —
// implying a return-date selection that doesn't exist on a one-way trip.

describe("DateRangePicker — regression: no range band on one-way trips", () => {
  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0]!;
  };

  it("does not render a band highlight when hovering after departure is already set", () => {
    render(<DateRangePicker {...base} isReturnEnabled={false} departureDate={tomorrow()} />);
    fireEvent.click(screen.getByTestId("departure-trigger"));
    const days = enabledDays();

    expect(days.length).toBeGreaterThan(1);

    // hover a later day than the selected departure date
    fireEvent.mouseEnter(days[days.length - 1]!);

    const bandEls = document.querySelectorAll(".bg-primary\\/15");
    expect(bandEls.length).toBe(0);
  });

  it("still renders a band highlight on round-trip when hovering a return candidate", () => {
    render(<DateRangePicker {...base} isReturnEnabled={true} departureDate={tomorrow()} />);
    // open return step
    const returnTrigger = screen.getByTestId("return-trigger");
    fireEvent.click(returnTrigger.querySelector('[role="button"]') ?? returnTrigger);
    const days = enabledDays();

    expect(days.length).toBeGreaterThan(1);

    fireEvent.mouseEnter(days[days.length - 1]!);

    const bandEls = document.querySelectorAll(".bg-primary\\/15");
    expect(bandEls.length).toBeGreaterThan(0);
  });
});

// ── Regression: stale returnDate must not affect one-way departure picking ────
//
// Bug: user picks departure + return on a round trip, then switches to
// one-way. The parent keeps the old `returnDate` in state (so switching back
// to round trip restores it), but DateRangePicker is now rendered with
// isReturnEnabled=false. Reopening the departure calendar showed the stale
// return date as a selected/grayed-out day and blocked all dates on/after it
// — even though one-way has no return-date concept.

describe("DateRangePicker — regression: stale returnDate must not affect one-way", () => {
  const addDaysISO = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0]!;
  };

  it("does not disable dates on/after the stale returnDate when isReturnEnabled is false", () => {
    const departureISO = addDaysISO(1);
    const returnISO = addDaysISO(10);
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={false}
        departureDate={departureISO}
        returnDate={returnISO}
      />,
    );

    fireEvent.click(screen.getByTestId("departure-trigger"));

    const allDayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent ?? ""));
    // the stale return date itself must remain selectable
    const [, , d] = returnISO.split("-").map(Number) as [number, number, number];
    const returnDayBtn = allDayButtons.find((b) => b.textContent?.trim() === String(d));
    expect(returnDayBtn?.hasAttribute("disabled")).toBe(false);
  });

  it("does not show the stale returnDate as a selected day when isReturnEnabled is false", () => {
    const departureISO = addDaysISO(1);
    const returnISO = addDaysISO(10);
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={false}
        departureDate={departureISO}
        returnDate={returnISO}
      />,
    );

    fireEvent.click(screen.getByTestId("departure-trigger"));

    const [, , d] = returnISO.split("-").map(Number) as [number, number, number];
    const returnDayBtn = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === String(d));
    // selected days get the filled "bg-primary" circle class
    expect(returnDayBtn?.className).not.toMatch(/bg-primary(?!\/)/);
  });

  it("allows picking a departure date after the stale returnDate when isReturnEnabled is false", () => {
    const onDepartureChange = vi.fn();
    const departureISO = addDaysISO(1);
    const returnISO = addDaysISO(10);
    render(
      <DateRangePicker
        {...base}
        isReturnEnabled={false}
        departureDate={departureISO}
        returnDate={returnISO}
        onDepartureChange={onDepartureChange}
      />,
    );

    fireEvent.click(screen.getByTestId("departure-trigger"));
    const [, , d] = returnISO.split("-").map(Number) as [number, number, number];
    const returnDayBtn = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === String(d));

    fireEvent.click(returnDayBtn!);

    expect(onDepartureChange).toHaveBeenCalledOnce();
    expect(onDepartureChange).toHaveBeenCalledWith(returnISO);
  });
});

// ── Regression: portal outside-click handler ─────────────────────────────────
//
// Bug: after switching the desktop panel to createPortal(…, document.body),
// the outside-click handler used wrapRef.contains(target).  Because the portal
// lives outside wrapRef in the DOM, every day-button click was treated as
// "outside", closing the calendar before the day's onClick could fire.
// Fix: panelRef was added to the portal container and excluded from the check.
//
// These tests run with window.innerWidth = 1440 to exercise the desktop portal
// code path (isMobile = false) where the bug manifested.

describe("DateRangePicker — regression: portal outside-click must not swallow day clicks", () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1440,
    });
    act(() => window.dispatchEvent(new Event("resize")));
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    act(() => window.dispatchEvent(new Event("resize")));
  });

  it("mousedown on a day button inside the portal does not close the calendar (desktop)", () => {
    render(<DateRangePicker {...base} />);
    fireEvent.click(screen.getByTestId("departure-trigger"));
    const days = enabledDays();

    expect(days.length).toBeGreaterThan(0);

    // mousedown is what the outside-click handler listens for.
    // Before the fix it would close the calendar here, making the
    // subsequent click land on nothing and onDepartureChange never fire.
    fireEvent.mouseDown(days[0]!);

    // calendar must still be open
    expect(enabledDays().length).toBeGreaterThan(0);
  });

  it("clicking a day in the desktop portal registers the date (end-to-end regression)", () => {
    const onDepartureChange = vi.fn();
    render(<DateRangePicker {...base} onDepartureChange={onDepartureChange} />);

    fireEvent.click(screen.getByTestId("departure-trigger"));
    fireEvent.click(enabledDays()[0]!);

    // Without panelRef the handler closed the calendar on mousedown,
    // so onClick never fired and this count would be 0.
    expect(onDepartureChange).toHaveBeenCalledOnce();
  });

  it("clicking truly outside the trigger and panel closes the calendar (desktop)", () => {
    render(<DateRangePicker {...base} />);
    fireEvent.click(screen.getByTestId("departure-trigger"));

    expect(enabledDays().length).toBeGreaterThan(0);

    // mousedown on an element that is outside both wrapRef and panelRef
    fireEvent.mouseDown(document.body);

    expect(enabledDays()).toHaveLength(0);
  });
});

// ── Memory: window/document listeners must not leak ───────────────────────────
//
// The component registers a "resize" listener on mount, and "mousedown" /
// "scroll" listeners while the desktop panel is open. Each must be removed
// with a matching removeEventListener — otherwise every mount/open cycle
// leaves dangling listeners holding references to stale component instances.

// Only the listener types this component registers — other libraries
// (jsdom, testing-library) add their own window/document listeners that
// aren't this component's responsibility to clean up.
const TRACKED_TYPES = new Set(["resize", "mousedown", "scroll"]);

const countByType = (calls: unknown[][]) =>
  calls.reduce<Record<string, number>>((acc, [type]) => {
    const key = String(type);
    if (!TRACKED_TYPES.has(key)) return acc;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

describe("DateRangePicker — memory: event listener cleanup", () => {
  let windowAdd: MockInstance<typeof window.addEventListener>;
  let windowRemove: MockInstance<typeof window.removeEventListener>;
  let docAdd: MockInstance<typeof document.addEventListener>;
  let docRemove: MockInstance<typeof document.removeEventListener>;

  beforeEach(() => {
    windowAdd = vi.spyOn(window, "addEventListener");
    windowRemove = vi.spyOn(window, "removeEventListener");
    docAdd = vi.spyOn(document, "addEventListener");
    docRemove = vi.spyOn(document, "removeEventListener");
  });

  afterEach(() => {
    windowAdd.mockRestore();
    windowRemove.mockRestore();
    docAdd.mockRestore();
    docRemove.mockRestore();
  });

  it("removes every listener it added once unmounted, even with the calendar open", () => {
    const { unmount } = render(<DateRangePicker {...base} />);

    // open the desktop calendar so the outside-click/scroll effect registers
    // its mousedown/scroll listeners
    fireEvent.click(screen.getByTestId("departure-trigger"));

    expect(enabledDays().length).toBeGreaterThan(0);

    unmount();

    const added = countByType([...windowAdd.mock.calls, ...docAdd.mock.calls]);
    const removed = countByType([...windowRemove.mock.calls, ...docRemove.mock.calls]);
    expect(removed).toEqual(added);
  });

  it("does not accumulate mousedown/scroll listeners across repeated open/close cycles", () => {
    render(<DateRangePicker {...base} />);

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByTestId("departure-trigger"));
      expect(enabledDays().length).toBeGreaterThan(0);
      // close by picking a day
      fireEvent.click(enabledDays()[0]!);
      expect(enabledDays()).toHaveLength(0);
    }

    const addedMousedown = windowAdd.mock.calls
      .concat(docAdd.mock.calls)
      .filter(([type]) => type === "mousedown").length;
    const removedMousedown = windowRemove.mock.calls
      .concat(docRemove.mock.calls)
      .filter(([type]) => type === "mousedown").length;

    // every "mousedown" listener registered while open must be torn down
    // again when the calendar closes
    expect(removedMousedown).toBe(addedMousedown);
  });

  it("removes the window resize listener registered on mount", () => {
    const { unmount } = render(<DateRangePicker {...base} />);
    const addedResize = windowAdd.mock.calls.filter(([type]) => type === "resize").length;

    expect(addedResize).toBeGreaterThan(0);

    unmount();

    const removedResize = windowRemove.mock.calls.filter(([type]) => type === "resize").length;
    expect(removedResize).toBe(addedResize);
  });
});
