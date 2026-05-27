import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlightSearch } from "./useFlightSearch";

describe("useFlightSearch", () => {
  // ── default state ──────────────────────────────────────────────────────────

  it("initialises with round-trip, 1 passenger, economy", () => {
    const { result } = renderHook(() => useFlightSearch());

    expect(result.current.state.tripType).toBe("round");
    expect(result.current.state.passengers).toBe(1);
    expect(result.current.state.cabinClass).toBe("economy");
    expect(result.current.state.origin).toBe("");
    expect(result.current.state.destination).toBe("");
    expect(result.current.state.departureDate).toBeNull();
    expect(result.current.state.returnDate).toBeNull();
  });

  // ── buildSearchUrl ─────────────────────────────────────────────────────────

  it.skip("buildSearchUrl returns correct query string for a valid round trip", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setOrigin("BKK");
      result.current.setDestination("SIN");
      result.current.setDepartureDate("2026-06-15");
      result.current.setReturnDate("2026-06-22");
      result.current.setPassengers(2);
      result.current.setCabinClass("business");
    });

    const url = result.current.buildSearchUrl();
    expect(url).toBe(
      "/flights/results?origin=BKK&destination=SIN&departure=2026-06-15&return=2026-06-22&passengers=2&cabin=business"
    );
  });

  it.skip("buildSearchUrl omits returnDate for one-way trip", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setTripType("oneway");
      result.current.setOrigin("BKK");
      result.current.setDestination("SIN");
      result.current.setDepartureDate("2026-06-15");
    });

    const url = result.current.buildSearchUrl();
    expect(url).not.toContain("return=");
    expect(url).toContain("origin=BKK");
    expect(url).toContain("destination=SIN");
    expect(url).toContain("departure=2026-06-15");
  });

  // ── swapAirports ───────────────────────────────────────────────────────────

  it.skip("swapAirports exchanges origin and destination", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setOrigin("BKK");
      result.current.setDestination("SIN");
    });

    act(() => {
      result.current.swapAirports();
    });

    expect(result.current.state.origin).toBe("SIN");
    expect(result.current.state.destination).toBe("BKK");
  });

  // ── validate — happy paths ─────────────────────────────────────────────────

  it.skip("validate returns true for a complete round-trip form", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setOrigin("BKK");
      result.current.setDestination("SIN");
      result.current.setDepartureDate("2026-06-15");
      result.current.setReturnDate("2026-06-22");
    });

    expect(result.current.validate()).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it.skip("validate returns true for a complete one-way form (no return date required)", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setTripType("oneway");
      result.current.setOrigin("BKK");
      result.current.setDestination("SIN");
      result.current.setDepartureDate("2026-06-15");
    });

    expect(result.current.validate()).toBe(true);
    expect(result.current.errors.returnDate).toBeUndefined();
  });

  // ── validate — negative cases ──────────────────────────────────────────────

  it.skip("validate sets errors.origin when origin is empty", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setDestination("SIN");
      result.current.setDepartureDate("2026-06-15");
      result.current.setReturnDate("2026-06-22");
    });

    expect(result.current.validate()).toBe(false);
    expect(result.current.errors.origin).toBeDefined();
  });

  it.skip("validate sets errors.destination when destination is empty", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setOrigin("BKK");
      result.current.setDepartureDate("2026-06-15");
      result.current.setReturnDate("2026-06-22");
    });

    expect(result.current.validate()).toBe(false);
    expect(result.current.errors.destination).toBeDefined();
  });

  it.skip("validate sets errors.destination when origin equals destination", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setOrigin("BKK");
      result.current.setDestination("BKK");
      result.current.setDepartureDate("2026-06-15");
      result.current.setReturnDate("2026-06-22");
    });

    expect(result.current.validate()).toBe(false);
    expect(result.current.errors.destination).toBeDefined();
  });

  it.skip("validate sets errors.departureDate when departure date is missing", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setOrigin("BKK");
      result.current.setDestination("SIN");
      result.current.setReturnDate("2026-06-22");
    });

    expect(result.current.validate()).toBe(false);
    expect(result.current.errors.departureDate).toBeDefined();
  });

  it.skip("validate sets errors.returnDate for round trip with missing return date", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setOrigin("BKK");
      result.current.setDestination("SIN");
      result.current.setDepartureDate("2026-06-15");
      // returnDate intentionally left null
    });

    expect(result.current.validate()).toBe(false);
    expect(result.current.errors.returnDate).toBeDefined();
  });

  it.skip("validate sets errors.returnDate when return date is before departure date", () => {
    const { result } = renderHook(() => useFlightSearch());

    act(() => {
      result.current.setOrigin("BKK");
      result.current.setDestination("SIN");
      result.current.setDepartureDate("2026-06-22");
      result.current.setReturnDate("2026-06-15"); // earlier than departure
    });

    expect(result.current.validate()).toBe(false);
    expect(result.current.errors.returnDate).toBeDefined();
  });
});
