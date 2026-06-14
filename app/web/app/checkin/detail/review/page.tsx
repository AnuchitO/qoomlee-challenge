import { Suspense } from "react";
import ReviewCheckInPageClient from "./ReviewCheckInPageClient";
import { ReviewCheckInSkeleton } from "./_skeleton/ReviewCheckInSkeleton";

export default function ReviewCheckInPage() {
  return (
    <Suspense fallback={<ReviewCheckInSkeleton />}>
      <ReviewCheckInPageClient />
    </Suspense>
  );
}
