import { useState } from "react";
import { useSearchParams } from "next/navigation";

export interface UploadCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  uploaded?: string;
}

export const HEALTH_DOCS: UploadCard[] = [
  {
    id: "covid",
    icon: "vaccines",
    title: "COVID-19 Vaccination Certificate",
    subtitle: "Recommended for peace of mind",
  },
  {
    id: "pcr",
    icon: "biotech",
    title: "PCR / Antigen Test Result",
    subtitle: "If required by destination",
  },
  {
    id: "yellow-fever",
    icon: "medication",
    title: "Yellow Fever Certificate",
    subtitle: "Required for some transit routes",
  },
];

export function useHealthDocuments() {
  const ref = useSearchParams().get("ref") ?? "";
  const [uploads, setUploads] = useState<Record<string, string>>({});

  function handleUpload(id: string) {
    setUploads((u) => ({ ...u, [id]: "document.pdf" }));
  }

  function handleRemove(id: string) {
    setUploads((u) => {
      const next = { ...u };
      if (Object.prototype.hasOwnProperty.call(next, id)) {
        delete next[id as keyof typeof next];
      }
      return next;
    });
  }

  return { ref, docs: HEALTH_DOCS, uploads, handleUpload, handleRemove };
}
