import { Suspense } from "react";
import SelectPassengersPageClient from "./SelectPassengersPageClient";

export default function SelectPassengersPage() {
  return (
    <Suspense>
      <SelectPassengersPageClient />
    </Suspense>
  );
}
