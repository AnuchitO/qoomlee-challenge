import { Suspense } from "react";
import TravelInsurancePageClient from "./TravelInsurancePageClient";

export default function TravelInsurancePage() {
  return (
    <Suspense>
      <TravelInsurancePageClient />
    </Suspense>
  );
}
