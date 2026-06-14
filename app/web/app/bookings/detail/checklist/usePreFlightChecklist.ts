import { useState } from "react";
import { useSearchParams } from "next/navigation";

export interface CheckItem {
  id: string;
  label: string;
  status?: "pending" | "warning";
}

export interface CheckSection {
  emoji: string;
  title: string;
  items: CheckItem[];
}

export const CHECKLIST_SECTIONS: CheckSection[] = [
  {
    emoji: "📄",
    title: "Documents",
    items: [
      { id: "passport", label: "Passport checked — valid until Mar 2027" },
      { id: "eta", label: "Australian ETA applied", status: "pending" },
      { id: "insurance", label: "Travel insurance confirmed" },
    ],
  },
  {
    emoji: "🧳",
    title: "Baggage",
    items: [
      { id: "carry-on", label: "Carry-on bag within 7kg limit" },
      { id: "liquids", label: "Liquids in 100ml containers" },
      { id: "checked", label: "Checked bag tagged — 1 of 1" },
    ],
  },
  {
    emoji: "📱",
    title: "Mobile & Tech",
    items: [
      { id: "boarding-pass", label: "Boarding pass downloaded" },
      { id: "phone-charged", label: "Phone fully charged" },
      { id: "power-bank", label: "Power bank in carry-on (not hold)" },
    ],
  },
  {
    emoji: "💊",
    title: "Health",
    items: [
      { id: "medications", label: "Medications in carry-on with prescription", status: "warning" },
      { id: "covid", label: "Check destination entry requirements" },
    ],
  },
  {
    emoji: "🏠",
    title: "Home",
    items: [
      { id: "locks", label: "Doors and windows locked" },
      { id: "valuables", label: "Valuables stored safely" },
    ],
  },
];

export function usePreFlightChecklist() {
  const ref = useSearchParams().get("ref") ?? "";
  const [checked, setChecked] = useState<Set<string>>(
    new Set([
      "passport",
      "insurance",
      "carry-on",
      "liquids",
      "boarding-pass",
      "phone-charged",
      "locks",
    ]),
  );

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const total = CHECKLIST_SECTIONS.flatMap((s) => s.items).length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);

  return { ref, sections: CHECKLIST_SECTIONS, checked, toggle, total, done, pct };
}
