import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RoundTripProgress from "./RoundTripProgress";

const outbound = {
  flightNumber: "QM101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-06-15T08:00:00Z",
  price: 420000,
  currency: "THB",
};

describe("RoundTripProgress", () => {
  it("renders nothing when no step is provided (one-way)", () => {
    const { container } = render(<RoundTripProgress />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows Step 1 of 2 label for the outbound step", () => {
    render(<RoundTripProgress step="outbound" />);
    expect(screen.getByText(/Step 1 of 2/)).toBeInTheDocument();
    expect(screen.getByText(/Select departure flight/)).toBeInTheDocument();
  });

  it("shows Step 2 of 2 label for the return step", () => {
    render(<RoundTripProgress step="return" outbound={outbound} />);
    expect(screen.getByText(/Step 2 of 2/)).toBeInTheDocument();
    expect(screen.getByText(/Select return flight/)).toBeInTheDocument();
  });

  it("does not show an outbound summary banner on the outbound step", () => {
    render(<RoundTripProgress step="outbound" />);
    expect(screen.queryByText(/QM101/)).not.toBeInTheDocument();
  });

  it("shows the selected outbound flight summary on the return step", () => {
    render(<RoundTripProgress step="return" outbound={outbound} />);

    expect(screen.getByText(/QM101/)).toBeInTheDocument();
    expect(screen.getByText(/BKK/)).toBeInTheDocument();
    expect(screen.getByText(/SIN/)).toBeInTheDocument();
    expect(screen.getByText("฿4,200.00")).toBeInTheDocument();
  });
});
