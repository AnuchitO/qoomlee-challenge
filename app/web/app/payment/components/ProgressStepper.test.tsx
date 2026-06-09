import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressStepper from "./ProgressStepper";

describe("ProgressStepper", () => {
  it("renders all four step labels", () => {
    render(<ProgressStepper />);
    expect(screen.getByText("Flights")).toBeInTheDocument();
    expect(screen.getByText("Seats")).toBeInTheDocument();
    expect(screen.getByText("Extras")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
  });

  it("renders three completed step indicators (check icons)", () => {
    render(<ProgressStepper />);
    // Each completed step contains a 'check' Material Symbol
    const checks = screen.getAllByText("check");
    expect(checks).toHaveLength(3);
  });

  it("renders '4' as the active step number", () => {
    render(<ProgressStepper />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("applies the active style to the Payment label", () => {
    render(<ProgressStepper />);
    const paymentLabel = screen.getByText("Payment");
    expect(paymentLabel.className).toContain("text-primary");
    expect(paymentLabel.className).toContain("font-semibold");
  });
});
