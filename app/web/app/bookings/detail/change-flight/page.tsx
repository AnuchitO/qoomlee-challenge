import { Suspense } from "react";
import ChangeFlightPageClient from "./ChangeFlightPageClient";

export default function ChangeFlightPage() {
  return (
    <Suspense>
      <ChangeFlightPageClient />
    </Suspense>
  );
}
