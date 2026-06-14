import { Suspense } from "react";
import SeatSelectionPageClient from "./SeatSelectionPageClient";

export default function SeatSelectionPage() {
  return (
    <Suspense>
      <SeatSelectionPageClient />
    </Suspense>
  );
}
