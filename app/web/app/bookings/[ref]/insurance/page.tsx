"use client";

import { useTravelInsurance } from "./useTravelInsurance";
import { TravelInsuranceView } from "./TravelInsuranceView";

export default function TravelInsurancePage() {
  const props = useTravelInsurance();
  return <TravelInsuranceView {...props} />;
}
