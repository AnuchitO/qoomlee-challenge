"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Flight, SortBy } from "../_internal/types";
import { sortFlights } from "../_internal/sortFlights";
import FilterChips from "./FilterChips";
import FlightCard from "./FlightCard";

const PAGE_SIZE = 5;

interface ReturnStepParams {
  origin: string;
  destination: string;
  departure: string;
  cabin: string;
}

interface Props {
  flights: Flight[];
  passengers: number;
  step?: "outbound" | "return";
  returnStepParams?: ReturnStepParams;
  outboundParams?: Record<string, string>;
}

export default function FlightList({
  flights,
  passengers,
  step,
  returnStepParams,
  outboundParams,
}: Props) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortBy>("best");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const sorted = useMemo(() => sortFlights(flights, sortBy), [flights, sortBy]);
  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  const handleSelect = (flight: Flight) => {
    if (step === "outbound" && returnStepParams) {
      const params = new URLSearchParams({
        origin: returnStepParams.destination,
        destination: returnStepParams.origin,
        departure: returnStepParams.departure,
        step: "return",
        outboundFlightId: String(flight.id),
        outboundFlightNumber: flight.flightNumber,
        outboundOrigin: flight.origin,
        outboundDestination: flight.destination,
        outboundDepartureTime: flight.departureTime,
        outboundPrice: String(flight.basePriceMinor),
        outboundCurrency: flight.currency,
        passengers: String(passengers),
        cabin: returnStepParams.cabin,
      });
      router.push(`/flights/results?${params.toString()}`);
      return;
    }

    if (step === "return" && outboundParams) {
      const params = new URLSearchParams({
        ...outboundParams,
        returnFlightId: String(flight.id),
        returnFlightNumber: flight.flightNumber,
        returnOrigin: flight.origin,
        returnDestination: flight.destination,
        returnDepartureTime: flight.departureTime,
        returnPrice: String(flight.basePriceMinor),
        currency: flight.currency,
        passengers: String(passengers),
      });
      router.push(`/bookings/new?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams({
      flightId: String(flight.id),
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      price: String(flight.basePriceMinor),
      currency: flight.currency,
      passengers: String(passengers),
    });
    router.push(`/bookings/new?${params.toString()}`);
  };

  return (
    <>
      <FilterChips total={flights.length} onSortChange={setSortBy} />

      <div className="space-y-md mt-sm">
        {shown.map((flight, idx) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            passengers={passengers}
            isBestValue={idx === 0 && sortBy === "best"}
            onSelect={handleSelect}
          />
        ))}

        {flights.length === 0 && (
          <div className="py-xxl flex flex-col items-center gap-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px]">flight_land</span>
            <p className="text-body-md">No flights found for this route.</p>
          </div>
        )}

        {hasMore && (
          <div className="py-xl flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="border border-primary text-primary px-xxl py-md rounded-xl text-label-md hover:bg-surface-container-high active:scale-95 transition-all"
            >
              Show {Math.min(PAGE_SIZE, sorted.length - visible)} more results
            </button>
          </div>
        )}
      </div>
    </>
  );
}
