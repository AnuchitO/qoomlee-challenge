import type { Metadata } from "next";
import Link from "next/link";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import FlightRoute from "../components/FlightRoute";

export const metadata: Metadata = {
  title: "Boarding Passes · Qoomlee",
};

const PASSES = [
  {
    ref: "QM92Z4",
    passenger: "Jonathan S. Doe",
    flightNumber: "QQ101",
    origin: "BKK",
    destination: "SYD",
    departure: "09:15",
    arrival: "20:45",
    date: "Mon, 20 May 2024",
    seat: "14A",
    gate: "F12",
    boarding: "08:10",
    cabin: "ECO",
  },
  {
    ref: "QM92Z5",
    passenger: "Sarah M. Doe",
    flightNumber: "QQ101",
    origin: "BKK",
    destination: "SYD",
    departure: "09:15",
    arrival: "20:45",
    date: "Mon, 20 May 2024",
    seat: "14B",
    gate: "F12",
    boarding: "08:10",
    cabin: "ECO",
  },
];

export default function PassesPage() {
  return (
    <>
      <TopAppBar />
      <main className="pb-28 md:pb-8 max-w-2xl mx-auto px-container-margin-mobile md:px-container-margin-desktop py-lg space-y-lg">
        <header className="flex items-center justify-between">
          <h1 className="text-headline-lg-mobile text-on-surface">Boarding Passes</h1>
          <button className="flex items-center gap-xs text-label-md text-primary hover:underline">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Download All
          </button>
        </header>

        {PASSES.map((pass) => (
          <article
            key={pass.ref}
            className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant overflow-hidden"
          >
            {/* Header */}
            <header className="bg-secondary px-md py-sm flex justify-between items-center">
              <div className="flex items-center gap-sm">
                <span
                  className="material-symbols-outlined text-on-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  flight_takeoff
                </span>
                <span className="text-label-md text-on-secondary font-bold tracking-widest uppercase">
                  Qoomlee
                </span>
              </div>
              <span className="text-label-sm text-on-secondary/70">{pass.date}</span>
            </header>

            {/* Route */}
            <div className="px-md pt-md pb-sm">
              <FlightRoute
                variant="boarding-pass"
                codeSize="lg"
                origin={pass.origin}
                destination={pass.destination}
                departureTime={pass.departure}
                arrivalTime={pass.arrival}
                duration={pass.flightNumber}
                stopLabel="Non-stop"
              />
              <p className="text-label-sm text-on-surface-variant mt-sm">{pass.passenger}</p>
            </div>

            {/* Tear-off */}
            <div className="relative flex items-center overflow-visible py-xs">
              <div className="absolute -left-3 w-5 h-5 rounded-full bg-background border-r border-outline-variant z-10" />
              <div className="w-full border-t-2 border-dashed border-outline-variant" />
              <div className="absolute -right-3 w-5 h-5 rounded-full bg-background border-l border-outline-variant z-10" />
            </div>

            {/* Stats + QR */}
            <div className="px-md pb-md flex items-center justify-between gap-md">
              <div className="grid grid-cols-4 gap-md flex-1">
                {[
                  { label: "SEAT", value: pass.seat, mono: true, primary: true },
                  { label: "GATE", value: pass.gate, mono: false, primary: true },
                  { label: "BOARD", value: pass.boarding, mono: true, primary: false },
                  { label: "CLASS", value: pass.cabin, mono: false, primary: false },
                ].map(({ label, value, mono, primary }) => (
                  <div key={label}>
                    <div className="text-[10px] font-bold text-on-surface-variant">{label}</div>
                    <div
                      className={`${mono ? "text-mono-data" : "text-label-md"} ${primary ? "text-primary" : "text-on-surface"}`}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-16 h-16 bg-surface-container-high rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant text-[40px]">
                  qr_code_2
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-outline-variant px-md py-sm flex items-center justify-between">
              <button className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                Tap to expand full pass
              </button>
              <Link
                href={`/passes/${pass.ref}`}
                className="text-label-md text-primary flex items-center gap-xs hover:underline"
              >
                View
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
            </div>
          </article>
        ))}

        {PASSES.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xxl gap-md text-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[64px]">
              qr_code_2
            </span>
            <h2 className="text-headline-md text-on-surface">No boarding passes yet</h2>
            <p className="text-body-md text-on-surface-variant max-w-[260px]">
              Complete check-in to receive your boarding passes here.
            </p>
            <Link
              href="/checkin"
              className="mt-sm px-xl py-3 bg-primary text-on-primary text-label-md rounded-xl active:scale-95 transition-all"
            >
              Start Check-in
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
