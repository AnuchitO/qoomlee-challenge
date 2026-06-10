"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TopAppBar from "../../../components/TopAppBar";

interface CheckItem {
  id: string;
  label: string;
  status?: "pending" | "warning";
}

interface CheckSection {
  emoji: string;
  title: string;
  items: CheckItem[];
}

const SECTIONS: CheckSection[] = [
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

export default function PreFlightChecklistPage() {
  const { ref } = useParams<{ ref: string }>();
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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const total = SECTIONS.flatMap((s) => s.items).length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="min-h-screen bg-surface pb-24">
      <TopAppBar />
      <main className="pt-4 max-w-[500px] mx-auto px-container-margin-mobile space-y-lg">
        {/* Flight pill */}
        <section className="hero-gradient rounded-xl p-md relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background/20 to-transparent" />
          <p className="text-label-sm text-white/70">Pre-flight Checklist</p>
          <p className="text-label-md text-white font-bold mt-xs">
            Thu, 24 Oct 2024 · 08:00 BKK → SYD
          </p>
        </section>

        {/* Progress */}
        <div className="space-y-sm">
          <div className="flex justify-between items-center">
            <span className="text-label-md text-on-surface">
              {done}/{total} items complete
            </span>
            <span className="text-label-md text-primary font-bold">{pct}%</span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <div className="flex items-center gap-sm p-sm bg-green-50 border border-green-100 rounded-xl">
              <span
                className="material-symbols-outlined text-green-600"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <p className="text-label-md text-green-700">All items checked — you&apos;re good to go!</p>
            </div>
          )}
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-sm">
            <h3 className="text-label-md text-on-surface-variant px-xs">
              {section.emoji} {section.title}
            </h3>
            <div className="space-y-sm">
              {section.items.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-sm p-md bg-surface-container-lowest rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer ${
                    checked.has(item.id) ? "border-primary/20" : "border-outline-variant"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                  />
                  <span
                    className={`text-label-md flex-1 ${
                      checked.has(item.id)
                        ? "line-through text-on-surface-variant"
                        : "text-on-surface"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.status === "pending" && (
                    <span className="bg-error-container text-on-error-container text-label-sm px-2 py-0.5 rounded-full flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Pending
                    </span>
                  )}
                  {item.status === "warning" && (
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-label-sm px-2 py-0.5 rounded-full flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      Note
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}

        <Link
          href={`/bookings/${ref}`}
          className="block text-center text-label-md text-primary hover:underline py-sm"
        >
          Back to booking
        </Link>
      </main>
    </div>
  );
}
