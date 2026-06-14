"use client";

import { useReviewCheckIn } from "./useReviewCheckIn";
import { ReviewCheckInView } from "./ReviewCheckInView";

export default function ReviewCheckInPageClient() {
  const props = useReviewCheckIn();
  return <ReviewCheckInView {...props} />;
}
