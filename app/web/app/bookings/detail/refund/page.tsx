import { Suspense } from "react";
import RefundRequestPageClient from "./RefundRequestPageClient";

export default function RefundRequestPage() {
  return (
    <Suspense>
      <RefundRequestPageClient />
    </Suspense>
  );
}
