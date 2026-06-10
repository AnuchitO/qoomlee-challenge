"use client";

import { useFlightStatusSearch } from "./useFlightStatusSearch";
import { FlightStatusView } from "./FlightStatusView";

export default function FlightStatusPage() {
  const props = useFlightStatusSearch();
  return <FlightStatusView {...props} />;
}
