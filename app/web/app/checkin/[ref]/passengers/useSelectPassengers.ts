import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockCheckinPassengers as MOCK_PASSENGERS } from "@/lib/checkin/mockPassengers";

export function useSelectPassengers() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(MOCK_PASSENGERS.map((p) => p.id)));

  const eligibleCount = MOCK_PASSENGERS.filter((p) => p.eligible).length;
  const allSelected = eligibleCount === selected.size;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(MOCK_PASSENGERS.filter((p) => p.eligible).map((p) => p.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleContinue() {
    router.push(`/checkin/${ref}`);
  }

  return {
    passengers: MOCK_PASSENGERS,
    selected,
    eligibleCount,
    allSelected,
    toggleAll,
    toggle,
    handleContinue,
  };
}
