"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlightSearch } from "../hooks/useFlightSearch";
import TripTypeToggle from "./TripTypeToggle";
import DateRangePicker from "./DateRangePicker";
import PassengerSelector from "./PassengerSelector";
import AirportSelect from "./AirportSelect";
import QaQuickFill from "../_qqf/QaQuickFill";

const swapSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="w-4 h-4 text-primary fill-current"
  >
    <path d="M.44 8.56a1.5 1.5 0 0 1 0-2.12l4.5-4.5a1.5 1.5 0 0 1 2.12 0l4.5 4.5a1.5 1.5 0 0 1-2.12 2.12L7.5 6.622V19.5a1.5 1.5 0 0 1-3 0V6.621l-1.94 1.94a1.5 1.5 0 0 1-2.12 0zm12 6.88a1.5 1.5 0 0 0 0 2.12l4.5 4.5a1.5 1.5 0 0 0 2.12 0l4.5-4.5a1.5 1.5 0 0 0-2.12-2.12l-1.94 1.939V4.5a1.5 1.5 0 0 0-3 0v12.879l-1.94-1.94a1.5 1.5 0 0 0-2.12 0z" />
  </svg>
);

export default function SearchForm() {
  const router = useRouter();
  const [rotated, setRotated] = useState(false);

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
    applyScenario,
  } = useFlightSearch();

  const handleSearch = () => {
    if (validate()) router.push(buildSearchUrl());
  };

  const handleSwap = () => {
    swapAirports();
    setRotated((r) => !r);
  };

  const spinStyle: React.CSSProperties = {
    transform: `rotate(${rotated ? 180 : 0}deg)`,
    transition: "transform 0.35s ease",
  };

  return (
    <section className="px-container-margin-mobile md:px-container-margin-desktop -mt-10 relative z-20">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md">
        {/* row 1: trip type (+ passengers on md+) */}
        <div className="flex items-center justify-between gap-md mb-md flex-wrap gap-y-sm">
          <TripTypeToggle value={state.tripType} onChange={setTripType} />
          <div className="hidden md:flex">
            <PassengerSelector
              variant="inline"
              passengers={state.passengers}
              cabinClass={state.cabinClass}
              onPassengersChange={setPassengers}
              onCabinClassChange={setCabinClass}
            />
          </div>
        </div>

        {/* lg+ — flat single row, one flex column per field */}
        <div className="hidden lg:flex lg:items-start lg:gap-sm">
          {/* From + To — combined wider container with floating swap */}
          <div className="flex-[2] min-w-0 flex flex-col gap-xs">
            {/* Labels row */}
            <div className="flex">
              <div className="flex-1 min-w-0 px-1">
                <label className="block text-label-sm text-on-surface-variant">From</label>
              </div>
              <div className="flex-1 min-w-0 px-1">
                <label className="block text-label-sm text-on-surface-variant">To</label>
              </div>
            </div>
            {/* Inputs row with swap floating at the boundary */}
            <div className="relative flex gap-3">
              <div className="flex-1 min-w-0">
                <AirportSelect
                  value={state.origin}
                  onChange={setOrigin}
                  icon="flight_takeoff"
                  placeholder="Select origin"
                  error={errors.origin}
                  excludeCode={state.destination}
                />
              </div>
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap origin and destination"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <div className="rotate-90">
                  <div style={spinStyle}>{swapSvg}</div>
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <AirportSelect
                  value={state.destination}
                  onChange={setDestination}
                  icon="flight_land"
                  placeholder="Select destination"
                  error={errors.destination}
                  excludeCode={state.origin}
                />
              </div>
            </div>
            {/* Errors row */}
            <div className="flex gap-3">
              <div className="flex-1">
                {errors.origin && <p className="text-label-sm text-error px-1">{errors.origin}</p>}
              </div>
              <div className="flex-1">
                {errors.destination && (
                  <p className="text-label-sm text-error px-1">{errors.destination}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex-[2] min-w-0">
            <DateRangePicker
              departureDate={state.departureDate}
              returnDate={state.returnDate}
              isReturnEnabled={state.tripType === "round"}
              departureError={errors.departureDate}
              returnError={errors.returnDate}
              onDepartureChange={setDepartureDate}
              onReturnChange={setReturnDate}
              onAddReturn={() => setTripType("round")}
              boxMinHeight={70}
            />
          </div>

          {/* Search — phantom label aligns button with the input row */}
          <div className="shrink-0 flex flex-col gap-xs">
            <span className="text-label-sm invisible select-none px-1" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={handleSearch}
              className="px-xl bg-primary-container text-on-primary-container rounded-xl text-label-md shadow-sm active:scale-95 transition-transform whitespace-nowrap min-h-[70px] cursor-pointer"
            >
              Search Flights
            </button>
          </div>
        </div>

        {/* md only — 2-col grid: [From+swap+To] [Dates] [Search] */}
        <div
          className="hidden md:grid lg:hidden md:gap-md md:items-start"
          style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) auto" }}
        >
          {/* From + swap + To */}
          <div className="flex flex-col gap-xs">
            <div className="flex">
              <label className="flex-1 min-w-0 text-label-sm text-on-surface-variant px-1">
                From
              </label>
              <label className="flex-1 min-w-0 text-label-sm text-on-surface-variant px-1">
                To
              </label>
            </div>
            <div className="relative flex gap-3">
              <div className="flex-1 min-w-0">
                <AirportSelect
                  value={state.origin}
                  onChange={setOrigin}
                  icon="flight_takeoff"
                  placeholder="Select origin"
                  error={errors.origin}
                  excludeCode={state.destination}
                />
              </div>
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap origin and destination"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <div className="rotate-90">
                  <div style={spinStyle}>{swapSvg}</div>
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <AirportSelect
                  value={state.destination}
                  onChange={setDestination}
                  icon="flight_land"
                  placeholder="Select destination"
                  error={errors.destination}
                  excludeCode={state.origin}
                />
              </div>
            </div>
            {errors.origin && <p className="text-label-sm text-error px-1">{errors.origin}</p>}
            {errors.destination && (
              <p className="text-label-sm text-error px-1">{errors.destination}</p>
            )}
          </div>

          {/* Dates */}
          <DateRangePicker
            departureDate={state.departureDate}
            returnDate={state.returnDate}
            isReturnEnabled={state.tripType === "round"}
            departureError={errors.departureDate}
            returnError={errors.returnDate}
            onDepartureChange={setDepartureDate}
            onReturnChange={setReturnDate}
            onAddReturn={() => setTripType("round")}
            boxMinHeight={70}
          />

          {/* Search */}
          <button
            type="button"
            onClick={handleSearch}
            className="self-stretch px-xl bg-primary-container text-on-primary-container rounded-xl text-label-md shadow-sm active:scale-95 transition-transform whitespace-nowrap"
          >
            Search Flights
          </button>
        </div>

        {/* mobile */}
        <div className="md:hidden space-y-md">
          <div>
            <div className="relative">
              <div
                className={`border rounded-xl bg-surface-bright overflow-hidden ${
                  errors.origin || errors.destination ? "border-error" : "border-outline-variant"
                }`}
              >
                <div className="px-md py-sm">
                  <label className="block text-label-sm text-on-surface-variant mb-1">From</label>
                  <AirportSelect
                    value={state.origin}
                    onChange={setOrigin}
                    icon="flight_takeoff"
                    placeholder="Select city or airport"
                    excludeCode={state.destination}
                    borderless
                  />
                </div>
                <div className="border-t border-outline-variant" />
                <div className="px-md py-sm">
                  <label className="block text-label-sm text-on-surface-variant mb-1">To</label>
                  <AirportSelect
                    value={state.destination}
                    onChange={setDestination}
                    icon="flight_land"
                    placeholder="Select city or airport"
                    excludeCode={state.origin}
                    borderless
                  />
                </div>
              </div>

              {/* Swap floats over the divider */}
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap origin and destination"
                className="absolute right-md top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <div style={spinStyle}>{swapSvg}</div>
              </button>
            </div>
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
            className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl text-headline-md shadow-sm active:scale-95 transition-transform"
          >
            Search Flights
          </button>
        </div>
      </div>

      {process.env.NEXT_PUBLIC_ENABLE_TEST_SCENARIOS === "true" && (
        <QaQuickFill onApplyScenario={applyScenario} />
      )}
    </section>
  );
}
