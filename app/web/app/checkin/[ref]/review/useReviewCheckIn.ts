import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReviewPassengers } from "@/lib/checkin/mockPassengers";
import { useDelayedAction } from "@/app/hooks/useDelayedAction";

export function useReviewCheckIn() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const schedule = useDelayedAction();

  function handleConfirm() {
    setConfirming(true);
    schedule(() => {
      router.push(`/passes/${ref}`);
    }, 1000);
  }

  return { ref, passengers: getReviewPassengers(ref), confirming, handleConfirm };
}
