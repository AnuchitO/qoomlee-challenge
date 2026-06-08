import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import DateRangePicker from "./DateRangePicker";

const base = {
  departureDate: null,
  returnDate: null,
  isReturnEnabled: false,
  onDepartureChange: vi.fn(),
  onReturnChange: vi.fn(),
  onAddReturn: vi.fn(),
};

describe("DateRangePicker", () => {
  it("renders Departure and Return section labels", () => {
    render(<DateRangePicker {...base} />);
    expect(screen.getByText("Departure")).toBeInTheDocument();
    expect(screen.getByText("Return")).toBeInTheDocument();
  });

  it("shows '+ Add return' button when isReturnEnabled is false", () => {
    render(<DateRangePicker {...base} isReturnEnabled={false} />);
    expect(screen.getByText("Add return")).toBeInTheDocument();
  });

  it("hides '+ Add return' and shows a date input when isReturnEnabled is true", () => {
    render(<DateRangePicker {...base} isReturnEnabled={true} />);
    expect(screen.queryByText("Add return")).not.toBeInTheDocument();
    const inputs = screen.getAllByDisplayValue("");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onAddReturn when '+ Add return' is clicked", () => {
    const onAddReturn = vi.fn();
    render(<DateRangePicker {...base} onAddReturn={onAddReturn} />);
    fireEvent.click(screen.getByText("Add return"));
    expect(onAddReturn).toHaveBeenCalledOnce();
  });

  it("calls onDepartureChange with the selected date string", () => {
    const onDepartureChange = vi.fn();
    render(<DateRangePicker {...base} onDepartureChange={onDepartureChange} />);
    const [departureInput] = screen.getAllByDisplayValue("");
    fireEvent.change(departureInput, { target: { value: "2026-07-01" } });
    expect(onDepartureChange).toHaveBeenCalledWith("2026-07-01");
  });

  it("calls onDepartureChange with null when date is cleared", () => {
    const onDepartureChange = vi.fn();
    render(<DateRangePicker {...base} departureDate="2026-07-01" onDepartureChange={onDepartureChange} />);
    const [departureInput] = screen.getAllByDisplayValue("2026-07-01");
    fireEvent.change(departureInput, { target: { value: "" } });
    expect(onDepartureChange).toHaveBeenCalledWith(null);
  });

  it("calls onReturnChange with the selected date string", () => {
    const onReturnChange = vi.fn();
    render(<DateRangePicker {...base} isReturnEnabled={true} onReturnChange={onReturnChange} />);
    const inputs = screen.getAllByDisplayValue("");
    const returnInput = inputs[inputs.length - 1];
    fireEvent.change(returnInput, { target: { value: "2026-07-10" } });
    expect(onReturnChange).toHaveBeenCalledWith("2026-07-10");
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
      />
    );
    expect(screen.getByText("Please select a return date")).toBeInTheDocument();
  });

  it("applies boxMinHeight style to date boxes", () => {
    const { container } = render(
      <DateRangePicker {...base} boxMinHeight={70} />
    );
    const styledBox = container.querySelector("[style*='min-height']");
    expect(styledBox).toBeInTheDocument();
  });
});
