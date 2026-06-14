"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import ResultsHeader from "./components/ResultsHeader";
import FlightList from "./components/FlightList";
import RoundTripProgress from "./components/RoundTripProgress";
import { fetchFlights } from "./_internal/fetchFlights";
import { formatSearchSummary } from "./_internal/formatSearchSummary";
import type { Flight } from "./_internal/types";
import { FlightListSkeleton } from "./_skeleton/FlightListSkeleton";

export default function ResultsPageClient() {
  const searchParams = useSearchParams();

  const origin = searchParams.get("origin") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const departure = searchParams.get("departure") ?? "";
  const cabin = searchParams.get("cabin") ?? "economy";
  const passengersParam = searchParams.get("passengers") ?? "1";

  const returnDate = searchParams.get("return") ?? "";
  const rawStep = searchParams.get("step");
  const step =
    rawStep === "outbound" || rawStep === "return" ? rawStep : returnDate ? "outbound" : undefined;

  const outboundFlightId = searchParams.get("outboundFlightId") ?? "";
  const outboundFlightNumber = searchParams.get("outboundFlightNumber") ?? "";
  const outboundOrigin = searchParams.get("outboundOrigin") ?? "";
  const outboundDestination = searchParams.get("outboundDestination") ?? "";
  const outboundDepartureTime = searchParams.get("outboundDepartureTime") ?? "";
  const outboundPrice = searchParams.get("outboundPrice") ?? "";
  const outboundCurrency = searchParams.get("outboundCurrency") ?? "";

  const returnStepParams =
    step === "outbound" && returnDate
      ? { origin, destination, departure: returnDate, cabin }
      : undefined;

  const outboundParams =
    step === "return" && outboundFlightId
      ? {
          outboundFlightId,
          outboundFlightNumber,
          outboundOrigin,
          outboundDestination,
          outboundDepartureTime,
          outboundPrice,
          outboundCurrency,
        }
      : undefined;

  const outboundSummary =
    step === "return" &&
    outboundFlightNumber &&
    outboundOrigin &&
    outboundDestination &&
    outboundDepartureTime &&
    outboundPrice
      ? {
          flightNumber: outboundFlightNumber,
          origin: outboundOrigin,
          destination: outboundDestination,
          departureTime: outboundDepartureTime,
          price: Number(outboundPrice),
          currency: outboundCurrency,
        }
      : undefined;

  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchFlights({ origin, destination, departure, passengers: passengersParam }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setFlights(result.value);
        setError(false);
      } else {
        setFlights([]);
        setError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [origin, destination, departure, passengersParam]);

  const summary =
    origin && destination && departure
      ? formatSearchSummary({
          origin,
          destination,
          departure,
          passengers: passengersParam,
          cabin,
        })
      : "Flight Search";

  const passengers = parseInt(passengersParam, 10);

  return (
    <>
      <ResultsHeader summary={summary} />
      <main className="max-w-screen-md mx-auto px-container-margin-mobile pt-md pb-28">
        <RoundTripProgress step={step} outbound={outboundSummary} />
        {error ? (
          <div className="py-xxl flex flex-col items-center gap-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px]">error</span>
            <p className="text-body-md">Something went wrong loading flights.</p>
            <a href="" className="text-primary text-label-md underline">
              Try again
            </a>
          </div>
        ) : flights === null ? (
          <FlightListSkeleton />
        ) : (
          <FlightList
            flights={flights}
            passengers={passengers}
            step={step}
            returnStepParams={returnStepParams}
            outboundParams={outboundParams}
          />
        )}
      </main>
      <BottomNav />
    </>
  );
}
