import type { Flight } from "../lib/types";
import { formatDuration } from "../lib/formatSearchSummary";

interface Props {
  flight: Flight;
  passengers: number;
  isBestValue?: boolean;
  onSelect: (flight: Flight) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

function isNextDay(departure: string, arrival: string): boolean {
  const dep = new Date(departure).toISOString().slice(0, 10);
  const arr = new Date(arrival).toISOString().slice(0, 10);
  return arr > dep;
}

function formatPrice(minor: number, currency: string): string {
  const major = minor / 100;
  if (currency === "THB") return `฿${major.toLocaleString()}`;
  return `${currency} ${(major).toLocaleString()}`;
}

export default function FlightCard({
  flight,
  passengers,
  isBestValue = false,
  onSelect,
}: Props) {
  const nextDay = isNextDay(flight.departureTime, flight.arrivalTime);
  const totalPrice = formatPrice(flight.basePriceMinor * passengers, flight.currency);
  const perPerson = formatPrice(flight.basePriceMinor, flight.currency);

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
              <p className="text-label-sm text-on-surface-variant">
                {flight.flightNumber}
              </p>
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
                {perPerson}{" "}
                <span className="text-label-sm text-on-surface-variant">
                  /person
                </span>
              </p>
              {passengers > 1 && (
                <p className="text-label-sm text-on-surface-variant">
                  {totalPrice} total
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Journey */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-headline-md">{formatTime(flight.departureTime)}</p>
            <p className="text-label-md text-on-surface-variant">{flight.origin}</p>
          </div>
          <div className="flex-[2] flex flex-col items-center px-md">
            <p className="text-label-sm text-on-surface-variant mb-1">
              {formatDuration(flight.durationMinutes)}
            </p>
            <div className="w-full h-px bg-outline-variant relative flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl bg-surface-container-lowest px-1">
                flight
              </span>
            </div>
            <p className="text-label-sm text-[#008544] mt-1 font-bold">
              Non-stop
            </p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-headline-md">
              {formatTime(flight.arrivalTime)}
              {nextDay && (
                <span className="text-sm align-top text-error ml-0.5">+1</span>
              )}
            </p>
            <p className="text-label-md text-on-surface-variant">
              {flight.destination}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-md border-t border-outline-variant/30">
          <div className="flex gap-md text-on-surface-variant">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">
                luggage
              </span>
              <span className="text-label-sm">20kg</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">
                airline_seat_recline_normal
              </span>
              <span className="text-label-sm capitalize">{flight.status === "SCHEDULED" ? "Economy" : flight.status}</span>
            </div>
          </div>
          <button
            onClick={() => onSelect(flight)}
            className="bg-primary-container text-on-primary-container px-lg py-2 rounded-xl text-label-md flex items-center gap-xs active:scale-95 transition-all shadow-sm"
          >
            Select{" "}
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
