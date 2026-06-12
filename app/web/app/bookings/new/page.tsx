import type { Metadata } from "next";
import TopAppBar from "../../components/TopAppBar";
import FlightSummaryCard from "./components/FlightSummaryCard";
import BookingClient from "./BookingClient";
import type { Flight } from "@/lib/flight/types";

export const metadata: Metadata = {
  title: "Book Your Flight · Qoomlee",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const p = await searchParams;

  const str = (v: string | string[] | undefined, fallback = ""): string =>
    Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);

  const departureTime = str(p.departureTime, new Date().toISOString());

  const flight: Flight = {
    id: Number(str(p.flightId, "0")),
    flightNumber: str(p.flightNumber, "—"),
    origin: str(p.origin, "—"),
    destination: str(p.destination, "—"),
    departureTime,
    arrivalTime: departureTime,
    basePriceMinor: Number(str(p.price, "0")),
    currency: str(p.currency, "USD"),
    availableSeats: 0,
    status: "SCHEDULED",
    durationMinutes: 0,
  };

  const passengers = Math.max(1, Number(str(p.passengers, "1")));

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
