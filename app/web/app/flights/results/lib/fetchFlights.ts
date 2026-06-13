import type { Flight } from "./types";
import { buildApiUrl } from "./buildApiUrl";
import { ok, type Result } from "@/lib/result/types";
import { getJson } from "@/lib/api/httpClient";
import type { HttpError } from "@/lib/api/errors";

interface FetchParams {
  origin: string;
  destination: string;
  departure: string;
  passengers: string;
}

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

export async function fetchFlights(params: FetchParams): Promise<Result<Flight[], HttpError>> {
  if (!params.origin || !params.destination || !params.departure) {
    return ok([]);
  }

  const url = buildApiUrl(params);

  const result = await getJson<unknown>(url);
  if (!result.ok) {
    return result;
  }

  const data = result.value;

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

  return ok(flightsData.filter(isFlight));
}
