"use client";

import { useTravelInsurance } from "./useTravelInsurance";
import { TravelInsuranceView } from "./TravelInsuranceView";

export default function TravelInsurancePageClient() {
  const props = useTravelInsurance();
  return <TravelInsuranceView {...props} />;
}
