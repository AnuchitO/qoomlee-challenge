import { describe, it, expect } from "vitest";
import { formatSearchSummary, formatDuration } from "./formatSearchSummary";

describe("formatSearchSummary", () => {
  it("formats a round-trip summary string", () => {
    const summary = formatSearchSummary({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-06-15",
      passengers: "2",
      cabin: "business",
    });

    expect(summary).toBe("BKK → SIN · Mon Jun 15 · 2 Adults · Business");
  });

  it("uses singular 'Adult' for 1 passenger", () => {
    const summary = formatSearchSummary({
      origin: "BKK",
      destination: "SIN",
      departure: "2026-06-15",
      passengers: "1",
      cabin: "economy",
    });

    expect(summary).toContain("1 Adult");
    expect(summary).not.toContain("Adults");
  });

  it("formats cabin class with proper capitalisation", () => {
    const economy = formatSearchSummary({ origin: "BKK", destination: "SIN", departure: "2026-06-15", passengers: "1", cabin: "economy" });
    const business = formatSearchSummary({ origin: "BKK", destination: "SIN", departure: "2026-06-15", passengers: "1", cabin: "business" });
    const first = formatSearchSummary({ origin: "BKK", destination: "SIN", departure: "2026-06-15", passengers: "1", cabin: "first" });

    expect(economy).toContain("Economy");
    expect(business).toContain("Business");
    expect(first).toContain("First Class");
  });
});

describe("formatDuration", () => {
  it("formats minutes into h m string", () => {
    expect(formatDuration(510)).toBe("8h 30m");
  });

  it("handles exact hours with zero minutes", () => {
    expect(formatDuration(120)).toBe("2h 0m");
  });

  it("handles sub-hour durations", () => {
    expect(formatDuration(45)).toBe("0h 45m");
  });
});
