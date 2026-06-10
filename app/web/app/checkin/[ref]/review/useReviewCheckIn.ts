import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockReviewPassengers as PASSENGERS } from "@/lib/mock/passenger";

export function useReviewCheckIn() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    setConfirming(true);
    setTimeout(() => {
      router.push(`/passes/${ref}`);
    }, 1000);
  }

  return { ref, passengers: PASSENGERS, confirming, handleConfirm };
}
