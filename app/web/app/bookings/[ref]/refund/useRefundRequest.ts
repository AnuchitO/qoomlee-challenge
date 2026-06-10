import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export const REFUND_REASONS = [
  "Flight plans changed",
  "Medical emergency",
  "Travel restrictions",
  "Work commitment",
  "Family emergency",
  "Other",
];

export function useRefundRequest() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [confirming, setConfirming] = useState(false);

  function handleDetailsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDetails(e.target.value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirming(true);
    setTimeout(() => {
      router.push(`/bookings/${ref}`);
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
