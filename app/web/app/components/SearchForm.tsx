"use client";

import { useSearchForm } from "./useSearchForm";

export default function SearchForm() {
  const { tripType, setTripType } = useSearchForm();

  return (
    <section className="px-container-margin-mobile -mt-10 relative z-20">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md">
        {/* Trip Type Toggle */}
        <div className="flex bg-surface-container-low p-1 rounded-lg mb-lg">
          <button
            onClick={() => setTripType("round")}
            className={`flex-1 py-2 text-label-md rounded-md shadow-sm transition-colors ${
              tripType === "round"
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Round trip
          </button>
          <button
            onClick={() => setTripType("oneway")}
            className={`flex-1 py-2 text-label-md rounded-md transition-colors ${
              tripType === "oneway"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            One way
          </button>
        </div>

        {/* Search Fields */}
        <div className="space-y-md">
          {/* From / To */}
          <div className="relative">
            <div className="space-y-sm">
              <label className="block text-label-sm text-on-surface-variant px-1">From</label>
              <div className="flex items-center gap-md border border-outline-variant rounded-xl p-md bg-surface-bright focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <span className="material-symbols-outlined text-primary">flight_takeoff</span>
                <input
                  className="bg-transparent border-none p-0 w-full focus:ring-0 text-body-md placeholder:text-outline"
                  placeholder="Departure City"
                  type="text"
                />
              </div>
            </div>

            {/* Swap Button */}
            <button className="absolute right-md top-[60px] z-10 bg-surface-container-lowest border border-outline-variant p-2 rounded-full shadow-sm hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-primary">swap_vert</span>
            </button>

            <div className="space-y-sm mt-md">
              <label className="block text-label-sm text-on-surface-variant px-1">To</label>
              <div className="flex items-center gap-md border border-outline-variant rounded-xl p-md bg-surface-bright focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <span className="material-symbols-outlined text-primary">flight_land</span>
                <input
                  className="bg-transparent border-none p-0 w-full focus:ring-0 text-body-md placeholder:text-outline"
                  placeholder="Arrival City"
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="block text-label-sm text-on-surface-variant px-1">Departure</label>
              <div className="flex items-center gap-sm border border-outline-variant rounded-xl p-md bg-surface-bright">
                <span className="material-symbols-outlined text-outline text-[20px]">
                  calendar_today
                </span>
                <span className="text-body-md text-on-surface">Oct 24</span>
              </div>
            </div>
            <div className="space-y-sm">
              <label className="block text-label-sm text-on-surface-variant px-1">Return</label>
              <div className="flex items-center gap-sm border border-outline-variant rounded-xl p-md bg-surface-bright">
                <span className="material-symbols-outlined text-outline text-[20px]">
                  calendar_today
                </span>
                <span className="text-body-md text-on-surface">Oct 31</span>
              </div>
            </div>
          </div>

          {/* Travelers & Class */}
          <div className="space-y-sm">
            <label className="block text-label-sm text-on-surface-variant px-1">
              Travelers &amp; Class
            </label>
            <div className="flex items-center justify-between border border-outline-variant rounded-xl p-md bg-surface-bright">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-outline">person</span>
                <span className="text-body-md text-on-surface">1 Traveler, Economy</span>
              </div>
              <span className="material-symbols-outlined text-outline">expand_more</span>
            </div>
          </div>

          {/* Search CTA */}
          <button className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl text-headline-md shadow-sm active:scale-95 transition-transform mt-lg">
            Search Flights
          </button>
        </div>
      </div>
    </section>
  );
}
