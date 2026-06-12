import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFlightAlternatives } from "@/lib/flight/mock";
import { useDelayedAction } from "@/app/hooks/useDelayedAction";

export function useChangeFlight() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("2024-10-24");
  const [confirming, setConfirming] = useState<string | null>(null);
  const schedule = useDelayedAction();

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedDate(e.target.value);
  }

  function handleSelect(flightId: string) {
    setConfirming(flightId);
    schedule(() => {
      router.push(`/bookings/${ref}`);
    }, 1200);
  }

  return {
    ref,
    alternatives: getFlightAlternatives(ref),
    selectedDate,
    handleDateChange,
    confirming,
    handleSelect,
  };
}
