"use client";

interface Props {
  departureDate: string | null;
  returnDate: string | null;
  isReturnEnabled: boolean;
  departureError?: string;
  returnError?: string;
  onDepartureChange: (d: string | null) => void;
  onReturnChange: (d: string | null) => void;
}

export default function DateRangePicker({
  departureDate,
  returnDate,
  isReturnEnabled,
  departureError,
  returnError,
  onDepartureChange,
  onReturnChange,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-2 gap-md">
      {/* Departure */}
      <div className="space-y-sm">
        <label className="block text-label-sm text-on-surface-variant px-1">
          Departure
        </label>
        <div
          className={`flex items-center gap-sm border rounded-xl p-md bg-surface-bright ${
            departureError ? "border-error" : "border-outline-variant"
          }`}
        >
          <span className="material-symbols-outlined text-outline text-[20px]">
            calendar_today
          </span>
          <input
            type="date"
            min={today}
            value={departureDate ?? ""}
            onChange={(e) => onDepartureChange(e.target.value || null)}
            className="bg-transparent border-none p-0 w-full focus:ring-0 text-body-md text-on-surface"
          />
        </div>
        {departureError && (
          <p className="text-label-sm text-error px-1">{departureError}</p>
        )}
      </div>

      {/* Return */}
      <div className="space-y-sm">
        <label
          className={`block text-label-sm px-1 ${
            isReturnEnabled ? "text-on-surface-variant" : "text-outline"
          }`}
        >
          Return
        </label>
        <div
          className={`flex items-center gap-sm border rounded-xl p-md transition-colors ${
            isReturnEnabled ? "bg-surface-bright" : "bg-surface-container-low"
          } ${returnError ? "border-error" : "border-outline-variant"}`}
        >
          <span
            className={`material-symbols-outlined text-[20px] ${
              isReturnEnabled ? "text-outline" : "text-outline/40"
            }`}
          >
            calendar_today
          </span>
          <input
            type="date"
            min={departureDate ?? today}
            value={returnDate ?? ""}
            disabled={!isReturnEnabled}
            onChange={(e) => onReturnChange(e.target.value || null)}
            className="bg-transparent border-none p-0 w-full focus:ring-0 text-body-md text-on-surface disabled:text-outline disabled:cursor-not-allowed"
          />
        </div>
        {returnError && isReturnEnabled && (
          <p className="text-label-sm text-error px-1">{returnError}</p>
        )}
      </div>
    </div>
  );
}
