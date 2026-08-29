import { formatTHB } from "@/lib/currency/format";
import { formatFlightTime } from "@/lib/flight/dateTime";

export interface OutboundSummary {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  price: number;
  currency: string;
}

interface Props {
  step?: "outbound" | "return" | null;
  outbound?: OutboundSummary;
}

export default function RoundTripProgress({ step, outbound }: Props) {
  if (step !== "outbound" && step !== "return") return null;

  const isOutbound = step === "outbound";

  return (
    <div className="mb-md space-y-sm">
      <div className="flex items-center gap-sm">
        <div className="flex-1 h-1.5 rounded-full bg-primary" />
        <div
          className={`flex-1 h-1.5 rounded-full ${isOutbound ? "bg-outline-variant" : "bg-primary"}`}
        />
      </div>
      <p className="text-label-md text-on-surface-variant">
        {isOutbound
          ? "Step 1 of 2 — Select departure flight"
          : "Step 2 of 2 — Select return flight"}
      </p>

      {!isOutbound && outbound && (
        <div className="bg-success-container/50 border border-success/30 rounded-xl p-md flex items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-on-success-container text-[20px]">
              flight_takeoff
            </span>
            <div>
              <p className="text-label-sm font-semibold text-on-success-container">
                Outbound selected · {outbound.flightNumber}
              </p>
              <p className="text-label-sm text-on-success-container">
                {outbound.origin} → {outbound.destination} ·{" "}
                {formatFlightTime(outbound.departureTime)}
              </p>
            </div>
          </div>
          <p className="text-label-md font-semibold text-on-success-container">
            {formatTHB(outbound.price / 100)}
          </p>
        </div>
      )}
    </div>
  );
}
