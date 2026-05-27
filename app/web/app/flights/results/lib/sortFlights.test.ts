import { describe, it, expect } from "vitest";
import { sortFlights } from "./sortFlights";
import type { Flight } from "./types";

const makeFlight = (overrides: Partial<Flight>): Flight => ({
  id: 1,
  flightNumber: "QM101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-06-15T01:00:00Z",
  arrivalTime: "2026-06-15T04:30:00Z",
  basePriceMinor: 350000,
  currency: "THB",
  availableSeats: 100,
  status: "SCHEDULED",
  durationMinutes: 210,
  ...overrides,
});

const cheap = makeFlight({ id: 1, basePriceMinor: 200000, departureTime: "2026-06-15T03:00:00Z", durationMinutes: 300 });
const mid   = makeFlight({ id: 2, basePriceMinor: 350000, departureTime: "2026-06-15T01:00:00Z", durationMinutes: 210 });
const pricey= makeFlight({ id: 3, basePriceMinor: 500000, departureTime: "2026-06-15T02:00:00Z", durationMinutes: 150 });

describe("sortFlights", () => {
  it("sorts by price ascending", () => {
    const sorted = sortFlights([pricey, cheap, mid], "price");

    expect(sorted[0].basePriceMinor).toBe(200000);
    expect(sorted[1].basePriceMinor).toBe(350000);
    expect(sorted[2].basePriceMinor).toBe(500000);
  });

  it.skip("sorts by departure time ascending", () => {
    const sorted = sortFlights([cheap, pricey, mid], "departure");

    expect(sorted[0].id).toBe(mid.id);   // 01:00
    expect(sorted[1].id).toBe(pricey.id); // 02:00
    expect(sorted[2].id).toBe(cheap.id);  // 03:00
  });

  it.skip("sorts by duration ascending (shortest first)", () => {
    const sorted = sortFlights([cheap, mid, pricey], "duration");

    expect(sorted[0].durationMinutes).toBe(150);
    expect(sorted[1].durationMinutes).toBe(210);
    expect(sorted[2].durationMinutes).toBe(300);
  });

  it.skip("sorts by best: shortest duration then price", () => {
    const sorted = sortFlights([cheap, mid, pricey], "best");

    // pricey is shortest (150 min), mid next (210 min), cheap last (300 min)
    expect(sorted[0].id).toBe(pricey.id);
    expect(sorted[1].id).toBe(mid.id);
    expect(sorted[2].id).toBe(cheap.id);
  });

  it.skip("does not mutate the original array", () => {
    const original = [pricey, cheap, mid];
    const copy = [...original];
    sortFlights(original, "price");
    expect(original).toEqual(copy);
  });
});
