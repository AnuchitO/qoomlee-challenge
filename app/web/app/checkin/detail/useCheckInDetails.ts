import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export type CheckInTab = "personal" | "baggage" | "seats" | "extras";

export const CHECKIN_TABS: { id: CheckInTab; label: string }[] = [
  { id: "personal", label: "Personal Details" },
  { id: "baggage", label: "Baggage" },
  { id: "seats", label: "Seat Selection" },
  { id: "extras", label: "Extras" },
];

export function useCheckInDetails() {
  const ref = useSearchParams().get("ref") ?? "";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CheckInTab>("baggage");
  const [bags, setBags] = useState(1);
  const [carryOnConfirmed, setCarryOnConfirmed] = useState(false);

  function incrementBags() {
    setBags((b) => Math.min(4, b + 1));
  }

  function decrementBags() {
    setBags((b) => Math.max(0, b - 1));
  }

  function handleCarryOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCarryOnConfirmed(e.target.checked);
  }

  function goToSeats() {
    router.push(`/checkin/detail/seats?ref=${ref}`);
  }

  function completeCheckIn() {
    router.push(`/passes/detail?ref=${ref}`);
  }

  return {
    ref,
    activeTab,
    setActiveTab,
    bags,
    incrementBags,
    decrementBags,
    carryOnConfirmed,
    handleCarryOnChange,
    goToSeats,
    completeCheckIn,
  };
}
