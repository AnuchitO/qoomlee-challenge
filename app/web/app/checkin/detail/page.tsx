import { Suspense } from "react";
import CheckInDetailsPageClient from "./CheckInDetailsPageClient";

export default function CheckInDetailsPage() {
  return (
    <Suspense>
      <CheckInDetailsPageClient />
    </Suspense>
  );
}
