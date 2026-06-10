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
  status: string;
  durationMinutes: number;
}
