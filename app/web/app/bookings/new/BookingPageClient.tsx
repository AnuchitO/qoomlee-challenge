"use client";

import { useSearchParams } from "next/navigation";
import TopAppBar from "../../components/TopAppBar";
import FlightSummaryCard from "./components/FlightSummaryCard";
import BookingClient from "./BookingClient";
import type { Flight } from "@/lib/flight/types";

export default function BookingPageClient() {
  const searchParams = useSearchParams();

  const str = (key: string, fallback = ""): string => searchParams.get(key) ?? fallback;

  const departureTime = str("departureTime", new Date().toISOString());

  const flight: Flight = {
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
          <BookingClient flight={flight} passengers={passengers} />
        </div>
      </main>
    </>
  );
}
