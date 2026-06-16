import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FlightList from "./FlightList";
import type { Flight } from "../_internal/types";
import * as sortFlightsModule from "../_internal/sortFlights";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const makeFlight = (overrides: Partial<Flight> = {}): Flight => ({
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
  ...overrides,
});

beforeEach(() => {
  mockPush.mockClear();
});

describe("FlightList — rendering", () => {
  it("renders a flight card for each flight in the list", () => {
    render(
      <FlightList
        flights={[
          makeFlight({ id: 1, flightNumber: "QQ101" }),
          makeFlight({ id: 2, flightNumber: "QQ201" }),
        ]}
        passengers={1}
      />,
    );

    expect(screen.getByText("QQ101")).toBeInTheDocument();
    expect(screen.getByText("QQ201")).toBeInTheDocument();
  });

  it("shows empty state when no flights are provided", () => {
    render(<FlightList flights={[]} passengers={1} />);

    expect(screen.getByText("No flights found for this route.")).toBeInTheDocument();
  });

  it("shows the price on each flight card", () => {
    render(<FlightList flights={[makeFlight({ basePriceMinor: 810000 })]} passengers={1} />);
    // 810000 minor = ฿8,100
    expect(screen.getByText(/8[,.]?100/)).toBeInTheDocument();
  });

  it("renders filter chips", () => {
    render(<FlightList flights={[makeFlight()]} passengers={1} />);

    expect(screen.getByRole("button", { name: "Best" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Price" })).toBeInTheDocument();
  });
});

describe("FlightList — performance: memoized sorting", () => {
  it("does not re-sort when re-rendering for a reason unrelated to flights or sortBy", () => {
    const sortSpy = vi.spyOn(sortFlightsModule, "sortFlights");
    const flights = Array.from({ length: 6 }, (_, i) =>
      makeFlight({ id: i + 1, flightNumber: `QQ${100 + i}` }),
    );
    render(<FlightList flights={flights} passengers={1} />);
    const callsAfterMount = sortSpy.mock.calls.length;

    // Clicking "Show more results" changes `visible` state, not flights/sortBy.
    fireEvent.click(screen.getByRole("button", { name: /Show \d+ more results/ }));

    expect(sortSpy).toHaveBeenCalledTimes(callsAfterMount);

    sortSpy.mockRestore();
  });
});

describe("FlightList — Select → booking URL contract", () => {
  it("navigates to /bookings/new when Select is clicked", () => {
    render(<FlightList flights={[makeFlight()]} passengers={1} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush.mock.calls[0]![0]).toContain("/bookings/new");
  });

  it("includes flightId in the booking URL", () => {
    render(<FlightList flights={[makeFlight({ id: 42 })]} passengers={1} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush.mock.calls[0]![0]).toContain("flightId=42");
  });

  it("includes flightNumber in the booking URL", () => {
    render(<FlightList flights={[makeFlight({ flightNumber: "QQ999" })]} passengers={1} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush.mock.calls[0]![0]).toContain("flightNumber=QQ999");
  });

  it("includes origin in the booking URL", () => {
    render(<FlightList flights={[makeFlight({ origin: "BKK" })]} passengers={1} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush.mock.calls[0]![0]).toContain("origin=BKK");
  });

  it("includes destination in the booking URL", () => {
    render(<FlightList flights={[makeFlight({ destination: "NRT" })]} passengers={1} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush.mock.calls[0]![0]).toContain("destination=NRT");
  });

  it("includes encoded departureTime in the booking URL", () => {
    render(
      <FlightList
        flights={[makeFlight({ departureTime: "2026-10-24T08:00:00Z" })]}
        passengers={1}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush.mock.calls[0]![0]).toContain("departureTime=");
    expect(mockPush.mock.calls[0]![0]).toContain(encodeURIComponent("2026-10-24T08:00:00Z"));
  });

  it("includes price (basePriceMinor) in the booking URL", () => {
    render(<FlightList flights={[makeFlight({ basePriceMinor: 990000 })]} passengers={1} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush.mock.calls[0]![0]).toContain("price=990000");
  });

  it("includes currency in the booking URL", () => {
    render(<FlightList flights={[makeFlight({ currency: "THB" })]} passengers={1} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush.mock.calls[0]![0]).toContain("currency=THB");
  });

  it("passes the passenger count to the booking URL", () => {
    render(<FlightList flights={[makeFlight()]} passengers={3} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(mockPush.mock.calls[0]![0]).toContain("passengers=3");
  });

  it("does not include step params when no step is provided (one-way)", () => {
    render(<FlightList flights={[makeFlight()]} passengers={1} />);

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).not.toContain("outboundFlightId");
    expect(url).not.toContain("step=");
  });

  it("uses the clicked flight's data, not another flight's", () => {
    // durationMinutes differs so "best" sort is deterministic: f1 (120 min) first, f2 (300 min) second
    const f1 = makeFlight({
      id: 1,
      flightNumber: "QQ101",
      basePriceMinor: 810000,
      durationMinutes: 120,
    });
    const f2 = makeFlight({
      id: 2,
      flightNumber: "QQ202",
      basePriceMinor: 720000,
      durationMinutes: 300,
    });
    render(<FlightList flights={[f1, f2]} passengers={1} />);
    const selectButtons = screen.getAllByRole("button", { name: /select/i });

    fireEvent.click(selectButtons[1]!); // click second card (f2)

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).toContain("flightId=2");
    expect(url).toContain("flightNumber=QQ202");
    expect(url).toContain("price=720000");
  });
});

describe("FlightList — round-trip: outbound step", () => {
  const returnStepParams = {
    origin: "BKK",
    destination: "SIN",
    departure: "2026-06-20",
    cabin: "economy",
  };

  it("navigates to /flights/results with step=return when an outbound flight is selected", () => {
    render(
      <FlightList
        flights={[
          makeFlight({
            id: 1,
            flightNumber: "QM101",
            origin: "BKK",
            destination: "SIN",
            departureTime: "2026-06-15T08:00:00Z",
            basePriceMinor: 420000,
            currency: "THB",
          }),
        ]}
        passengers={1}
        step="outbound"
        returnStepParams={returnStepParams}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).toContain("/flights/results?");
    expect(url).toContain("step=return");
  });

  it("swaps origin and destination for the return search", () => {
    render(
      <FlightList
        flights={[makeFlight({ origin: "BKK", destination: "SIN" })]}
        passengers={1}
        step="outbound"
        returnStepParams={returnStepParams}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).toContain("origin=SIN");
    expect(url).toContain("destination=BKK");
    expect(url).toContain("departure=2026-06-20");
  });

  it("carries the selected outbound flight's details forward", () => {
    render(
      <FlightList
        flights={[
          makeFlight({
            id: 1,
            flightNumber: "QM101",
            origin: "BKK",
            destination: "SIN",
            departureTime: "2026-06-15T08:00:00Z",
            basePriceMinor: 420000,
            currency: "THB",
          }),
        ]}
        passengers={2}
        step="outbound"
        returnStepParams={returnStepParams}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).toContain("outboundFlightId=1");
    expect(url).toContain("outboundFlightNumber=QM101");
    expect(url).toContain("outboundOrigin=BKK");
    expect(url).toContain("outboundDestination=SIN");
    expect(url).toContain(encodeURIComponent("2026-06-15T08:00:00Z"));
    expect(url).toContain("outboundPrice=420000");
    expect(url).toContain("outboundCurrency=THB");
    expect(url).toContain("passengers=2");
    expect(url).toContain("cabin=economy");
  });
});

describe("FlightList — round-trip: return step", () => {
  const outboundParams = {
    outboundFlightId: "1",
    outboundFlightNumber: "QM101",
    outboundOrigin: "BKK",
    outboundDestination: "SIN",
    outboundDepartureTime: "2026-06-15T08:00:00Z",
    outboundPrice: "420000",
    outboundCurrency: "THB",
  };

  it("navigates to /bookings/new with both legs when a return flight is selected", () => {
    render(
      <FlightList
        flights={[
          makeFlight({
            id: 2,
            flightNumber: "QM202",
            origin: "SIN",
            destination: "BKK",
            departureTime: "2026-06-20T08:00:00Z",
            basePriceMinor: 390000,
            currency: "THB",
          }),
        ]}
        passengers={1}
        step="return"
        outboundParams={outboundParams}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    const url = mockPush.mock.calls[0]![0] as string;
    expect(url).toContain("/bookings/new?");
    expect(url).toContain("outboundFlightId=1");
    expect(url).toContain("outboundFlightNumber=QM101");
    expect(url).toContain("returnFlightId=2");
    expect(url).toContain("returnFlightNumber=QM202");
    expect(url).toContain("returnOrigin=SIN");
    expect(url).toContain("returnDestination=BKK");
    expect(url).toContain(encodeURIComponent("2026-06-20T08:00:00Z"));
    expect(url).toContain("returnPrice=390000");
    expect(url).toContain("currency=THB");
    expect(url).toContain("passengers=1");
  });
});
