import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDelayedAction } from "@/app/hooks/useDelayedAction";

export const REFUND_REASONS = [
  "Flight plans changed",
  "Medical emergency",
  "Travel restrictions",
  "Work commitment",
  "Family emergency",
  "Other",
];

export function useRefundRequest() {
  const ref = useSearchParams().get("ref") ?? "";
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [confirming, setConfirming] = useState(false);
  const schedule = useDelayedAction();

  function handleDetailsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDetails(e.target.value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirming(true);
    schedule(() => {
      router.push(`/bookings/detail?ref=${ref}`);
    }, 1500);
  }

  return {
    ref,
    reasons: REFUND_REASONS,
    reason,
    setReason,
    details,
    handleDetailsChange,
    confirming,
    handleSubmit,
  };
}
