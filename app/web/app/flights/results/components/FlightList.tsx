"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Flight, SortBy } from "../lib/types";
import { sortFlights } from "../lib/sortFlights";
import FilterChips from "./FilterChips";
import FlightCard from "./FlightCard";

const PAGE_SIZE = 5;

interface Props {
  flights: Flight[];
  passengers: number;
}

export default function FlightList({ flights, passengers }: Props) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortBy>("best");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const sorted = sortFlights(flights, sortBy);
  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  const handleSelect = (flight: Flight) => {
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
