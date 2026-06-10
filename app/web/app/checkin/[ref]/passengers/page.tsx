"use client";

import { useSelectPassengers } from "./useSelectPassengers";
import { SelectPassengersView } from "./SelectPassengersView";

export default function SelectPassengersPage() {
  const props = useSelectPassengers();
  return <SelectPassengersView {...props} />;
}
