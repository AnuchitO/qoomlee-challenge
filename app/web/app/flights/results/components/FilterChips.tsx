"use client";

import { useState } from "react";
import type { SortBy } from "../_internal/types";

const FILTERS: { label: string; value: SortBy }[] = [
  { label: "Best", value: "best" },
  { label: "Price", value: "price" },
  { label: "Departure", value: "departure" },
  { label: "Duration", value: "duration" },
];

interface Props {
  total: number;
  onSortChange: (s: SortBy) => void;
}

export default function FilterChips({ total, onSortChange }: Props) {
  const [active, setActive] = useState<SortBy>("best");

  const handleClick = (value: SortBy) => {
    setActive(value);
    onSortChange(value);
  };

  return (
    <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md py-md -mx-container-margin-mobile px-container-margin-mobile">
      <div className="flex gap-sm overflow-x-auto custom-scrollbar">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleClick(value)}
            className={`flex-none px-md py-2 rounded-full text-label-md shadow-sm transition-colors ${
              active === value
                ? "bg-primary-container text-on-primary-container"
                : "border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-md text-label-sm text-on-surface-variant">
        {total} flight{total !== 1 ? "s" : ""} found · Sorted by{" "}
        {FILTERS.find((f) => f.value === active)?.label}
      </div>
    </div>
  );
}
