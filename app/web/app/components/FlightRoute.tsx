import type { ReactNode } from "react";

export type FlightRouteSize = "sm" | "md" | "lg" | "xl";

export interface FlightRouteProps {
  /** IATA code, e.g. "BKK" */
  origin: string;
  /** IATA code, e.g. "SIN" */
  destination: string;
  /** Extra label under the origin code, e.g. city or airport name */
  originLabel?: string;
  /** Extra label under the destination code, e.g. city or airport name */
  destinationLabel?: string;
  departureTime?: string;
  arrivalTime?: string;
  /** Rendered after the arrival time, e.g. a "+1" next-day indicator */
  arrivalSuffix?: ReactNode;
  /** Shown above the dashed line, e.g. "8h 30m" */
  duration?: string;
  /** Shown below the dashed line as a badge, e.g. "Non-stop" */
  stopLabel?: string;
  /** Show the boarding-pass style dot marker between the time and the code */
  showDots?: boolean;
  size?: FlightRouteSize;
  className?: string;
}

const TIME_STYLES: Record<FlightRouteSize, string> = {
  sm: "text-label-md text-on-surface",
  md: "text-headline-md text-on-surface",
  lg: "text-headline-lg-mobile text-on-surface",
  xl: "text-[32px] font-bold text-on-surface leading-none",
};

const CODE_STYLES: Record<FlightRouteSize, string> = {
  sm: "text-label-sm text-on-surface-variant",
  md: "text-label-md text-on-surface-variant",
  lg: "text-label-sm text-on-surface-variant",
  xl: "text-label-md text-on-surface font-bold",
};

const ICON_SIZE: Record<FlightRouteSize, string> = {
  sm: "text-[18px]",
  md: "text-[20px]",
  lg: "text-[20px]",
  xl: "text-[16px]",
};

const MIDDLE_WRAPPER: Record<FlightRouteSize, string> = {
  sm: "flex flex-col items-center flex-1 min-w-[60px]",
  md: "flex-[2] flex flex-col items-center px-md",
  lg: "flex-1 flex flex-col items-center gap-1 px-4",
  xl: "flex flex-col items-center text-on-surface-variant gap-xs",
};

const LINE_WIDTH: Record<FlightRouteSize, string> = {
  sm: "w-full",
  md: "w-full",
  lg: "w-full",
  xl: "w-16",
};

const ENDPOINT_ALIGN: Record<FlightRouteSize, { left: string; right: string }> = {
  sm: { left: "text-center", right: "text-center" },
  md: { left: "flex-1", right: "flex-1 text-right" },
  lg: { left: "text-center", right: "text-center" },
  xl: { left: "", right: "" },
};

function DashedLine({ size }: { size: FlightRouteSize }) {
  return (
    <div className={`${LINE_WIDTH[size]} flex items-center`}>
      <div className="flex-1 border-t-2 border-dashed border-outline-variant"></div>
      <span className={`material-symbols-outlined text-primary ${ICON_SIZE[size]} rotate-90 mx-1`}>
        flight
      </span>
      <div className="flex-1 border-t-2 border-dashed border-outline-variant"></div>
    </div>
  );
}

function StopBadge({ label, size }: { label: string; size: FlightRouteSize }) {
  return (
    <span
      className={`bg-surface-container-high text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-medium ${
        size === "md" ? "mt-1" : ""
      }`}
    >
      {label}
    </span>
  );
}

function Endpoint({
  time,
  code,
  label,
  suffix,
  size,
  side,
  showDots,
}: {
  time: string;
  code: string;
  label?: string;
  suffix?: ReactNode;
  size: FlightRouteSize;
  side: "left" | "right";
  showDots: boolean;
}) {
  if (size === "xl") {
    return (
      <div className="flex flex-col items-center gap-xs">
        <p className={TIME_STYLES[size]}>
          {time}
          {suffix}
        </p>
        {showDots && (
          <div className="w-3 h-3 rounded-full border-4 border-primary ring-4 ring-primary-fixed mb-xs" />
        )}
        <span className={CODE_STYLES[size]}>{code}</span>
        {label && <span className="text-label-sm text-on-surface-variant">{label}</span>}
      </div>
    );
  }

  return (
    <div className={ENDPOINT_ALIGN[size][side]}>
      <p className={TIME_STYLES[size]}>
        {time}
        {suffix}
      </p>
      <p className={CODE_STYLES[size]}>{code}</p>
      {label && <p className="text-label-sm text-on-surface-variant truncate">{label}</p>}
    </div>
  );
}

export default function FlightRoute({
  origin,
  destination,
  originLabel,
  destinationLabel,
  departureTime,
  arrivalTime,
  arrivalSuffix,
  duration,
  stopLabel,
  showDots = false,
  size = "md",
  className = "",
}: FlightRouteProps) {
  if (departureTime === undefined || arrivalTime === undefined) {
    return (
      <div className={`flex items-center gap-xs ${className}`}>
        <div className="flex-1 min-w-0">
          <p className="text-headline-md">{origin}</p>
          {originLabel && (
            <p className="text-label-sm text-on-surface-variant truncate">{originLabel}</p>
          )}
        </div>
        <div className="flex flex-col items-center px-sm flex-shrink-0 w-16">
          <DashedLine size={size} />
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-headline-md">{destination}</p>
          {destinationLabel && (
            <p className="text-label-sm text-on-surface-variant truncate">{destinationLabel}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Endpoint
        time={departureTime}
        code={origin}
        label={originLabel}
        size={size}
        side="left"
        showDots={showDots}
      />

      <div className={MIDDLE_WRAPPER[size]}>
        {duration && <p className="text-label-sm text-on-surface-variant mb-1">{duration}</p>}
        <DashedLine size={size} />
        {stopLabel && <StopBadge label={stopLabel} size={size} />}
      </div>

      <Endpoint
        time={arrivalTime}
        code={destination}
        label={destinationLabel}
        suffix={arrivalSuffix}
        size={size}
        side="right"
        showDots={showDots}
      />
    </div>
  );
}
