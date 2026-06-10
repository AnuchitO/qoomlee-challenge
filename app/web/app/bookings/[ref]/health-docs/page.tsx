"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface UploadCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  uploaded?: string;
}

const DOCS: UploadCard[] = [
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

export default function HealthDocumentsPage() {
  const { ref } = useParams<{ ref: string }>();
  const [uploads, setUploads] = useState<Record<string, string>>({});

  function handleUpload(id: string) {
    setUploads((u) => ({ ...u, [id]: "document.pdf" }));
  }

  function handleRemove(id: string) {
    setUploads((u) => {
      const next = { ...u };
      delete next[id];
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant sticky top-0 z-50 flex items-center justify-between px-container-margin-mobile h-16">
        <div className="flex items-center gap-md">
          <Link
            href={`/bookings/${ref}`}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-headline-md text-on-surface">Health Documents</h1>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 pb-24 max-w-[500px] mx-auto w-full px-container-margin-mobile py-lg space-y-lg">
        {/* Status banner */}
        <section className="bg-green-50 border border-green-200 rounded-xl p-md flex items-start gap-md">
          <span
            className="material-symbols-outlined text-green-600 text-[24px] shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <div>
            <p className="text-label-md text-on-surface">No vaccination required for BKK → SYD</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">
              Requirements may change — check closer to travel.
            </p>
          </div>
        </section>

        {/* Upload section */}
        <section>
          <h2 className="text-label-md text-on-surface-variant mb-md">
            Optional: Keep health records on file
          </h2>
          <div className="space-y-md">
            {DOCS.map((doc) => (
              <div
                key={doc.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm"
              >
                <div className="flex items-start gap-md mb-md">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/5 rounded-full">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      {doc.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-label-md text-on-surface">{doc.title}</h3>
                    <p className="text-label-sm text-on-surface-variant">{doc.subtitle}</p>
                  </div>
                  {uploads[doc.id] && (
                    <span
                      className="material-symbols-outlined text-green-600 text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  )}
                </div>

                {uploads[doc.id] ? (
                  <div className="flex items-center justify-between p-sm bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-green-600 text-[20px]">
                        description
                      </span>
                      <span className="text-label-sm text-on-surface">{uploads[doc.id]}</span>
                    </div>
                    <button
                      onClick={() => handleRemove(doc.id)}
                      className="text-label-sm text-error hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpload(doc.id)}
                    className="w-full rounded-xl p-xl flex flex-col items-center justify-center gap-sm active:scale-95 transition-transform cursor-pointer border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-outline text-[32px]">
                      upload_file
                    </span>
                    <span className="text-label-md text-on-surface-variant">
                      Tap to upload PDF or image
                    </span>
                    <span className="text-label-sm text-outline">Max 10MB</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Info note */}
        <div className="flex items-start gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant">
          <span className="material-symbols-outlined text-outline text-[20px] shrink-0 mt-0.5">
            info
          </span>
          <p className="text-label-sm text-on-surface-variant">
            Documents are stored securely and only shared with destination authorities when required
            by regulation.
          </p>
        </div>

        <Link
          href={`/bookings/${ref}`}
          className="block w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm"
        >
          Save &amp; Continue
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      </main>
    </div>
  );
}
