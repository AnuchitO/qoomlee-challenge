"use client";

import { useState } from "react";

export type TripType = "round" | "oneway";
export type CabinClass = "economy" | "business" | "first";

export interface FlightSearchState {
  tripType: TripType;
  origin: string;
  destination: string;
  departureDate: string | null;
  returnDate: string | null;
  passengers: number;
  cabinClass: CabinClass;
}

export interface ValidationErrors {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
}

export interface UseFlightSearch {
  state: FlightSearchState;
  errors: ValidationErrors;
  setTripType: (t: TripType) => void;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  setDepartureDate: (d: string | null) => void;
  setReturnDate: (d: string | null) => void;
  setPassengers: (n: number) => void;
  setCabinClass: (c: CabinClass) => void;
  swapAirports: () => void;
  validate: () => boolean;
  buildSearchUrl: () => string;
  applyScenario: (scenario: FlightSearchState) => void;
}

function computeErrors(state: FlightSearchState): ValidationErrors {
  const errs: ValidationErrors = {};

  if (!state.origin.trim()) {
    errs.origin = "Please enter a departure city or airport";
  }
  if (!state.destination.trim()) {
    errs.destination = "Please enter an arrival city or airport";
  } else if (state.destination === state.origin) {
    errs.destination = "Destination must differ from origin";
  }
  if (!state.departureDate) {
    errs.departureDate = "Please select a departure date";
  }
  if (state.tripType === "round") {
    if (!state.returnDate) {
      errs.returnDate = "Please select a return date";
    } else if (state.departureDate && state.returnDate <= state.departureDate) {
      errs.returnDate = "Return date must be after departure date";
    }
  }

  return errs;
}

export function useFlightSearch(): UseFlightSearch {
  const [state, setState] = useState<FlightSearchState>({
    tripType: "oneway",
    origin: "",
    destination: "",
    departureDate: null,
    returnDate: null,
    passengers: 1,
    cabinClass: "economy",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const setTripType = (tripType: TripType) => setState((s) => ({ ...s, tripType }));

  const setOrigin = (origin: string) => setState((s) => ({ ...s, origin: origin.toUpperCase() }));

  const setDestination = (destination: string) =>
    setState((s) => ({ ...s, destination: destination.toUpperCase() }));

  const setDepartureDate = (departureDate: string | null) =>
    setState((s) => ({ ...s, departureDate }));

  const setReturnDate = (returnDate: string | null) => setState((s) => ({ ...s, returnDate }));

  const setPassengers = (passengers: number) => setState((s) => ({ ...s, passengers }));

  const setCabinClass = (cabinClass: CabinClass) => setState((s) => ({ ...s, cabinClass }));

  const swapAirports = () =>
    setState((s) => ({
      ...s,
      origin: s.destination,
      destination: s.origin,
    }));

  const validate = (): boolean => {
    const errs = computeErrors(state);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const applyScenario = (scenario: FlightSearchState) => {
    setState(scenario);
    setErrors({});
  };

  const buildSearchUrl = (): string => {
    const parts: string[] = [
      `origin=${encodeURIComponent(state.origin)}`,
      `destination=${encodeURIComponent(state.destination)}`,
      `departure=${encodeURIComponent(state.departureDate ?? "")}`,
    ];
    if (state.tripType === "round" && state.returnDate) {
      parts.push(`return=${encodeURIComponent(state.returnDate)}`);
    }
    parts.push(`passengers=${state.passengers}`, `cabin=${encodeURIComponent(state.cabinClass)}`);
    return `/flights/results?${parts.join("&")}`;
  };

  return {
    state,
    errors,
    setTripType,
    setOrigin,
    setDestination,
    setDepartureDate,
    setReturnDate,
    setPassengers,
    setCabinClass,
    swapAirports,
    validate,
    buildSearchUrl,
    applyScenario,
  };
}
