import type { Flight } from "./flight";

// Enhanced flight validation with more specific checks
export function isValidFlight(data: unknown): data is Flight {
  if (typeof data !== "object" || data === null) return false;

  const flight = data as Record<string, unknown>;

  // Check required properties exist and have correct types
  return (
    typeof flight.id === "number" &&
    Number.isInteger(flight.id) &&
    typeof flight.flightNumber === "string" &&
    flight.flightNumber.trim().length > 0 &&
    typeof flight.origin === "string" &&
    flight.origin.trim().length === 3 && // Assuming IATA code format
    typeof flight.destination === "string" &&
    flight.destination.trim().length === 3 && // Assuming IATA code format
    typeof flight.departureTime === "string" &&
    !isNaN(Date.parse(flight.departureTime)) && // Valid ISO date string
    typeof flight.arrivalTime === "string" &&
    !isNaN(Date.parse(flight.arrivalTime)) && // Valid ISO date string
    typeof flight.basePriceMinor === "number" &&
    Number.isInteger(flight.basePriceMinor) &&
    flight.basePriceMinor >= 0 &&
    typeof flight.currency === "string" &&
    flight.currency.length === 3 && // ISO currency code
    typeof flight.availableSeats === "number" &&
    Number.isInteger(flight.availableSeats) &&
    flight.availableSeats >= 0 &&
    typeof flight.status === "string" &&
    ["SCHEDULED", "DELAYED", "CANCELLED"].includes(flight.status) &&
    typeof flight.durationMinutes === "number" &&
    Number.isInteger(flight.durationMinutes) &&
    flight.durationMinutes >= 0
  );
}

// Generic safe parser for API responses
export function safeParseArray<T>(data: unknown, validator: (item: unknown) => item is T): T[] {
  if (!Array.isArray(data)) {
    console.warn("Expected array but got:", typeof data);
    return [];
  }

  const validItems: T[] = [];
  const invalidItems: unknown[] = [];

  for (const item of data) {
    if (validator(item)) {
      validItems.push(item);
    } else {
      invalidItems.push(item);
    }
  }

  if (invalidItems.length > 0) {
    console.warn(`Found ${invalidItems.length} invalid items in array:`, invalidItems);
  }

  return validItems;
}
