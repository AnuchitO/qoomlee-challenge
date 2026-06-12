"use client";

import type { Flight } from "../lib/types";
import { formatDuration } from "../lib/formatSearchSummary";
import FlightRoute from "../../../components/FlightRoute";
import { formatTHB } from "@/lib/currency/currency";
import { formatFlightTime, isNextDay } from "@/lib/format/flightDateTime";

interface Props {
  flight: Flight;
  passengers: number;
  isBestValue?: boolean;
  onSelect: (flight: Flight) => void;
}

export default function FlightCard({ flight, passengers, isBestValue = false, onSelect }: Props) {
  const nextDay = isNextDay(flight.departureTime, flight.arrivalTime);
  const totalPrice = formatTHB((flight.basePriceMinor * passengers) / 100);
  const perPerson = formatTHB(flight.basePriceMinor / 100);

  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-md transition-all hover:shadow-md hover:border-primary/30 group">
      <div className="flex flex-col gap-lg">
        {/* Airline & Price */}
        <div className="flex justify-between items-start gap-sm">
          <div className="flex items-center gap-md min-w-0">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary text-3xl">
                flight_takeoff
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-headline-md">Qoomlee</h3>
              <p className="text-label-sm text-on-surface-variant">{flight.flightNumber}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-xs shrink-0">
            {isBestValue && (
              <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-md flex items-center gap-1 shadow-sm">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                Best Value
              </div>
            )}
            <div className="text-right">
              <p className="text-headline-md text-primary">
                {perPerson} <span className="text-label-sm text-on-surface-variant">/person</span>
              </p>
              {passengers > 1 && (
                <p className="text-label-sm text-on-surface-variant">{totalPrice} total</p>
              )}
            </div>
          </div>
        </div>

        {/* Journey */}
        <FlightRoute
          origin={flight.origin}
          destination={flight.destination}
          departureTime={formatFlightTime(flight.departureTime)}
          arrivalTime={formatFlightTime(flight.arrivalTime)}
          arrivalSuffix={nextDay && <span className="text-sm align-top text-error ml-0.5">+1</span>}
          duration={formatDuration(flight.durationMinutes)}
          stopLabel="Non-stop"
        />

        {/* Footer */}
        <div className="flex items-center justify-between pt-md border-t border-outline-variant/30">
          <div className="flex gap-md text-on-surface-variant">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">luggage</span>
              <span className="text-label-sm">20kg</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">
                airline_seat_recline_normal
              </span>
              <span className="text-label-sm capitalize">
                {flight.status === "SCHEDULED" ? "Economy" : flight.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => onSelect(flight)}
            className="bg-primary-container text-on-primary-container px-lg py-2 rounded-xl text-label-md flex items-center gap-xs active:scale-95 transition-all shadow-sm"
          >
            Select <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
}
