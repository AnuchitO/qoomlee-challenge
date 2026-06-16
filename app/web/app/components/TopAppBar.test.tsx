import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TopAppBar from "./TopAppBar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/flights",
}));

describe("TopAppBar", () => {
  it("renders the Qoomlee brand name", () => {
    render(<TopAppBar />);
    expect(screen.getByText("Qoomlee")).toBeInTheDocument();
  });

  it("renders the main navigation links", () => {
    render(<TopAppBar />);
    expect(screen.getByRole("link", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bookings" })).toBeInTheDocument();
  });
});
