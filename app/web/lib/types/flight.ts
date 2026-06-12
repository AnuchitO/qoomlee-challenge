// Statuses the qoomlee API can return; flight search only returns SCHEDULED
// (see API_SPECS.md and flight/search_repository.go).
export type FlightStatus = "SCHEDULED" | "DELAYED" | "CANCELLED";

export interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string; // ISO 8601
  arrivalTime: string; // ISO 8601
  basePriceMinor: number;
  currency: string;
  availableSeats: number;
  status: FlightStatus;
  durationMinutes: number;
}
