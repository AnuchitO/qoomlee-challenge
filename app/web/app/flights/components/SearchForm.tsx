"use client";

import { useRouter } from "next/navigation";
import { useFlightSearch } from "../hooks/useFlightSearch";
import TripTypeToggle from "./TripTypeToggle";
import AirportInput from "./AirportInput";
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
          {/* From / To */}
          <div className="relative">
            <AirportInput
              label="From"
              icon="flight_takeoff"
              value={state.origin}
              placeholder="BKK"
              error={errors.origin}
              onChange={setOrigin}
            />

            {/* Swap button */}
            <button
              type="button"
              onClick={swapAirports}
              aria-label="Swap origin and destination"
              className="absolute right-md top-[60px] z-10 bg-surface-container-lowest border border-outline-variant p-2 rounded-full shadow-sm hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-primary">
                swap_vert
              </span>
            </button>

            <div className="mt-md">
              <AirportInput
                label="To"
                icon="flight_land"
                value={state.destination}
                placeholder="SIN"
                error={errors.destination}
                onChange={setDestination}
              />
            </div>
          </div>

          <DateRangePicker
            departureDate={state.departureDate}
            returnDate={state.returnDate}
            isReturnEnabled={state.tripType === "round"}
            departureError={errors.departureDate}
            returnError={errors.returnDate}
            onDepartureChange={setDepartureDate}
            onReturnChange={setReturnDate}
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
