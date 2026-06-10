import { useState } from "react";

export type TripType = "round" | "oneway";

export function useSearchForm() {
  const [tripType, setTripType] = useState<TripType>("round");

  return { tripType, setTripType };
}
