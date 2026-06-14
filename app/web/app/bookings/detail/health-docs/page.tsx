import { Suspense } from "react";
import HealthDocumentsPageClient from "./HealthDocumentsPageClient";

export default function HealthDocumentsPage() {
  return (
    <Suspense>
      <HealthDocumentsPageClient />
    </Suspense>
  );
}
