import { findAirport } from "../../../flights/data/airports";
import FlightRoute from "../../../components/FlightRoute";

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
        <FlightRoute
          className="mt-sm mb-sm"
          origin={flight.origin}
          destination={flight.destination}
          originLabel={originAirport?.city ?? flight.origin}
          destinationLabel={destAirport?.city ?? flight.destination}
        />

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
