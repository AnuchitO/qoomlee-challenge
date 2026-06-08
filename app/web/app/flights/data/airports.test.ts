import { describe, it, expect } from "vitest";
import { AIRPORTS, findAirport } from "./airports";

describe("airports data", () => {
  describe("AIRPORTS list", () => {
    it("contains exactly 7 airports matching the seeded routes", () => {
      expect(AIRPORTS).toHaveLength(7);
    });

    it("contains all expected IATA codes", () => {
      const codes = AIRPORTS.map((a) => a.code);
      expect(codes).toContain("BKK");
      expect(codes).toContain("SIN");
      expect(codes).toContain("HKG");
      expect(codes).toContain("NRT");
      expect(codes).toContain("KUL");
      expect(codes).toContain("CGK");
      expect(codes).toContain("MNL");
    });

    it("every airport has non-empty code, name, city and country", () => {
      for (const airport of AIRPORTS) {
        expect(airport.code.length).toBeGreaterThan(0);
        expect(airport.name.length).toBeGreaterThan(0);
        expect(airport.city.length).toBeGreaterThan(0);
        expect(airport.country.length).toBeGreaterThan(0);
      }
    });
  });

  describe("findAirport", () => {
    it("returns the correct airport for a known uppercase code", () => {
      const airport = findAirport("BKK");
      expect(airport).toBeDefined();
      expect(airport?.code).toBe("BKK");
      expect(airport?.city).toBe("Bangkok");
      expect(airport?.country).toBe("Thailand");
    });

    it("is case-insensitive", () => {
      expect(findAirport("bkk")).toEqual(findAirport("BKK"));
      expect(findAirport("sin")).toEqual(findAirport("SIN"));
    });

    it("returns undefined for an unknown code", () => {
      expect(findAirport("XXX")).toBeUndefined();
    });

    it("returns undefined for an empty string", () => {
      expect(findAirport("")).toBeUndefined();
    });
  });
});
