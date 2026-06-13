import type { Flight, SortBy } from "./types";

export function sortFlights(flights: Flight[], sortBy: SortBy): Flight[] {
  const copy = [...flights];

  switch (sortBy) {
    case "price":
      return copy.sort((a, b) => a.basePriceMinor - b.basePriceMinor);

    case "departure":
      return copy.sort(
        (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
      );

    case "duration":
      return copy.sort((a, b) => a.durationMinutes - b.durationMinutes);

    case "best":
    default:
      // Best = shortest duration first, then by price as tiebreaker
      return copy.sort(
        (a, b) => a.durationMinutes - b.durationMinutes || a.basePriceMinor - b.basePriceMinor,
      );
  }
}
