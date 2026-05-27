import type { Metadata } from "next";
import BottomNav from "../../components/BottomNav";
import ResultsHeader from "./components/ResultsHeader";
import FlightList from "./components/FlightList";
import { buildApiUrl } from "./lib/buildApiUrl";
import { formatSearchSummary } from "./lib/formatSearchSummary";
import type { Flight } from "./lib/types";

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

async function fetchFlights(params: SearchParams): Promise<Flight[]> {
  if (!params.origin || !params.destination || !params.departure) {
    return [];
  }

  const url = buildApiUrl({
    origin: params.origin,
    destination: params.destination,
    departure: params.departure,
    passengers: params.passengers ?? "1",
  });

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    // API returns { flights: [...] } or a direct array
    return Array.isArray(data) ? data : (data.flights ?? []);
  } catch {
    return [];
  }
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [flights] = await Promise.all([fetchFlights(params)]);

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
