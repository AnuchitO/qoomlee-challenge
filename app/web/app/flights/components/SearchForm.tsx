"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlightSearch } from "../hooks/useFlightSearch";
import TripTypeToggle from "./TripTypeToggle";
import DateRangePicker from "./DateRangePicker";
import PassengerSelector from "./PassengerSelector";
import AirportSelect from "./AirportSelect";

const swapSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 text-primary fill-current">
    <path d="M.44 8.56a1.5 1.5 0 0 1 0-2.12l4.5-4.5a1.5 1.5 0 0 1 2.12 0l4.5 4.5a1.5 1.5 0 0 1-2.12 2.12L7.5 6.622V19.5a1.5 1.5 0 0 1-3 0V6.621l-1.94 1.94a1.5 1.5 0 0 1-2.12 0zm12 6.88a1.5 1.5 0 0 0 0 2.12l4.5 4.5a1.5 1.5 0 0 0 2.12 0l4.5-4.5a1.5 1.5 0 0 0-2.12-2.12l-1.94 1.939V4.5a1.5 1.5 0 0 0-3 0v12.879l-1.94-1.94a1.5 1.5 0 0 0-2.12 0z" />
  </svg>
);

const addReturnSvg = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M12 4.25C12.4142 4.25 12.75 4.58579 12.75 5V11.25H19C19.4142 11.25 19.75 11.5858 19.75 12C19.75 12.4142 19.4142 12.75 19 12.75H12.75V19C12.75 19.4142 12.4142 19.75 12 19.75C11.5858 19.75 11.25 19.4142 11.25 19V12.75H5C4.58579 12.75 4.25 12.4142 4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H11.25V5C11.25 4.58579 11.5858 4.25 12 4.25Z" fill="currentColor" className="text-primary" />
  </svg>
);

function openDatePicker(ref: React.RefObject<HTMLInputElement | null>) {
  try { ref.current?.showPicker(); } catch { ref.current?.focus(); }
}

export default function SearchForm() {
  const router = useRouter();
  const [rotated, setRotated] = useState(false);
  const [autoOpenReturn, setAutoOpenReturn] = useState(false);
  const departureRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const {
    state, errors,
    setTripType, setOrigin, setDestination,
    setDepartureDate, setReturnDate,
    setPassengers, setCabinClass,
    swapAirports, validate, buildSearchUrl,
  } = useFlightSearch();

  const handleSearch = () => { if (validate()) router.push(buildSearchUrl()); };

  // Auto-open the return date picker after "Add return" switches to round trip.
  // useLayoutEffect fires synchronously after DOM mutations while the browser's
  // user-gesture window (transient activation) is still valid for showPicker().
  useLayoutEffect(() => {
    if (state.tripType === "round" && autoOpenReturn) {
      setAutoOpenReturn(false);
      if (returnRef.current) {
        returnRef.current.getBoundingClientRect(); // force layout before showPicker
        try { returnRef.current.showPicker(); } catch { returnRef.current.focus(); }
      }
    }
  }, [state.tripType, autoOpenReturn]);

  const handleSwap = () => { swapAirports(); setRotated((r) => !r); };

  const spinStyle: React.CSSProperties = {
    transform: `rotate(${rotated ? 180 : 0}deg)`,
    transition: "transform 0.35s ease",
  };

  // ── Reusable date box used in the lg: flat row ──────────────────────────────
  const dateBoxClass = (hasError: boolean) =>
    `flex items-center gap-sm border rounded-xl px-md bg-surface-bright cursor-pointer min-h-[70px] ${
      hasError ? "border-error" : "border-outline-variant"
    }`;

  return (
    <section className="px-container-margin-mobile md:px-container-margin-desktop -mt-10 relative z-20">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-md">

        {/* ── Row 1: trip type + passengers ───────────────────────────────────── */}
        <div className="flex items-center justify-between gap-md mb-md">
          <TripTypeToggle value={state.tripType} onChange={setTripType} />
          <div className="hidden md:block shrink-0">
            <PassengerSelector
              passengers={state.passengers}
              cabinClass={state.cabinClass}
              onPassengersChange={setPassengers}
              onCabinClassChange={setCabinClass}
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            lg: FLAT ROW — each field its own flex column, all same height
            Phantom labels on Swap and Search columns align them with the inputs.
            mb-[17px] on Swap button centres it in the 70 px input zone:
              (70px input − 36px button) / 2 = 17 px
        ════════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:items-end lg:gap-sm">

          {/* From */}
          <div className="flex-1 min-w-0 flex flex-col gap-xs">
            <label className="text-label-sm text-on-surface-variant px-1">From</label>
            <AirportSelect
              value={state.origin}
              onChange={setOrigin}
              icon="flight_takeoff"
              placeholder="Select origin"
              error={errors.origin}
              excludeCode={state.destination}
            />
            {errors.origin && <p className="text-label-sm text-error px-1">{errors.origin}</p>}
          </div>

          {/* Swap — phantom label keeps height, mb-[17px] centres button in input zone */}
          <div className="shrink-0 flex flex-col gap-xs">
            <span className="text-label-sm invisible select-none px-1" aria-hidden>·</span>
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap origin and destination"
              className="mb-[17px] flex items-center justify-center w-9 h-9 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high transition-colors"
            >
              <div className="rotate-90">
                <div style={spinStyle}>{swapSvg}</div>
              </div>
            </button>
          </div>

          {/* To */}
          <div className="flex-1 min-w-0 flex flex-col gap-xs">
            <label className="text-label-sm text-on-surface-variant px-1">To</label>
            <AirportSelect
              value={state.destination}
              onChange={setDestination}
              icon="flight_land"
              placeholder="Select destination"
              error={errors.destination}
              excludeCode={state.origin}
            />
            {errors.destination && <p className="text-label-sm text-error px-1">{errors.destination}</p>}
          </div>

          {/* Departure */}
          <div className="flex-1 min-w-0 flex flex-col gap-xs">
            <label className="text-label-sm text-on-surface-variant px-1">Departure</label>
            <div onClick={() => openDatePicker(departureRef)} className={dateBoxClass(!!errors.departureDate)}>
              <span className="material-symbols-outlined text-outline shrink-0 text-[20px]">calendar_today</span>
              <input
                ref={departureRef}
                type="date"
                min={today}
                value={state.departureDate ?? ""}
                onChange={(e) => setDepartureDate(e.target.value || null)}
                className="bg-transparent border-none p-0 w-full min-w-0 focus:ring-0 text-body-md text-on-surface cursor-pointer"
              />
            </div>
            {errors.departureDate && <p className="text-label-sm text-error px-1">{errors.departureDate}</p>}
          </div>

          {/* Return */}
          <div className="flex-1 min-w-0 flex flex-col gap-xs">
            <label className="text-label-sm text-on-surface-variant px-1">Return</label>
            {state.tripType === "round" ? (
              <>
                <div onClick={() => openDatePicker(returnRef)} className={dateBoxClass(!!errors.returnDate)}>
                  <span className="material-symbols-outlined text-outline shrink-0 text-[20px]">calendar_today</span>
                  <input
                    ref={returnRef}
                    type="date"
                    min={state.departureDate ?? today}
                    value={state.returnDate ?? ""}
                    onChange={(e) => setReturnDate(e.target.value || null)}
                    className="bg-transparent border-none p-0 w-full min-w-0 focus:ring-0 text-body-md text-on-surface cursor-pointer"
                  />
                </div>
                {errors.returnDate && <p className="text-label-sm text-error px-1">{errors.returnDate}</p>}
              </>
            ) : (
              <button
                type="button"
                onClick={() => { setAutoOpenReturn(true); setTripType("round"); }}
                className={`${dateBoxClass(false)} border-dashed hover:bg-surface-container-high active:scale-95 transition-all`}
              >
                {addReturnSvg}
                <span className="text-body-md text-primary truncate">Add return</span>
              </button>
            )}
          </div>

          {/* Search — phantom label aligns button with the input row */}
          <div className="shrink-0 flex flex-col gap-xs">
            <span className="text-label-sm invisible select-none px-1" aria-hidden>·</span>
            <button
              type="button"
              onClick={handleSearch}
              className="px-xl bg-primary-container text-on-primary-container rounded-xl text-label-md shadow-sm active:scale-95 transition-transform whitespace-nowrap min-h-[70px]"
            >
              Search Flights
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            md: COMPACT 2-COL GRID (768 px – 1023 px)
            [From+swap+To] [Dates] [Search]
        ════════════════════════════════════════════════════════════════════ */}
        <div
          className="hidden md:grid lg:hidden md:gap-md md:items-start"
          style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) auto" }}
        >
          {/* From + swap + To */}
          <div className="flex flex-col gap-xs">
            <div className="flex gap-sm">
              <label className="flex-1 min-w-0 text-label-sm text-on-surface-variant px-1">From</label>
              <div className="w-9 shrink-0" />
              <label className="flex-1 min-w-0 text-label-sm text-on-surface-variant px-1">To</label>
            </div>
            <div className="flex items-center gap-sm">
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
                className="shrink-0 flex items-center justify-center w-9 h-9 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high transition-colors"
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
            {errors.destination && <p className="text-label-sm text-error px-1">{errors.destination}</p>}
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

        {/* ════════════════════════════════════════════════════════════════════
            MOBILE layout (< 768 px)
            Stacked card for From / To, absolute swap button over divider
        ════════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden space-y-md">

          <div>
            <div className="relative">
              <div className={`border rounded-xl bg-surface-bright overflow-hidden ${
                errors.origin || errors.destination ? "border-error" : "border-outline-variant"
              }`}>
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
                className="absolute right-md top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm hover:bg-surface-container-high transition-colors"
              >
                <div style={spinStyle}>{swapSvg}</div>
              </button>
            </div>
            {errors.origin && <p className="text-label-sm text-error px-1 mt-xs">{errors.origin}</p>}
            {errors.destination && <p className="text-label-sm text-error px-1 mt-xs">{errors.destination}</p>}
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
    </section>
  );
}
