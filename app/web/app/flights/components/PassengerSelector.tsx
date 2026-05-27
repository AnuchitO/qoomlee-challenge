"use client";

import { useState } from "react";
import { CabinClass } from "../hooks/useFlightSearch";

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  business: "Business",
  first: "First Class",
};

interface Props {
  passengers: number;
  cabinClass: CabinClass;
  onPassengersChange: (n: number) => void;
  onCabinClassChange: (c: CabinClass) => void;
}

export default function PassengerSelector({
  passengers,
  cabinClass,
  onPassengersChange,
  onCabinClassChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const summary = `${passengers} Traveler${passengers > 1 ? "s" : ""}, ${CABIN_LABELS[cabinClass]}`;

  return (
    <div className="space-y-sm relative">
      <label className="block text-label-sm text-on-surface-variant px-1">
        Travelers &amp; Class
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-outline-variant rounded-xl p-md bg-surface-bright text-left"
      >
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-outline">person</span>
          <span className="text-body-md text-on-surface">{summary}</span>
        </div>
        <span className="material-symbols-outlined text-outline">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-30 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-md mt-sm space-y-lg">
          {/* Passenger count */}
          <div className="flex items-center justify-between">
            <span className="text-body-md text-on-surface">Passengers</span>
            <div className="flex items-center gap-md">
              <button
                type="button"
                disabled={passengers <= 1}
                onClick={() => onPassengersChange(passengers - 1)}
                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-primary disabled:text-outline disabled:border-outline/30"
              >
                <span className="material-symbols-outlined text-[18px]">
                  remove
                </span>
              </button>
              <span className="text-body-md text-on-surface w-4 text-center">
                {passengers}
              </span>
              <button
                type="button"
                disabled={passengers >= 9}
                onClick={() => onPassengersChange(passengers + 1)}
                className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-primary disabled:text-outline disabled:border-outline/30"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
              </button>
            </div>
          </div>

          {/* Cabin class */}
          <div className="space-y-sm">
            <span className="text-label-sm text-on-surface-variant">
              Cabin class
            </span>
            <div className="flex flex-col gap-xs">
              {(Object.keys(CABIN_LABELS) as CabinClass[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onCabinClassChange(c);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between px-md py-sm rounded-lg transition-colors ${
                    cabinClass === c
                      ? "bg-primary-container text-on-primary-container"
                      : "hover:bg-surface-container-low text-on-surface"
                  }`}
                >
                  <span className="text-body-md">{CABIN_LABELS[c]}</span>
                  {cabinClass === c && (
                    <span className="material-symbols-outlined text-[18px]">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full bg-primary text-on-primary py-2 rounded-lg text-label-md"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
