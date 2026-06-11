import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("calls onDepartureChange when a day is clicked in departure step", async () => {
    const onDepartureChange = vi.fn();
    render(<DateRangePicker {...base} onDepartureChange={onDepartureChange} />);

    fireEvent.click(screen.getByTestId("departure-trigger"));

    // click first enabled day button (a number)
    const dayButtons = screen
      .getAllByRole("button")
      .filter((b) => /^\d{1,2}$/.test(b.textContent ?? "") && !b.hasAttribute("disabled"));

    fireEvent.click(dayButtons[0]);

    expect(onDepartureChange).toHaveBeenCalledOnce();
    expect(onDepartureChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("calls onReturnChange when a return date is selected after departure", async () => {
    const onReturnChange = vi.fn();
    // Pre-set a departure date so the return step is valid
    const today = new Date();
    const dep = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const depISO = dep.toISOString().split("T")[0];

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

    fireEvent.click(dayButtons[0]);

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
