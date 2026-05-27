"use client";

import { TripType } from "../hooks/useFlightSearch";

interface Props {
  value: TripType;
  onChange: (t: TripType) => void;
}

export default function TripTypeToggle({ value, onChange }: Props) {
  return (
    <div className="flex bg-surface-container-low p-1 rounded-lg mb-lg">
      {(["round", "oneway"] as TripType[]).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`flex-1 py-2 text-label-md rounded-md transition-colors ${
            value === type
              ? "bg-primary-container text-on-primary-container shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {type === "round" ? "Round trip" : "One way"}
        </button>
      ))}
    </div>
  );
}
