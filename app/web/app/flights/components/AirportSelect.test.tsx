import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import AirportSelect from "./AirportSelect";

// Suppress the portal so only the desktop dropdown is exercised in tests.
// The portal is mobile-only UI (bottom sheet) and would duplicate all list
// content in jsdom, making queries ambiguous.
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, createPortal: () => null };
});

const base = {
  value: "",
  onChange: vi.fn(),
  icon: "flight_takeoff",
  placeholder: "Select origin",
};

beforeEach(() => {
  base.onChange = vi.fn();
});

describe("AirportSelect", () => {
  // ── closed state ────────────────────────────────────────────────────────────

  it("renders the placeholder when no airport is selected", () => {
    render(<AirportSelect {...base} />);
    expect(screen.getByText("Select origin")).toBeInTheDocument();
  });

  it("renders city and code when an airport is selected", () => {
    render(<AirportSelect {...base} value="BKK" />);
    expect(screen.getByText("Bangkok (BKK)")).toBeInTheDocument();
  });

  it("renders the full airport name when an airport is selected", () => {
    render(<AirportSelect {...base} value="BKK" />);
    expect(screen.getByText("Suvarnabhumi Airport")).toBeInTheDocument();
  });

  it("applies error border styling when error prop is provided", () => {
    const { container } = render(
      <AirportSelect {...base} error="Required" />
    );
    const trigger = container.querySelector("button");
    expect(trigger?.className).toContain("border-error");
  });

  // ── open / dropdown ─────────────────────────────────────────────────────────

  it("opens the dropdown when the trigger is clicked", async () => {
    render(<AirportSelect {...base} />);
    fireEvent.click(screen.getByText("Select origin"));
    await waitFor(() =>
      expect(screen.getByText("Popular Cities or Airports")).toBeInTheDocument()
    );
  });

  it("lists all airports in the dropdown", async () => {
    render(<AirportSelect {...base} />);
    fireEvent.click(screen.getByText("Select origin"));
    await waitFor(() =>
      expect(screen.getByText("Suvarnabhumi Airport")).toBeInTheDocument()
    );
    expect(screen.getByText("Singapore Changi Airport")).toBeInTheDocument();
  });

  it("excludes the airport matching excludeCode", async () => {
    render(<AirportSelect {...base} excludeCode="BKK" />);
    fireEvent.click(screen.getByText("Select origin"));
    await waitFor(() =>
      expect(screen.getByText("Singapore Changi Airport")).toBeInTheDocument()
    );
    expect(screen.queryByText("Suvarnabhumi Airport")).not.toBeInTheDocument();
  });

  // ── search / filter ─────────────────────────────────────────────────────────

  it("filters the list when a search query is entered", async () => {
    render(<AirportSelect {...base} />);
    fireEvent.click(screen.getByText("Select origin"));
    const searchInput = await screen.findByPlaceholderText("Search airports or cities…");
    fireEvent.change(searchInput, { target: { value: "Singapore" } });
    await waitFor(() =>
      expect(screen.getByText("Singapore Changi Airport")).toBeInTheDocument()
    );
    expect(screen.queryByText("Suvarnabhumi Airport")).not.toBeInTheDocument();
  });

  it("shows 'No airports found' when no results match the query", async () => {
    render(<AirportSelect {...base} />);
    fireEvent.click(screen.getByText("Select origin"));
    const searchInput = await screen.findByPlaceholderText("Search airports or cities…");
    fireEvent.change(searchInput, { target: { value: "zzznomatch" } });
    await waitFor(() =>
      expect(screen.getByText("No airports found")).toBeInTheDocument()
    );
  });

  // ── selection ───────────────────────────────────────────────────────────────

  it("calls onChange with the IATA code when an airport row is clicked", async () => {
    const onChange = vi.fn();
    render(<AirportSelect {...base} onChange={onChange} />);
    fireEvent.click(screen.getByText("Select origin"));
    const row = await screen.findByText("Suvarnabhumi Airport");
    fireEvent.click(row.closest("button")!);
    expect(onChange).toHaveBeenCalledWith("BKK");
  });

  it("closes the dropdown after selecting an airport", async () => {
    render(<AirportSelect {...base} />);
    fireEvent.click(screen.getByText("Select origin"));
    const row = await screen.findByText("Suvarnabhumi Airport");
    fireEvent.click(row.closest("button")!);
    await waitFor(() =>
      expect(screen.queryByText("Popular Cities or Airports")).not.toBeInTheDocument()
    );
  });

  // ── borderless mode ─────────────────────────────────────────────────────────

  it("renders without border classes when borderless prop is true", () => {
    const { container } = render(<AirportSelect {...base} borderless />);
    const trigger = container.querySelector("button");
    expect(trigger?.className).not.toContain("border");
  });
});
