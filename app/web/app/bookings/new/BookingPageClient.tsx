"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TopAppBar from "../../components/TopAppBar";
import FlightSummaryCard from "./components/FlightSummaryCard";
import BookingClient from "./BookingClient";
import type { Flight } from "@/lib/flight/types";

export default function BookingPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const str = (key: string, fallback = ""): string => searchParams.get(key) ?? fallback;

  const bookingToken = str("bookingToken");

  // Inject a unique booking-session bookingToken into the URL on first load.
  // The bookingToken survives browser back-navigation so the backend can deduplicate
  // repeated "Continue to Payment" clicks for the same booking session.
  useEffect(() => {
    if (!bookingToken) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("bookingToken", crypto.randomUUID());
      router.replace(`/bookings/new?${params.toString()}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!bookingToken) return null;

  const departureTime = str("departureTime", new Date().toISOString());

  const isRoundTrip = !!str("returnFlightId");

  const flight: Flight = isRoundTrip
    ? {
        id: Number(str("outboundFlightId", "0")),
        flightNumber: str("outboundFlightNumber", "—"),
        origin: str("outboundOrigin", "—"),
        destination: str("outboundDestination", "—"),
        departureTime: str("outboundDepartureTime", departureTime),
        arrivalTime: str("outboundDepartureTime", departureTime),
        basePriceMinor: Number(str("outboundPrice", "0")),
        currency: str("outboundCurrency", "USD"),
        availableSeats: 0,
        status: "SCHEDULED",
        durationMinutes: 0,
      }
    : {
        id: Number(str("flightId", "0")),
        flightNumber: str("flightNumber", "—"),
        origin: str("origin", "—"),
        destination: str("destination", "—"),
        departureTime,
        arrivalTime: departureTime,
        basePriceMinor: Number(str("price", "0")),
        currency: str("currency", "USD"),
        availableSeats: 0,
        status: "SCHEDULED",
        durationMinutes: 0,
      };

  const returnFlight: Flight | undefined = isRoundTrip
    ? {
        id: Number(str("returnFlightId", "0")),
        flightNumber: str("returnFlightNumber", "—"),
        origin: str("returnOrigin", "—"),
        destination: str("returnDestination", "—"),
        departureTime: str("returnDepartureTime", departureTime),
        arrivalTime: str("returnDepartureTime", departureTime),
        basePriceMinor: Number(str("returnPrice", "0")),
        currency: str("currency", "USD"),
        availableSeats: 0,
        status: "SCHEDULED",
        durationMinutes: 0,
      }
    : undefined;

  const passengers = Math.max(1, Number(str("passengers", "1")));

  return (
    <>
      <TopAppBar />
      <main className="pb-36">
        {/* Hero */}
        <section className="hero-gradient pt-xl pb-xxl relative overflow-hidden">
          <div className="px-container-margin-mobile md:px-container-margin-desktop max-w-6xl mx-auto relative z-10">
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-white mb-xs">
              Book Your Flight
            </h1>
            <p className="text-body-md text-white/90">Review and confirm your details</p>
          </div>
          <div className="absolute -right-10 -bottom-4 opacity-20 -rotate-12">
            <span className="material-symbols-outlined text-[120px] text-white">
              airplane_ticket
            </span>
          </div>
        </section>

        {/* Content — overlaps hero by 24px */}
        <div className="max-w-screen-sm mx-auto px-container-margin-mobile md:px-container-margin-desktop -mt-6 relative z-20 space-y-md pb-md">
          <FlightSummaryCard flight={flight} />
          {returnFlight && <FlightSummaryCard flight={returnFlight} />}
          <BookingClient
            flight={flight}
            returnFlight={returnFlight}
            passengers={passengers}
            bookingToken={bookingToken}
          />
        </div>
      </main>
    </>
  );
}
