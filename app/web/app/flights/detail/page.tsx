import type { Metadata } from "next";
import { Suspense } from "react";
import FlightDetailsPageClient from "./FlightDetailsPageClient";
import { FlightDetailSkeleton } from "./_skeleton/FlightDetailSkeleton";

export const metadata: Metadata = {
  title: "Flight Details · Qoomlee",
};

export default function FlightDetailsPage() {
  return (
    <Suspense fallback={<FlightDetailSkeleton />}>
      <FlightDetailsPageClient />
    </Suspense>
  );
}
