/**
 * Shared test data for the uitests/ suite (not app/web/uitests/traditional/).
 * Single source of truth for passenger/card/search/flight fixtures so pages
 * and specs don't each redeclare the same literals — mocks.ts, pages/*.page.ts,
 * and every spec import from here instead of drifting independently.
 */

export const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export const DEFAULT_FLIGHT = {
  id: 1,
  flightNumber: "QQ101",
  origin: "BKK",
  destination: "SIN",
  departureTime: "2026-10-24T08:00:00Z",
  arrivalTime: "2026-10-24T09:30:00Z",
  basePriceMinor: 810000,
  currency: "THB",
  availableSeats: 50,
  status: "scheduled",
  durationMinutes: 90,
};

export const DEFAULT_SEARCH = {
  origin: DEFAULT_FLIGHT.origin,
  destination: DEFAULT_FLIGHT.destination,
  departure: DEFAULT_FLIGHT.departureTime.slice(0, 10),
};

/** Full display names as shown in the origin/destination pickers. */
const AIRPORT_NAMES: Record<string, string> = {
  BKK: "Suvarnabhumi Airport",
  SIN: "Singapore Changi Airport",
};

/** Selected-airport chip labels — a different, shorter format than AIRPORT_NAMES. */
const AIRPORT_LABELS: Record<string, string> = {
  BKK: "Bangkok (BKK)",
  SIN: "Singapore (SIN)",
};

/** Full display name for an IATA code, e.g. "BKK" → "Suvarnabhumi Airport". */
export function airportName(code: string): string {
  return AIRPORT_NAMES[code] ?? code;
}

/** Selected-airport chip label for an IATA code, e.g. "BKK" → "Bangkok (BKK)". */
export function airportLabel(code: string): string {
  return AIRPORT_LABELS[code] ?? code;
}

export const DEFAULT_PASSENGER = {
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  phone: "0812345678",
};

export type Passenger = typeof DEFAULT_PASSENGER;

export const VALID_CARD = {
  name: "Jane Smith",
  number: "4111111111111111",
  expiry: "1228",
  cvv: "123",
};

export type Card = typeof VALID_CARD;
