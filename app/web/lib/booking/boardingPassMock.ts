export interface BoardingPass {
  ref: string;
  passenger: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  date: string;
  seat: string;
  gate: string;
  boarding: string;
  cabin: string;
}

export const mockBoardingPasses: BoardingPass[] = [
  {
    ref: "QM92Z4",
    passenger: "Jonathan S. Doe",
    flightNumber: "QQ101",
    origin: "BKK",
    destination: "SYD",
    departure: "09:15",
    arrival: "20:45",
    date: "Mon, 20 May 2024",
    seat: "14A",
    gate: "F12",
    boarding: "08:10",
    cabin: "ECO",
  },
  {
    ref: "QM92Z5",
    passenger: "Sarah M. Doe",
    flightNumber: "QQ101",
    origin: "BKK",
    destination: "SYD",
    departure: "09:15",
    arrival: "20:45",
    date: "Mon, 20 May 2024",
    seat: "14B",
    gate: "F12",
    boarding: "08:10",
    cabin: "ECO",
  },
];
