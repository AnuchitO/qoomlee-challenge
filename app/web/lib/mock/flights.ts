export type FlightStatus = "on-time" | "delayed" | "cancelled" | "landed";

export interface FlightStatusCard {
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  status: FlightStatus;
  delay?: string;
  gate?: string;
  terminal?: string;
}

export const mockDepartures: FlightStatusCard[] = [
  {
    flightNumber: "QQ101",
    origin: "BKK",
    destination: "SYD",
    departure: "08:00",
    arrival: "16:30",
    status: "on-time",
    gate: "F12",
    terminal: "1",
  },
  {
    flightNumber: "QQ203",
    origin: "BKK",
    destination: "CNX",
    departure: "09:45",
    arrival: "10:55",
    status: "delayed",
    delay: "Delayed 45 min — New departure: 10:30",
    gate: "G7",
    terminal: "2",
  },
  {
    flightNumber: "QQ305",
    origin: "BKK",
    destination: "HKT",
    departure: "11:20",
    arrival: "12:25",
    status: "on-time",
    gate: "B3",
    terminal: "1",
  },
  {
    flightNumber: "QQ407",
    origin: "BKK",
    destination: "NRT",
    departure: "13:00",
    arrival: "21:30",
    status: "on-time",
    gate: "A9",
    terminal: "1",
  },
];

export interface FlightAlternative {
  id: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  price: number;
  diff: string;
}

export const mockFlightAlternatives: FlightAlternative[] = [
  {
    id: "QQ105",
    flightNumber: "QQ105",
    departure: "10:30",
    arrival: "19:00",
    duration: "8h 30m",
    stops: "Non-stop",
    price: 0,
    diff: "Same price",
  },
  {
    id: "QQ107",
    flightNumber: "QQ107",
    departure: "14:00",
    arrival: "22:30",
    duration: "8h 30m",
    stops: "Non-stop",
    price: -1200,
    diff: "฿1,200 cheaper",
  },
  {
    id: "QQ109",
    flightNumber: "QQ109",
    departure: "20:00",
    arrival: "07:30+1",
    duration: "11h 30m",
    stops: "1 stop (SIN)",
    price: -2500,
    diff: "฿2,500 cheaper",
  },
];

export function getFlightAlternatives(ref: string): FlightAlternative[] {
  void ref;
  return mockFlightAlternatives;
}
