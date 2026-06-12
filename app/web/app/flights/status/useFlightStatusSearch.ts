import { useMemo, useState } from "react";
import { mockDepartures as DEPARTURES, type FlightStatus } from "@/lib/mock/flights";

export const STATUS_CONFIG: Record<
  FlightStatus,
  { label: string; bg: string; text: string; icon: string }
> = {
  "on-time": {
    label: "On Time",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "check_circle",
  },
  delayed: {
    label: "Delayed",
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed-variant",
    icon: "schedule",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-error-container",
    text: "text-error",
    icon: "cancel",
  },
  landed: {
    label: "Landed",
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
    icon: "flight_land",
  },
};

export function useFlightStatusSearch() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const filtered = useMemo(
    () =>
      DEPARTURES.filter(
        (f) =>
          !searched ||
          f.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
          f.destination.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, searched],
  );

  function handleQueryChange(value: string) {
    setQuery(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") setSearched(true);
  }

  function handleSearch() {
    setSearched(true);
  }

  return {
    query,
    handleQueryChange,
    handleKeyDown,
    handleSearch,
    filtered,
    departures: DEPARTURES,
  };
}
