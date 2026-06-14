import type { Metadata } from "next";
import { Suspense } from "react";
import ResultsPageClient from "./ResultsPageClient";
import { ResultsPageSkeleton } from "./_skeleton/ResultsPageSkeleton";

export const metadata: Metadata = {
  title: "Flight Results · Qoomlee",
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <ResultsPageClient />
    </Suspense>
  );
}
