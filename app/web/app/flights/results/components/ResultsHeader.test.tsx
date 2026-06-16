import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultsHeader from "./ResultsHeader";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

describe("ResultsHeader", () => {
  it("shows origin and destination in the header area", () => {
    render(<ResultsHeader summary="BKK → SIN · Sat 24 Oct · 1 Adult · Economy" />);
    expect(screen.getByText(/BKK.*SIN/)).toBeInTheDocument();
  });

  it("renders the search summary text passed as a prop", () => {
    render(<ResultsHeader summary="CNX → BKK · Mon 1 Dec · 2 Adults · Economy" />);
    expect(screen.getByText(/CNX.*BKK/)).toBeInTheDocument();
    expect(screen.getByText(/2 Adults/)).toBeInTheDocument();
  });
});
