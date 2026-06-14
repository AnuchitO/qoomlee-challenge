import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getReviewPassengers } from "@/lib/checkin/mockPassengers";
import { useDelayedAction } from "@/app/hooks/useDelayedAction";

export function useReviewCheckIn() {
  const ref = useSearchParams().get("ref") ?? "";
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const schedule = useDelayedAction();

  function handleConfirm() {
    setConfirming(true);
    schedule(() => {
      router.push(`/passes/detail?ref=${ref}`);
    }, 1000);
  }

  return { ref, passengers: getReviewPassengers(ref), confirming, handleConfirm };
}
