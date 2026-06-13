import type { FlightSearchState } from "../hooks/useFlightSearch";

export interface SearchScenario {
  id: string;
  label: string;
  state: FlightSearchState;
}

// Seed data (infra/db/qoomlee/02_seed.sql) generates flights relative to
// CURRENT_DATE, only on routes outbound from BKK, at fixed day-offset tiers
// (+0, +3, +7..13, +14/15, +35, +65, +95). Scenario dates below target those
// tiers so results stay available no matter when QQF runs.
function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const searchScenarios: SearchScenario[] = [
  {
    id: "oneway-economy-today",
    label: "One-way · BKK → SIN · 1 adult · Economy · Today",
    state: {
      tripType: "oneway",
      origin: "BKK",
      destination: "SIN",
      departureDate: addDays(0),
      returnDate: null,
      passengers: 1,
      cabinClass: "economy",
    },
  },
  {
    id: "roundtrip-business",
    label: "Round trip · BKK → HKG · 2 adults · Business",
    state: {
      tripType: "round",
      origin: "BKK",
      destination: "HKG",
      departureDate: addDays(7),
      returnDate: addDays(15),
      passengers: 2,
      cabinClass: "business",
    },
  },
  {
    id: "roundtrip-group-economy",
    label: "Round trip · BKK → NRT · 4 adults · Economy",
    state: {
      tripType: "round",
      origin: "BKK",
      destination: "NRT",
      departureDate: addDays(35),
      returnDate: addDays(65),
      passengers: 4,
      cabinClass: "economy",
    },
  },
  {
    id: "no-results",
    label: "No results · HKG → SIN · 1 adult · Economy",
    state: {
      tripType: "oneway",
      origin: "HKG",
      destination: "SIN",
      departureDate: addDays(7),
      returnDate: null,
      passengers: 1,
      cabinClass: "economy",
    },
  },
];
