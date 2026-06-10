import { findAirport } from "../../../flights/data/airports";

export interface FlightData {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  basePriceMinor: number;
  currency: string;
}

function formatDepartureDateTime(iso: string): string {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${datePart} · ${timePart}`;
}

export default function FlightSummaryCard({ flight }: { flight: FlightData }) {
  const originAirport = findAirport(flight.origin);
  const destAirport = findAirport(flight.destination);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-md pt-md pb-sm border-b border-outline-variant/40">
        <span className="text-label-sm text-on-surface-variant">Flight Summary</span>
        <span className="text-label-sm text-on-surface-variant font-medium">
          {flight.flightNumber}
        </span>
      </div>

      <div className="px-md pt-sm pb-md">
        {/* Route */}
        <div className="flex items-center gap-xs mt-sm mb-sm">
          <div className="flex-1 min-w-0">
            <p className="text-headline-md">{flight.origin}</p>
            <p className="text-label-sm text-on-surface-variant truncate">
              {originAirport?.city ?? flight.origin}
            </p>
          </div>

          <div className="flex flex-col items-center px-sm flex-shrink-0 w-16">
            <div className="w-full flex items-center">
              <div className="flex-1 border-t-2 border-dashed border-outline-variant"></div>
              <span className="material-symbols-outlined text-primary text-[20px] rotate-90 mx-1">
                flight
              </span>
              <div className="flex-1 border-t-2 border-dashed border-outline-variant"></div>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <p className="text-headline-md">{flight.destination}</p>
            <p className="text-label-sm text-on-surface-variant truncate">
              {destAirport?.city ?? flight.destination}
            </p>
          </div>
        </div>

        {/* Date / time */}
        <div className="flex items-center gap-sm pt-sm border-t border-outline-variant/40">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">
            calendar_today
          </span>
          <span className="text-label-md text-on-surface">
            {formatDepartureDateTime(flight.departureTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
