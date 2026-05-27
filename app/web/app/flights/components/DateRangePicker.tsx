"use client";

import { useRef } from "react";

interface Props {
  departureDate: string | null;
  returnDate: string | null;
  isReturnEnabled: boolean;
  departureError?: string;
  returnError?: string;
  onDepartureChange: (d: string | null) => void;
  onReturnChange: (d: string | null) => void;
  onAddReturn?: () => void;
}

export default function DateRangePicker({
  departureDate,
  returnDate,
  isReturnEnabled,
  departureError,
  returnError,
  onDepartureChange,
  onReturnChange,
  onAddReturn,
}: Props) {
  const today = new Date().toISOString().split("T")[0];
  const departureRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);

  const openPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    try {
      ref.current?.showPicker();
    } catch {
      ref.current?.focus();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-md">
      {/* Departure */}
      <div className="space-y-sm">
        <label className="block text-label-sm text-on-surface-variant px-1">
          Departure
        </label>
        <div
          onClick={() => openPicker(departureRef)}
          className={`flex items-center gap-sm border rounded-xl p-md bg-surface-bright cursor-pointer ${
            departureError ? "border-error" : "border-outline-variant"
          }`}
        >
          <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
            calendar_today
          </span>
          <input
            ref={departureRef}
            type="date"
            min={today}
            value={departureDate ?? ""}
            onChange={(e) => onDepartureChange(e.target.value || null)}
            className="bg-transparent border-none p-0 w-full min-w-0 focus:ring-0 text-body-md text-on-surface cursor-pointer"
          />
        </div>
        {departureError && (
          <p className="text-label-sm text-error px-1">{departureError}</p>
        )}
      </div>

      {/* Return */}
      <div className="space-y-sm">
        <label className="block text-label-sm px-1 text-on-surface-variant">
          Return
        </label>
        {isReturnEnabled ? (
          <>
            <div
              onClick={() => openPicker(returnRef)}
              className={`flex items-center gap-sm border rounded-xl p-md transition-colors bg-surface-bright cursor-pointer ${
                returnError ? "border-error" : "border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0 text-outline">
                calendar_today
              </span>
              <input
                ref={returnRef}
                type="date"
                min={departureDate ?? today}
                value={returnDate ?? ""}
                onChange={(e) => onReturnChange(e.target.value || null)}
                className="bg-transparent border-none p-0 w-full min-w-0 focus:ring-0 text-body-md text-on-surface cursor-pointer"
              />
            </div>
            {returnError && (
              <p className="text-label-sm text-error px-1">{returnError}</p>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onAddReturn}
            className="flex items-center gap-sm border border-dashed border-outline-variant rounded-xl p-md w-full bg-surface-bright hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M12 4.25C12.4142 4.25 12.75 4.58579 12.75 5V11.25H19C19.4142 11.25 19.75 11.5858 19.75 12C19.75 12.4142 19.4142 12.75 19 12.75H12.75V19C12.75 19.4142 12.4142 19.75 12 19.75C11.5858 19.75 11.25 19.4142 11.25 19V12.75H5C4.58579 12.75 4.25 12.4142 4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H11.25V5C11.25 4.58579 11.5858 4.25 12 4.25Z"
                fill="currentColor"
                className="text-primary"
              />
            </svg>
            <span className="text-body-md text-primary truncate">Add return</span>
          </button>
        )}
      </div>
    </div>
  );
}
