export interface Passenger {
  id: string;
  name: string;
  seat: string;
  cabin: string;
  type?: string;
  eligible?: boolean;
  gate?: string;
  bags?: number;
}

export const mockCheckinPassengers: Passenger[] = [
  { id: "1", name: "Jonathan Doe", type: "Adult", seat: "14A", cabin: "Economy", eligible: true },
  { id: "2", name: "Sarah Doe", type: "Adult", seat: "14B", cabin: "Economy", eligible: true },
];

export const mockReviewPassengers: Passenger[] = [
  { id: "1", name: "Jonathan S. Doe", seat: "14A", gate: "F12", cabin: "Economy", bags: 1 },
  { id: "2", name: "Sarah M. Doe", seat: "14B", gate: "F12", cabin: "Economy", bags: 0 },
];

export function getReviewPassengers(ref: string): Passenger[] {
  void ref;
  return mockReviewPassengers;
}
