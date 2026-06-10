"use client";

import { useReviewCheckIn } from "./useReviewCheckIn";
import { ReviewCheckInView } from "./ReviewCheckInView";

export default function ReviewCheckInPage() {
  const props = useReviewCheckIn();
  return <ReviewCheckInView {...props} />;
}
