"use client";

import { useSelectPassengers } from "./useSelectPassengers";
import { SelectPassengersView } from "./SelectPassengersView";

export default function SelectPassengersPageClient() {
  const props = useSelectPassengers();
  return <SelectPassengersView {...props} />;
}
