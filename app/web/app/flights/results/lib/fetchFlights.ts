import type { Flight } from "./types";
import { buildApiUrl } from "./buildApiUrl";
import { ok, err, type Result } from "@/lib/result/types";
import { logger } from "@/lib/logger/logger";
import { HttpError } from "@/lib/api/errors";

interface FetchParams {
  origin: string;
  destination: string;
  departure: string;
  passengers: string;
}

export async function fetchFlights(params: FetchParams): Promise<Result<Flight[], HttpError>> {
  if (!params.origin || !params.destination || !params.departure) {
    return ok([]);
  }

  const url = buildApiUrl(params);

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const message = `API responded with status ${res.status}`;
      logger.error(`fetchFlights: ${message}`, { status: res.status });
      return err(HttpError.badStatus(res.status, message));
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

    return ok(flightsData.filter(isFlight));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error("fetchFlights: network error", { error: e });
    return err(HttpError.networkError(message));
  }
}
