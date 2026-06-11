"use client";

import { CabinClass } from "../hooks/useFlightSearch";

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  business: "Business",
  first: "First",
};

interface Props {
  passengers: number;
  cabinClass: CabinClass;
  onPassengersChange: (n: number) => void;
  onCabinClassChange: (c: CabinClass) => void;
  variant?: "card" | "inline";
}

export default function PassengerSelector({
  passengers,
  cabinClass,
  onPassengersChange,
  onCabinClassChange,
  variant = "card",
}: Props) {
  const stepper = (
    <div className="flex items-center gap-xs">
      <button
        type="button"
        disabled={passengers <= 1}
        onClick={() => onPassengersChange(passengers - 1)}
        aria-label="Remove passenger"
        className="w-7 h-7 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
      >
        <span className="material-symbols-outlined text-[16px]">remove</span>
      </button>
      <div className="flex items-center gap-xs min-w-[2.5rem] justify-center">
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          person
        </span>
        <span className="text-body-md text-on-surface tabular-nums">{passengers}</span>
      </div>
      <button
        type="button"
        disabled={passengers >= 9}
        onClick={() => onPassengersChange(passengers + 1)}
        aria-label="Add passenger"
        className="w-7 h-7 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
      </button>
    </div>
  );

  const chips = (
    <div className="flex items-center gap-xs">
      {(Object.keys(CABIN_LABELS) as CabinClass[]).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onCabinClassChange(c)}
          className={`px-sm py-1 rounded-lg text-label-sm transition-colors whitespace-nowrap cursor-pointer ${
            cabinClass === c
              ? "bg-primary/10 text-primary font-medium ring-1 ring-primary/30"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          {CABIN_LABELS[c]}
        </button>
      ))}
    </div>
  );

  const divider = <div className="w-px h-5 bg-outline-variant shrink-0" />;

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-sm">
        {stepper}
        {divider}
        {chips}
      </div>
    );
  }

  return (
    <div className="px-1">
      <span className="text-label-xs text-on-surface-variant block mb-xs">
        Travelers &amp; Class
      </span>
      <div className="flex items-center gap-sm">
        {stepper}
        {divider}
        <div className="flex items-center gap-xs flex-1">
          {(Object.keys(CABIN_LABELS) as CabinClass[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCabinClassChange(c)}
              className={`flex-1 px-xs py-1 rounded-lg text-label-sm transition-colors ${
                cabinClass === c
                  ? "bg-primary/10 text-primary font-medium ring-1 ring-primary/30 cursor-pointer"
                  : "text-on-surface-variant hover:bg-surface-container cursor-pointer"
              }`}
            >
              {CABIN_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
