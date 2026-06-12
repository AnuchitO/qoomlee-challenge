import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchFlights } from "./fetchFlights";
import type { Flight } from "./types";

const BASE_PARAMS = {
  origin: "BKK",
  destination: "SIN",
  departure: "2026-10-24",
  passengers: "1",
};

const mockFlight: Flight = {
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

const mockFetch = (body: unknown, ok = true, status = 200) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  } as Response);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchFlights", () => {
  // ── missing params ──────────────────────────────────────────────────────────

  it("returns [] without calling fetch when origin is missing", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const result = await fetchFlights({ ...BASE_PARAMS, origin: "" });
    expect(result).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns [] without calling fetch when destination is missing", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const result = await fetchFlights({ ...BASE_PARAMS, destination: "" });
    expect(result).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns [] without calling fetch when departure is missing", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const result = await fetchFlights({ ...BASE_PARAMS, departure: "" });
    expect(result).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  // ── successful responses ────────────────────────────────────────────────────

  it("returns flights from a { flights: [...] } response envelope", async () => {
    mockFetch({ flights: [mockFlight] });
    const result = await fetchFlights(BASE_PARAMS);
    expect(result).toEqual([mockFlight]);
  });

  it("returns flights from a direct array response", async () => {
    mockFetch([mockFlight]);
    const result = await fetchFlights(BASE_PARAMS);
    expect(result).toEqual([mockFlight]);
  });

  it("returns [] when the envelope has an empty flights array", async () => {
    mockFetch({ flights: [] });
    const result = await fetchFlights(BASE_PARAMS);
    expect(result).toEqual([]);
  });

  it("returns multiple flights", async () => {
    const flight2 = { ...mockFlight, id: 2, flightNumber: "QQ102" };
    mockFetch({ flights: [mockFlight, flight2] });
    const result = await fetchFlights(BASE_PARAMS);
    expect(result).toHaveLength(2);
    expect(result[0].flightNumber).toBe("QQ101");
    expect(result[1].flightNumber).toBe("QQ102");
  });

  // ── error handling ──────────────────────────────────────────────────────────

  it("returns [] when the API responds with a non-ok status", async () => {
    mockFetch({}, false, 500);
    const result = await fetchFlights(BASE_PARAMS);
    expect(result).toEqual([]);
  });

  it("returns [] when the API responds with 404", async () => {
    mockFetch({ error: "Not found" }, false, 404);
    const result = await fetchFlights(BASE_PARAMS);
    expect(result).toEqual([]);
  });

  it("returns [] when fetch throws a network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const result = await fetchFlights(BASE_PARAMS);
    expect(result).toEqual([]);
  });

  it("logs an error when the API responds with a non-ok status", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch({}, false, 500);
    await fetchFlights(BASE_PARAMS);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("500"));
  });

  it("logs an error when fetch throws a network error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const networkError = new Error("Network error");
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(networkError);
    await fetchFlights(BASE_PARAMS);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("fetchFlights"), networkError);
  });

  it("does not log an error for a legitimately empty results envelope", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch({ flights: [] });
    await fetchFlights(BASE_PARAMS);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  // ── URL construction ────────────────────────────────────────────────────────

  it("calls fetch with origin, destination, and date params in the URL", async () => {
    const spy = mockFetch({ flights: [] });
    await fetchFlights(BASE_PARAMS);
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("origin=BKK");
    expect(url).toContain("destination=SIN");
    expect(url).toContain("date=2026-10-24");
    expect(url).toContain("passengers=1");
  });

  it("calls fetch with cache: no-store to prevent stale results", async () => {
    const spy = mockFetch({ flights: [] });
    await fetchFlights(BASE_PARAMS);
    const init = spy.mock.calls[0][1] as RequestInit;
    expect(init?.cache).toBe("no-store");
  });
});
