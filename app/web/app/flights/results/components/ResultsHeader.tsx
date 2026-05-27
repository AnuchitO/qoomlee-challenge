"use client";

import { useRouter } from "next/navigation";

interface Props {
  summary: string;
}

export default function ResultsHeader({ summary }: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-surface-container-low border-b border-outline-variant shadow-sm h-16 flex justify-between items-center w-full px-container-margin-mobile">
      <div className="flex items-center gap-md">
        <button
          onClick={() => router.back()}
          className="active:scale-95 transition-transform duration-150 p-base hover:bg-surface-container-high rounded-full"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-primary">
            arrow_back
          </span>
        </button>
        <div className="bg-surface-container-highest px-3 py-1 rounded-full flex items-center gap-xs overflow-hidden">
          <span className="text-label-md text-primary truncate">{summary}</span>
        </div>
      </div>
      <button
        onClick={() => router.back()}
        className="text-label-md text-primary hover:underline px-md py-base rounded-lg active:scale-95 transition-transform"
      >
        Edit
      </button>
    </header>
  );
}
