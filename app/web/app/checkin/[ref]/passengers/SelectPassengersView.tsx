import Link from "next/link";
import type { Passenger } from "@/lib/mock/passenger";

interface SelectPassengersViewProps {
  passengers: Passenger[];
  selected: Set<string>;
  eligibleCount: number;
  allSelected: boolean;
  toggleAll: () => void;
  toggle: (id: string) => void;
  handleContinue: () => void;
}

export function SelectPassengersView({
  passengers,
  selected,
  eligibleCount,
  allSelected,
  toggleAll,
  toggle,
  handleContinue,
}: SelectPassengersViewProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center px-container-margin-mobile h-16">
        <Link
          href="/checkin"
          className="mr-md p-2 rounded-full hover:bg-surface-container-high active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </Link>
        <h1 className="text-headline-md text-on-surface">Select Passengers</h1>
      </header>

      <main className="pb-32 max-w-[500px] mx-auto w-full px-container-margin-mobile">
        {/* Progress stepper */}
        <section className="py-lg flex items-center justify-between px-md">
          {["Passengers", "Details", "Confirm"].map((step, i) => (
            <div key={step} className="flex items-center gap-sm flex-1">
              <div className={`flex flex-col items-center gap-1 ${i === 0 ? "" : "opacity-40"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? "bg-primary text-on-primary"
                      : "border-2 border-outline text-on-surface"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-label-sm ${i === 0 ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {step}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-outline-variant mb-4" />}
            </div>
          ))}
        </section>

        {/* Flight summary */}
        <section className="bg-primary p-md rounded-xl text-on-primary mb-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-label-sm text-white/70 uppercase tracking-wider">Flight</p>
              <h2 className="text-headline-md text-white">QQ101</h2>
            </div>
            <div className="text-right">
              <p className="text-label-sm text-white/70">Bangkok (BKK)</p>
              <p className="text-label-md text-white font-bold">→ Sydney (SYD)</p>
            </div>
          </div>
          <div className="flex items-center gap-sm mt-sm">
            <span className="material-symbols-outlined text-[16px] text-white/70">schedule</span>
            <span className="text-label-sm text-white/80">9h 32m remaining to check in</span>
          </div>
        </section>

        {/* Select all */}
        <div className="bg-surface-container-low rounded-xl p-md border border-outline-variant flex items-center justify-between mb-sm">
          <label className="flex items-center gap-sm cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
            />
            <span className="text-label-md text-on-surface">Select all eligible passengers</span>
          </label>
          <span className="text-label-sm text-on-surface-variant">
            {selected.size} of {eligibleCount} eligible
          </span>
        </div>

        {/* Passenger list */}
        <section className="space-y-sm">
          {passengers.map((p) => (
            <div
              key={p.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-start gap-md shadow-sm"
            >
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                disabled={!p.eligible}
                className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-sm">
                  <h3 className="text-label-md text-on-surface">{p.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                    {p.eligible ? "Eligible" : "Not eligible"}
                  </span>
                </div>
                <p className="mt-xs text-label-sm text-on-surface-variant">
                  {p.type} · Seat {p.seat} · {p.cabin}
                </p>
              </div>
              <span className="material-symbols-outlined text-outline text-[20px]">
                {selected.has(p.id) ? "how_to_reg" : "person"}
              </span>
            </div>
          ))}
        </section>
      </main>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50">
        <button
          onClick={handleContinue}
          disabled={selected.size === 0}
          className="w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-sm"
        >
          Continue with {selected.size} passenger{selected.size !== 1 ? "s" : ""}
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
