import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FlightSummaryCard from "./FlightSummaryCard";
import type { Flight } from "@/lib/types/flight";

const base: Flight = {
  id: 1,
  flightNumber: "QQ101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-10-24T08:00:00Z",
  arrivalTime: "2026-10-24T11:30:00Z",
  basePriceMinor: 810000,
  currency: "THB",
  availableSeats: 50,
  status: "SCHEDULED",
  durationMinutes: 210,
};

describe("FlightSummaryCard", () => {
  it("renders the 'Flight Summary' label", () => {
    render(<FlightSummaryCard flight={base} />);
    expect(screen.getByText("Flight Summary")).toBeInTheDocument();
  });

  it("renders the flight number", () => {
    render(<FlightSummaryCard flight={base} />);
    expect(screen.getByText("QQ101")).toBeInTheDocument();
  });

  it("renders origin and destination IATA codes", () => {
    render(<FlightSummaryCard flight={base} />);
    expect(screen.getByText("BKK")).toBeInTheDocument();
    expect(screen.getByText("SIN")).toBeInTheDocument();
  });

  it("renders city names for known airports", () => {
    render(<FlightSummaryCard flight={base} />);
    expect(screen.getByText("Bangkok")).toBeInTheDocument();
    expect(screen.getByText("Singapore")).toBeInTheDocument();
  });

  it("falls back to the IATA code as city name for unknown airports", () => {
    render(<FlightSummaryCard flight={{ ...base, origin: "SYD", destination: "LAX" }} />);
    // Each unknown code appears twice: once as the large route label, once as the city fallback
    expect(screen.getAllByText("SYD")).toHaveLength(2);
    expect(screen.getAllByText("LAX")).toHaveLength(2);
  });

  it("renders the departure date", () => {
    render(<FlightSummaryCard flight={base} />);
    // Date is formatted in UTC; Oct 24, 2026
    expect(screen.getByText(/Oct 24, 2026/)).toBeInTheDocument();
  });

  it("renders the departure time in 24h UTC format", () => {
    render(<FlightSummaryCard flight={base} />);
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
  });

  it("renders correctly for a midnight departure", () => {
    render(<FlightSummaryCard flight={{ ...base, departureTime: "2026-12-01T00:00:00Z" }} />);
    expect(screen.getByText(/Dec 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });
});
