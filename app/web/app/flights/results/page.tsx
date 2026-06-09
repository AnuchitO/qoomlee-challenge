import type { Metadata } from "next";
import BottomNav from "../../components/BottomNav";
import ResultsHeader from "./components/ResultsHeader";
import FlightList from "./components/FlightList";
import { fetchFlights } from "./lib/fetchFlights";
import { formatSearchSummary } from "./lib/formatSearchSummary";

interface SearchParams {
  origin?: string;
  destination?: string;
  departure?: string;
  return?: string;
  passengers?: string;
  cabin?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const p = await searchParams;
  return {
    title: `${p.origin ?? "?"} → ${p.destination ?? "?"} · Qoomlee`,
  };
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const flights = await fetchFlights({
    origin: params.origin ?? "",
    destination: params.destination ?? "",
    departure: params.departure ?? "",
    passengers: params.passengers ?? "1",
  });

  const summary =
    params.origin && params.destination && params.departure
      ? formatSearchSummary({
          origin: params.origin,
          destination: params.destination,
          departure: params.departure,
          passengers: params.passengers ?? "1",
          cabin: params.cabin ?? "economy",
        })
      : "Flight Search";

  const passengers = parseInt(params.passengers ?? "1", 10);

  return (
    <>
      <ResultsHeader summary={summary} />
      <main className="max-w-screen-md mx-auto px-container-margin-mobile pt-md pb-28">
        <FlightList flights={flights} passengers={passengers} />
      </main>
      <BottomNav />
    </>
  );
}
