import Link from "next/link";
import type { Passenger } from "@/lib/checkin/mockPassengers";

interface ReviewCheckInViewProps {
  ref: string;
  passengers: Passenger[];
  confirming: boolean;
  handleConfirm: () => void;
}

export function ReviewCheckInView({
  ref,
  passengers,
  confirming,
  handleConfirm,
}: ReviewCheckInViewProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center px-container-margin-mobile h-16">
        <Link
          href={`/checkin/${ref}`}
          className="mr-md p-2 rounded-full hover:bg-surface-container-high active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </Link>
        <h1 className="text-headline-md text-on-surface">Review Check-in</h1>
      </header>

      <main className="pb-32 max-w-[500px] mx-auto w-full px-container-margin-mobile py-lg space-y-lg">
        {/* Progress */}
        <div className="flex items-center justify-between px-lg py-sm">
          {["Select", "Details", "Review"].map((step, i) => (
            <div key={step} className="flex items-center gap-xs flex-1">
              <div className="flex flex-col items-center gap-xs">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm ${
                    i === 2 ? "bg-primary text-on-primary scale-110" : "bg-primary text-on-primary"
                  }`}
                >
                  {i < 2 ? (
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  ) : (
                    <span className="text-xs">{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-label-sm ${i === 2 ? "text-primary text-label-md" : "text-primary"}`}
                >
                  {step}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-[2px] bg-primary mx-xs mb-4" />}
            </div>
          ))}
        </div>

        {/* Header */}
        <section>
          <h2 className="text-headline-lg-mobile text-on-surface">Ready to fly?</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Review your details carefully. Your digital boarding passes will be generated once you
            confirm.
          </p>
        </section>

        {/* Passenger cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {passengers.map((p) => (
            <div
              key={p.id}
              className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm"
            >
              <div className="flex justify-between items-start mb-md">
                <div>
                  <p className="text-label-sm text-on-surface-variant">Passenger {p.id}</p>
                  <h3 className="text-label-md text-on-surface font-bold">{p.name}</h3>
                </div>
                <span
                  className="material-symbols-outlined text-primary text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  how_to_reg
                </span>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                {[
                  { label: "Seat", value: p.seat, icon: "event_seat" },
                  { label: "Gate", value: p.gate, icon: "door_back" },
                  { label: "Class", value: p.cabin, icon: "airline_seat_recline_normal" },
                  { label: "Bags", value: `${p.bags} checked`, icon: "luggage" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-surface-container-low rounded-lg p-sm">
                    <div className="flex items-center gap-xs mb-xs">
                      <span className="material-symbols-outlined text-outline text-[16px]">
                        {icon}
                      </span>
                      <p className="text-label-sm text-on-surface-variant">{label}</p>
                    </div>
                    <p className="text-label-md text-on-surface">{value}</p>
                  </div>
                ))}
              </div>

              <Link
                href={`/checkin/${ref}`}
                className="flex items-center gap-xs text-label-sm text-primary hover:underline mt-md"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit details
              </Link>
            </div>
          ))}
        </div>

        {/* Flight summary */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <h3 className="text-label-md text-on-surface-variant mb-md uppercase tracking-wider">
            Flight Summary
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-headline-md text-on-surface">BKK</p>
              <p className="text-label-sm text-on-surface-variant">09:15</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-[20px]">
                flight_takeoff
              </span>
              <p className="text-label-sm text-on-surface-variant">QQ101</p>
            </div>
            <div className="text-right">
              <p className="text-headline-md text-on-surface">SYD</p>
              <p className="text-label-sm text-on-surface-variant">20:45</p>
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant mt-sm">
            Mon, 20 May 2024 · Non-stop · 8h 30m
          </p>
        </section>

        {/* Terms */}
        <p className="text-label-sm text-on-surface-variant text-center">
          By confirming, you agree to our{" "}
          <Link href="#" className="text-primary hover:underline">
            check-in terms
          </Link>{" "}
          and confirm all passenger details are correct.
        </p>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50">
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-70 flex items-center justify-center gap-sm"
        >
          {confirming ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
              Generating passes...
            </>
          ) : (
            <>
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                how_to_reg
              </span>
              Confirm Check-in
            </>
          )}
        </button>
      </div>
    </div>
  );
}
