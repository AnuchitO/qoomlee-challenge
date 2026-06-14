import { Suspense } from "react";
import ReviewCheckInPageClient from "./ReviewCheckInPageClient";

export default function ReviewCheckInPage() {
  return (
    <Suspense>
      <ReviewCheckInPageClient />
    </Suspense>
  );
}
