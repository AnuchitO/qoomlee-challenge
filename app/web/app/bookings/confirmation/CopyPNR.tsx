"use client";

import { useState } from "react";
import { useDelayedAction } from "@/app/hooks/useDelayedAction";

export default function CopyPNR({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const schedule = useDelayedAction();

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    schedule(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy booking reference"
      className="p-1 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 active:scale-90 transition-all"
    >
      <span className="material-symbols-outlined text-[18px] leading-none">
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}
