"use client";

import { TripType } from "../hooks/useFlightSearch";

interface Props {
  value: TripType;
  onChange: (t: TripType) => void;
}

const TABS: { type: TripType; label: string }[] = [
  { type: "round", label: "Round trip" },
  { type: "oneway", label: "One way" },
];

export default function TripTypeToggle({ value, onChange }: Props) {
  return (
    <div className="relative overflow-hidden w-full md:w-fit">
      <div
        className="flex gap-2 overflow-x-auto pt-[5px] pb-[5px]"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map(({ type, label }) => {
          const isSelected = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className="flex-shrink-0 flex items-center justify-center rounded-full px-5 py-2 font-bold text-sm transition-colors whitespace-nowrap"
              style={{
                backgroundColor: isSelected
                  ? "rgb(194, 228, 255)"
                  : "rgb(235, 244, 255)",
                color: isSelected ? "rgb(29, 78, 216)" : "rgb(30, 64, 175)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
