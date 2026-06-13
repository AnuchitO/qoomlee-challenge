import type { FlightSearchState } from "../hooks/useFlightSearch";

export interface SearchScenario {
  id: string;
  label: string;
  state: FlightSearchState;
}

export const searchScenarios: SearchScenario[] = [
  {
    id: "oneway-economy",
    label: "One-way · BKK → SIN · 1 adult · Economy",
    state: {
      tripType: "oneway",
      origin: "BKK",
      destination: "SIN",
      departureDate: "2026-06-20",
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
      departureDate: "2026-06-27",
      returnDate: "2026-07-04",
      passengers: 2,
      cabinClass: "business",
    },
  },
  {
    id: "roundtrip-group-first",
    label: "Round trip · SIN → NRT · 4 adults · First",
    state: {
      tripType: "round",
      origin: "SIN",
      destination: "NRT",
      departureDate: "2026-07-10",
      returnDate: "2026-07-20",
      passengers: 4,
      cabinClass: "first",
    },
  },
];
