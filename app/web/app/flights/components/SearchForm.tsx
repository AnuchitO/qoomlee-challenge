"use client";

import { useRouter } from "next/navigation";
import { useFlightSearch } from "../hooks/useFlightSearch";
import TripTypeToggle from "./TripTypeToggle";
import DateRangePicker from "./DateRangePicker";
import PassengerSelector from "./PassengerSelector";

export default function SearchForm() {
  const router = useRouter();
  const {
    state,
    errors,
    setTripType,
    setOrigin,
    setDestination,
    setDepartureDate,
    setReturnDate,
    setPassengers,
    setCabinClass,
    swapAirports,
    validate,
    buildSearchUrl,
  } = useFlightSearch();

  const handleSearch = () => {
    if (validate()) {
      router.push(buildSearchUrl());
    }
  };

  return (
    <section className="px-container-margin-mobile -mt-10 relative z-20">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md">
        <TripTypeToggle value={state.tripType} onChange={setTripType} />

        <div className="space-y-md">
          {/* From / To — unified card, swap button pinned to the divider */}
          <div>
            <div className="relative">
              <div className={`border rounded-xl bg-surface-bright ${
                errors.origin || errors.destination ? "border-error" : "border-outline-variant"
              }`}>
                {/* From row */}
                <div className="flex items-center gap-md px-md py-sm">
                  <span className="material-symbols-outlined text-primary shrink-0">flight_takeoff</span>
                  <div className="flex-1 min-w-0">
                    <label className="block text-label-sm text-on-surface-variant">From</label>
                    <input
                      className="bg-transparent border-none p-0 w-full focus:ring-0 text-body-md placeholder:text-outline uppercase"
                      placeholder="BKK"
                      type="text"
                      value={state.origin}
                      maxLength={3}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-outline-variant" />

                {/* To row */}
                <div className="flex items-center gap-md px-md py-sm">
                  <span className="material-symbols-outlined text-primary shrink-0">flight_land</span>
                  <div className="flex-1 min-w-0">
                    <label className="block text-label-sm text-on-surface-variant">To</label>
                    <input
                      className="bg-transparent border-none p-0 w-full focus:ring-0 text-body-md placeholder:text-outline uppercase"
                      placeholder="SIN"
                      type="text"
                      value={state.destination}
                      maxLength={3}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Swap button — centered on the divider line */}
              <button
                type="button"
                onClick={swapAirports}
                aria-label="Swap origin and destination"
                className="absolute right-md top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high active:scale-90 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 text-primary fill-current">
                  <path d="M.44 8.56a1.5 1.5 0 0 1 0-2.12l4.5-4.5a1.5 1.5 0 0 1 2.12 0l4.5 4.5a1.5 1.5 0 0 1-2.12 2.12L7.5 6.622V19.5a1.5 1.5 0 0 1-3 0V6.621l-1.94 1.94a1.5 1.5 0 0 1-2.12 0zm12 6.88a1.5 1.5 0 0 0 0 2.12l4.5 4.5a1.5 1.5 0 0 0 2.12 0l4.5-4.5a1.5 1.5 0 0 0-2.12-2.12l-1.94 1.939V4.5a1.5 1.5 0 0 0-3 0v12.879l-1.94-1.94a1.5 1.5 0 0 0-2.12 0z" />
                </svg>
              </button>
            </div>

            {/* Errors */}
            {errors.origin && (
              <p className="text-label-sm text-error px-1 mt-xs">{errors.origin}</p>
            )}
            {errors.destination && (
              <p className="text-label-sm text-error px-1 mt-xs">{errors.destination}</p>
            )}
          </div>

          <DateRangePicker
            departureDate={state.departureDate}
            returnDate={state.returnDate}
            isReturnEnabled={state.tripType === "round"}
            departureError={errors.departureDate}
            returnError={errors.returnDate}
            onDepartureChange={setDepartureDate}
            onReturnChange={setReturnDate}
            onAddReturn={() => setTripType("round")}
          />

          <PassengerSelector
            passengers={state.passengers}
            cabinClass={state.cabinClass}
            onPassengersChange={setPassengers}
            onCabinClassChange={setCabinClass}
          />

          <button
            type="button"
            onClick={handleSearch}
            className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl text-headline-md shadow-sm active:scale-95 transition-transform mt-lg"
          >
            Search Flights
          </button>
        </div>
      </div>
    </section>
  );
}
