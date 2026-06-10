"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const ROWS_BUSINESS = 4;
const ROWS_ECONOMY = 20;
const COLS = ["A", "B", "C", "", "D", "E", "F"];

const TAKEN = new Set([
  "1A",
  "1C",
  "2B",
  "3D",
  "3F",
  "4E",
  "7A",
  "7B",
  "8C",
  "9D",
  "10F",
  "12E",
  "15A",
  "16B",
  "18C",
  "20F",
]);

type SeatStatus = "available" | "selected" | "taken" | "aisle";

function getSeatStatus(row: number, col: string, selected: string): SeatStatus {
  if (!col) return "aisle";
  const id = `${row}${col}`;
  if (id === selected) return "selected";
  if (TAKEN.has(id)) return "taken";
  return "available";
}

const statusStyle: Record<SeatStatus, string> = {
  available:
    "bg-surface-container-low border-2 border-outline-variant hover:border-primary hover:bg-primary-container/30 cursor-pointer active:scale-95",
  selected: "bg-primary-container border-2 border-primary cursor-pointer",
  taken:
    "bg-surface-container-highest border-2 border-outline-variant cursor-not-allowed opacity-60",
  aisle: "invisible pointer-events-none",
};

export default function SeatSelectionPage() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState("14A");

  function select(row: number, col: string) {
    const id = `${row}${col}`;
    if (TAKEN.has(id)) return;
    setSelected(id);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant sticky top-0 z-50 px-container-margin-mobile h-16 flex justify-between items-center">
        <div className="flex items-center gap-md">
          <Link
            href={`/checkin/${ref}`}
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <h1 className="text-headline-md text-on-surface">Select Your Seat</h1>
        </div>
        <button
          onClick={() => router.push(`/checkin/${ref}`)}
          className="text-label-md text-primary px-sm py-xs hover:bg-primary-container/10 rounded-lg transition-colors"
        >
          Skip
        </button>
      </header>

      <main className="pb-36">
        {/* Flight pill */}
        <section className="px-container-margin-mobile pt-md">
          <div className="bg-surface-container rounded-xl p-md flex justify-between items-center border border-outline-variant">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-[20px]">
                flight_takeoff
              </span>
              <div>
                <p className="text-label-md text-on-surface">QQ101 · Economy</p>
                <p className="text-label-sm text-on-surface-variant">BKK → SYD</p>
              </div>
            </div>
            {selected && (
              <div className="text-right">
                <p className="text-label-sm text-on-surface-variant">Selected</p>
                <p className="text-headline-md text-primary">{selected}</p>
              </div>
            )}
          </div>
        </section>

        {/* Legend */}
        <section className="px-container-margin-mobile py-md flex gap-lg flex-wrap">
          {[
            {
              style: "bg-surface-container-low border-2 border-outline-variant",
              label: "Available",
            },
            { style: "bg-primary-container border-2 border-primary", label: "Selected" },
            {
              style: "bg-surface-container-highest border-2 border-outline-variant opacity-60",
              label: "Taken",
            },
            {
              style: "bg-tertiary-fixed/50 border-2 border-tertiary-fixed",
              label: "Extra Legroom",
            },
          ].map(({ style, label }) => (
            <div key={label} className="flex items-center gap-xs">
              <div className={`w-5 h-5 rounded-lg ${style}`} />
              <span className="text-label-sm text-on-surface-variant">{label}</span>
            </div>
          ))}
        </section>

        {/* Seat map */}
        <div className="mx-auto max-w-[360px] bg-surface-container-lowest border-x border-outline-variant/30 rounded-t-[100px] shadow-sm pt-xl pb-xxl overflow-hidden px-md">
          {/* Nose */}
          <div className="flex justify-center mb-xl opacity-20">
            <span className="material-symbols-outlined text-[48px]">flight</span>
          </div>

          {/* Column labels */}
          <div className="grid grid-cols-[32px_1fr] gap-md mb-sm px-xs">
            <div />
            <div className="grid grid-cols-7 gap-1">
              {COLS.map((col, i) => (
                <div
                  key={`col-${i}`}
                  className="h-6 flex items-center justify-center text-label-sm text-on-surface-variant font-bold"
                >
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* Business Class */}
          <div className="mb-xl">
            <div className="bg-surface-container-high/50 text-center py-sm mb-lg border-y border-outline-variant/20">
              <span className="text-label-sm text-secondary tracking-widest uppercase">
                Business Class · Rows 1–{ROWS_BUSINESS}
              </span>
            </div>
            <div className="space-y-sm">
              {Array.from({ length: ROWS_BUSINESS }, (_, i) => i + 1).map((row) => (
                <div key={row} className="grid grid-cols-[32px_1fr] gap-md items-center">
                  <span className="text-label-sm text-on-surface-variant text-center font-mono">
                    {row}
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {COLS.map((col, ci) => {
                      if (!col) return <div key={`${row}-${ci}`} />;
                      const status = getSeatStatus(row, col, selected);
                      return (
                        <button
                          key={`${row}-${col}`}
                          onClick={() => select(row, col)}
                          disabled={status === "taken"}
                          className={`h-9 rounded-lg text-label-sm transition-all ${statusStyle[status]}`}
                        >
                          {status === "selected" && (
                            <span
                              className="material-symbols-outlined text-primary text-[16px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              person
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Economy Class */}
          <div>
            <div className="bg-surface-container-high/50 text-center py-sm mb-lg border-y border-outline-variant/20">
              <span className="text-label-sm text-secondary tracking-widest uppercase">
                Economy Class · Rows {ROWS_BUSINESS + 1}–{ROWS_BUSINESS + ROWS_ECONOMY}
              </span>
            </div>
            <div className="space-y-sm">
              {Array.from({ length: ROWS_ECONOMY }, (_, i) => i + ROWS_BUSINESS + 1).map((row) => (
                <div key={row} className="grid grid-cols-[32px_1fr] gap-md items-center">
                  <span className="text-label-sm text-on-surface-variant text-center font-mono">
                    {row}
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {COLS.map((col, ci) => {
                      if (!col) return <div key={`${row}-${ci}`} />;
                      const status = getSeatStatus(row, col, selected);
                      return (
                        <button
                          key={`${row}-${col}`}
                          onClick={() => select(row, col)}
                          disabled={status === "taken"}
                          className={`h-9 rounded-lg text-label-sm transition-all ${statusStyle[status]}`}
                        >
                          {status === "selected" && (
                            <span
                              className="material-symbols-outlined text-primary text-[16px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              person
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50">
        <div className="flex justify-between items-center mb-sm">
          <span className="text-label-sm text-on-surface-variant">Selected seat</span>
          <span className="text-headline-md text-primary">{selected || "—"}</span>
        </div>
        <button
          onClick={() => router.push(`/checkin/${ref}`)}
          disabled={!selected}
          className="w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-sm"
        >
          Confirm Seat {selected}
          <span className="material-symbols-outlined text-[20px]">check</span>
        </button>
      </div>
    </div>
  );
}
