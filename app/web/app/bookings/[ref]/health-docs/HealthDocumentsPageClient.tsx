"use client";

import { useHealthDocuments } from "./useHealthDocuments";
import { HealthDocumentsView } from "./HealthDocumentsView";

export default function HealthDocumentsPageClient() {
  const props = useHealthDocuments();
  return <HealthDocumentsView {...props} />;
}
