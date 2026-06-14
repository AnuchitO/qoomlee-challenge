"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import FlightRoute from "../../components/FlightRoute";

export default function BoardingPassPageClient() {
  const { ref } = useParams<{ ref: string }>();

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex justify-between items-center w-full px-container-margin-mobile py-md h-16">
        <div className="flex items-center gap-md">
          <Link
            href="/checkin"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-primary">close</span>
          </Link>
          <h1 className="text-headline-lg-mobile tracking-tight text-primary">Qoomlee</h1>
        </div>
        <div className="flex items-center gap-sm">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95">
            <span className="material-symbols-outlined text-primary">share</span>
          </button>
        </div>
      </header>

      <main className="max-w-[375px] mx-auto px-container-margin-mobile py-lg pb-28">
        {/* Boarding Pass Card */}
        <div className="relative bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
          {/* Pass Header */}
          <div className="bg-secondary p-md flex justify-between items-center">
            <div className="flex items-center gap-sm text-white">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                flight_takeoff
              </span>
              <span className="text-label-md font-bold tracking-widest uppercase">Qoomlee</span>
            </div>
            <div className="text-right">
              <span className="text-label-sm text-white/70 block">BOARDING PASS</span>
              <span className="text-label-sm text-white/90 font-mono tracking-wider">
                {ref || "QM92Z4"}
              </span>
            </div>
          </div>

          {/* Route */}
          <div className="p-md bg-gradient-to-br from-primary/5 to-transparent">
            <FlightRoute
              variant="boarding-pass"
              codeSize="xl"
              origin="BKK"
              destination="SYD"
              originLabel="Bangkok"
              destinationLabel="Sydney"
              departureTime="09:15"
              arrivalTime="20:45 +1"
              duration="8h 30m"
              stopLabel="Non-stop"
            />
            <p className="text-label-sm text-on-surface-variant mt-sm">
              Mon, 20 May 2024 · Flight QQ101
            </p>
          </div>

          {/* Tear-off divider */}
          <div className="relative flex items-center py-xs overflow-visible">
            <div className="absolute -left-3 w-6 h-6 rounded-full bg-surface-bright border-r border-outline-variant z-10" />
            <div className="w-full border-t-2 border-dashed border-outline-variant" />
            <div className="absolute -right-3 w-6 h-6 rounded-full bg-surface-bright border-l border-outline-variant z-10" />
          </div>

          {/* Passenger & Boarding Stats */}
          <div className="p-md space-y-lg bg-surface-container-low/50">
            <div className="grid grid-cols-2 gap-y-md">
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-label-sm">PASSENGER</span>
                <span className="text-label-md uppercase">Jonathan S. Doe</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-on-surface-variant text-label-sm">BOOKING REF (PNR)</span>
                <span className="text-mono-data tracking-widest text-primary">
                  {ref || "QM92Z4"}
                </span>
              </div>
              <div className="bg-primary/5 p-sm rounded-lg border border-primary/10">
                <span className="text-on-surface-variant text-label-sm">GATE</span>
                <span className="block text-headline-md text-primary">F12</span>
              </div>
              <div className="flex flex-col items-end justify-center">
                <span className="text-on-surface-variant text-label-sm">BOARDING</span>
                <span className="text-headline-md text-primary">13:45</span>
              </div>
              <div className="bg-tertiary-fixed/20 p-sm rounded-lg border border-tertiary-fixed/30">
                <span className="text-on-surface-variant text-label-sm">SEAT</span>
                <span className="block text-headline-md text-tertiary">14A</span>
              </div>
              <div className="flex flex-col items-end justify-center">
                <span className="text-on-surface-variant text-label-sm">CLASS</span>
                <span className="text-headline-md text-on-surface">Economy</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-md">
              <div
                className="p-1 rounded-xl"
                style={{ background: "linear-gradient(135deg, #0057a2 0%, #ffddb2 100%)" }}
              >
                <div className="bg-white p-md rounded-lg">
                  <div
                    className="w-40 h-40 bg-on-surface"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,.15) 3px, rgba(255,255,255,.15) 4px), repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,.15) 3px, rgba(255,255,255,.15) 4px)",
                      borderRadius: "4px",
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-white text-[80px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        qr_code_2
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-label-sm text-on-surface-variant text-center">
                Scan at the gate · Boarding closes 20 min before departure
              </p>
            </div>
          </div>

          {/* Important notice */}
          <div className="p-md border-t border-outline-variant bg-surface-container">
            <div className="flex gap-sm">
              <span
                className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
              <div>
                <h3 className="text-label-md text-on-surface">Important Notice</h3>
                <p className="text-label-sm text-on-surface-variant mt-1 leading-relaxed">
                  Gate closes 20 minutes before departure. Please ensure you have your passport and
                  visa documents ready for inspection.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-xl space-y-md">
          <button className="w-full h-14 bg-on-surface text-surface rounded-xl text-label-md flex items-center justify-center gap-md hover:opacity-90 active:scale-[0.98] transition-all">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              wallet
            </span>
            Add to Apple Wallet
          </button>
          <div className="grid grid-cols-2 gap-md">
            <button className="h-12 border border-outline text-on-surface rounded-xl text-label-md flex items-center justify-center gap-sm hover:bg-surface-container-low transition-colors active:scale-[0.95]">
              <span className="material-symbols-outlined text-[20px]">download</span>
              PDF
            </button>
            <button className="h-12 border border-outline text-on-surface rounded-xl text-label-md flex items-center justify-center gap-sm hover:bg-surface-container-low transition-colors active:scale-[0.95]">
              <span className="material-symbols-outlined text-[20px]">print</span>
              Print
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
