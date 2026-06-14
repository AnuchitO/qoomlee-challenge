import { Suspense } from "react";
import SeatSelectionPageClient from "./SeatSelectionPageClient";
import { SeatSelectionSkeleton } from "./_skeleton/SeatSelectionSkeleton";

export default function SeatSelectionPage() {
  return (
    <Suspense fallback={<SeatSelectionSkeleton />}>
      <SeatSelectionPageClient />
    </Suspense>
  );
}
