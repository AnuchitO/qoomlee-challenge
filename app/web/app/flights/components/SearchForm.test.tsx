import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchForm from "./SearchForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/flights",
  useSearchParams: () => new URLSearchParams(),
}));

// SearchForm renders AirportSelect which uses createPortal for its dropdown
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

describe("SearchForm — layout", () => {
  it("renders From and To field labels", () => {
    render(<SearchForm />);
    expect(screen.getAllByText("From").length).toBeGreaterThan(0);
    expect(screen.getAllByText("To").length).toBeGreaterThan(0);
  });

  it("renders the Search Flights button", () => {
    render(<SearchForm />);
    expect(screen.getAllByRole("button", { name: /search flights/i }).length).toBeGreaterThan(0);
  });

  it("renders One way and Round trip trip-type options", () => {
    render(<SearchForm />);
    expect(screen.getAllByText("One way").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Round trip").length).toBeGreaterThan(0);
  });
});

describe("SearchForm — validation", () => {
  it("shows a validation error when Search Flights is clicked with no origin selected", () => {
    render(<SearchForm />);
    fireEvent.click(screen.getAllByRole("button", { name: /search flights/i })[0]!);
    expect(screen.getAllByText("Please enter a departure city or airport")[0]).toBeInTheDocument();
  });
});
