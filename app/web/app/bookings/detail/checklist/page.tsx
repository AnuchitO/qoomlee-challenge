import { Suspense } from "react";
import PreFlightChecklistPageClient from "./PreFlightChecklistPageClient";

export default function PreFlightChecklistPage() {
  return (
    <Suspense>
      <PreFlightChecklistPageClient />
    </Suspense>
  );
}
