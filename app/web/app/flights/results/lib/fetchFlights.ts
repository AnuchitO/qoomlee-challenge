import type { Flight } from "./types";
import { buildApiUrl } from "./buildApiUrl";

interface FetchParams {
  origin: string;
  destination: string;
  departure: string;
  passengers: string;
}

export async function fetchFlights(params: FetchParams): Promise<Flight[]> {
  if (!params.origin || !params.destination || !params.departure) {
    // Return empty array to maintain backward compatibility with existing tests
    return [];
  }

  const url = buildApiUrl(params);

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error(`fetchFlights: API responded with status ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Handle both direct array and object with flights property
    let flightsData: unknown[];
    if (Array.isArray(data)) {
      flightsData = data;
    } else if (
      typeof data === "object" &&
      data !== null &&
      Array.isArray((data as { flights?: unknown }).flights)
    ) {
      flightsData = (data as { flights: unknown[] }).flights;
    } else {
      flightsData = [];
    }

    // Original validation approach
    function isFlight(value: unknown): value is Flight {
      if (typeof value !== "object" || value === null) return false;
      const f = value as Record<string, unknown>;
      return (
        typeof f.id === "number" &&
        typeof f.flightNumber === "string" &&
        typeof f.origin === "string" &&
        typeof f.destination === "string" &&
        typeof f.departureTime === "string" &&
        typeof f.arrivalTime === "string" &&
        typeof f.basePriceMinor === "number" &&
        typeof f.currency === "string" &&
        typeof f.availableSeats === "number" &&
        typeof f.status === "string" &&
        typeof f.durationMinutes === "number"
      );
    }

    return flightsData.filter(isFlight);
  } catch (err) {
    console.error("fetchFlights: network error", err);
    return [];
  }
}
