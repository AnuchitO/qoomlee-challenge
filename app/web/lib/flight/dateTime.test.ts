import { describe, it, expect } from "vitest";
import { formatFlightTime, isNextDay, formatDepartureDateTime } from "./dateTime";

describe("formatFlightTime", () => {
  it("formats an ISO timestamp as 24-hour HH:MM in the local timezone", () => {
    const iso = "2026-06-15T08:05:00Z";
    const expected = new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    expect(formatFlightTime(iso)).toBe(expected);
  });
});

describe("isNextDay", () => {
  it("returns false when departure and arrival are on the same local day", () => {
    expect(isNextDay("2026-06-15T08:00:00Z", "2026-06-15T10:00:00Z")).toBe(false);
  });

  it("returns true when arrival falls on a later local day than departure", () => {
    const departure = new Date(2026, 5, 15, 23, 0).toISOString();
    const arrival = new Date(2026, 5, 16, 1, 0).toISOString();

    expect(isNextDay(departure, arrival)).toBe(true);
  });
});

describe("formatDepartureDateTime", () => {
  it("formats an ISO timestamp as 'MMM D, YYYY · HH:MM' in UTC", () => {
    expect(formatDepartureDateTime("2026-06-15T08:05:00Z")).toBe("Jun 15, 2026 · 08:05");
  });
});
