import { Suspense } from "react";
import CheckInDetailsPageClient from "./CheckInDetailsPageClient";
import { CheckInDetailsSkeleton } from "./_skeleton/CheckInDetailsSkeleton";

export default function CheckInDetailsPage() {
  return (
    <Suspense fallback={<CheckInDetailsSkeleton />}>
      <CheckInDetailsPageClient />
    </Suspense>
  );
}
