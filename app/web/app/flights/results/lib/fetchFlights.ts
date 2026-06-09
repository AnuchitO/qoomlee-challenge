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
    return [];
  }
  const url = buildApiUrl(params);
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.flights ?? []);
  } catch {
    return [];
  }
}
