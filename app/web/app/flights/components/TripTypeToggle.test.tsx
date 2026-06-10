import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TripTypeToggle from "./TripTypeToggle";

describe("TripTypeToggle", () => {
  it("renders 'Round trip' and 'One way' tab labels", () => {
    render(<TripTypeToggle value="oneway" onChange={() => {}} />);
    expect(screen.getByText("One way")).toBeInTheDocument();
    expect(screen.getByText("Round trip")).toBeInTheDocument();
  });

  it("renders exactly two tab buttons", () => {
    render(<TripTypeToggle value="oneway" onChange={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("calls onChange with 'oneway' when One way is clicked", () => {
    const onChange = vi.fn();
    render(<TripTypeToggle value="round" onChange={onChange} />);
    fireEvent.click(screen.getByText("One way"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("oneway");
  });

  it("calls onChange with 'round' when Round trip is clicked", () => {
    const onChange = vi.fn();
    render(<TripTypeToggle value="oneway" onChange={onChange} />);
    fireEvent.click(screen.getByText("Round trip"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("round");
  });

  it("applies distinct styles to the selected tab", () => {
    const { rerender } = render(<TripTypeToggle value="oneway" onChange={() => {}} />);
    const oneway = screen.getByText("One way");
    const round = screen.getByText("Round trip");

    const onewayBg = oneway.closest("button")?.getAttribute("style") ?? "";
    const roundBg = round.closest("button")?.getAttribute("style") ?? "";
    expect(onewayBg).not.toBe(roundBg);

    rerender(<TripTypeToggle value="round" onChange={() => {}} />);
    const onewayBgAfter =
      screen.getByText("One way").closest("button")?.getAttribute("style") ?? "";
    const roundBgAfter =
      screen.getByText("Round trip").closest("button")?.getAttribute("style") ?? "";
    expect(roundBgAfter).not.toBe(onewayBgAfter);
  });
});
