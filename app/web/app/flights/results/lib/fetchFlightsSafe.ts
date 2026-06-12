import type { Flight } from "./types";
import { buildApiUrl } from "./buildApiUrl";
import { isValidFlight, safeParseArray } from "@/lib/types/safe-types";
import { AppError, ValidationError } from "@/lib/errors/AppError";

interface FetchParams {
  origin: string;
  destination: string;
  departure: string;
  passengers: string;
}

export async function fetchFlightsSafe(params: FetchParams): Promise<Flight[]> {
  if (!params.origin || !params.destination || !params.departure) {
    throw new ValidationError("Missing required flight search parameters", "search");
  }

  const url = buildApiUrl(params);

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new AppError(
        `API responded with status ${res.status}: ${res.statusText}`,
        "FETCH_FLIGHTS_NETWORK_ERROR",
        { status: res.status, url },
      );
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
      throw new AppError("Invalid API response format", "INVALID_API_RESPONSE", { data });
    }

    return safeParseArray(flightsData, isValidFlight);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Network error during flight fetch", "FETCH_FLIGHTS_NETWORK_ERROR", {
      originalError: err,
      url,
    });
  }
}
