import { Suspense } from "react";
import SelectPassengersPageClient from "./SelectPassengersPageClient";
import { SelectPassengersSkeleton } from "./_skeleton/SelectPassengersSkeleton";

export default function SelectPassengersPage() {
  return (
    <Suspense fallback={<SelectPassengersSkeleton />}>
      <SelectPassengersPageClient />
    </Suspense>
  );
}
