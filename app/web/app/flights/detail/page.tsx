import type { Metadata } from "next";
import { Suspense } from "react";
import FlightDetailsPageClient from "./FlightDetailsPageClient";

export const metadata: Metadata = {
  title: "Flight Details · Qoomlee",
};

export default function FlightDetailsPage() {
  return (
    <Suspense>
      <FlightDetailsPageClient />
    </Suspense>
  );
}
