import { describe, it, expect } from "vitest";
import { getFlightAlternatives, mockFlightAlternatives } from "./mock";

describe("getFlightAlternatives", () => {
  it("returns the alternative flights for a booking reference", () => {
    expect(getFlightAlternatives("QM1234")).toEqual(mockFlightAlternatives);
  });
});
