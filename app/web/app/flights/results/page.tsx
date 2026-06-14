import type { Metadata } from "next";
import { Suspense } from "react";
import ResultsPageClient from "./ResultsPageClient";

export const metadata: Metadata = {
  title: "Flight Results · Qoomlee",
};

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsPageClient />
    </Suspense>
  );
}
