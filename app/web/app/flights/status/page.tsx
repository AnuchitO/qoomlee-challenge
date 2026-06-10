"use client";

import { useState } from "react";
import Link from "next/link";
import TopAppBar from "../../components/TopAppBar";
import BottomNav from "../../components/BottomNav";
import FlightRoute from "../../components/FlightRoute";
import { mockDepartures as DEPARTURES, type FlightStatus } from "@/lib/mock/flights";

const statusConfig: Record<
  FlightStatus,
  { label: string; bg: string; text: string; icon: string }
> = {
  "on-time": {
    label: "On Time",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "check_circle",
  },
  delayed: {
    label: "Delayed",
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed-variant",
    icon: "schedule",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-error-container",
    text: "text-error",
    icon: "cancel",
  },
  landed: {
    label: "Landed",
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
    icon: "flight_land",
  },
};

function StatusBadge({ status }: { status: FlightStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-xs px-3 py-1 rounded-full text-label-sm font-bold ${cfg.bg} ${cfg.text}`}
    >
      <span
        className="material-symbols-outlined text-[16px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

export default function FlightStatusPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const filtered = DEPARTURES.filter(
    (f) =>
      !searched ||
      f.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
      f.destination.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <TopAppBar />
      <main className="pb-28 max-w-2xl mx-auto px-container-margin-mobile py-lg space-y-lg">
        <div>
          <h1 className="text-headline-lg-mobile text-on-surface">Flight Status</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Check real-time status for any flight.
          </p>
        </div>

        {/* Search */}
        <section className="flex gap-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearched(true)}
              placeholder="Flight number e.g. QQ101"
              className="w-full h-12 pl-12 pr-md rounded-xl border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-bright transition-all text-body-md"
            />
          </div>
          <button
            onClick={() => setSearched(true)}
            className="bg-primary-container text-on-primary-container px-lg py-3 rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all"
          >
            Search
          </button>
        </section>

        {/* Status cards */}
        <div className="space-y-md">
          {filtered.map((flight) => {
            const cfg = statusConfig[flight.status];
            return (
              <section
                key={flight.flightNumber}
                className={`bg-surface-container-lowest rounded-xl border overflow-hidden shadow-sm ${
                  flight.status === "delayed"
                    ? "border-2 border-tertiary-fixed-dim/30"
                    : "border-outline-variant"
                }`}
              >
                <div className="p-md space-y-md">
                  <div className="flex justify-between items-center">
                    <StatusBadge status={flight.status} />
                    <span className="text-label-sm text-on-surface-variant">
                      {flight.flightNumber}
                    </span>
                  </div>

                  {/* Route row */}
                  <FlightRoute
                    size="lg"
                    origin={flight.origin}
                    destination={flight.destination}
                    departureTime={flight.departure}
                    arrivalTime={flight.arrival}
                    stopLabel="Non-stop"
                  />

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-md">
                    <div className="bg-surface-container-low rounded-lg p-sm">
                      <p className="text-label-sm text-on-surface-variant">Gate</p>
                      <p className="text-label-md text-on-surface font-bold">
                        {flight.gate ?? "TBC"}
                      </p>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-sm">
                      <p className="text-label-sm text-on-surface-variant">Terminal</p>
                      <p className="text-label-md text-on-surface font-bold">
                        {flight.terminal ?? "TBC"}
                      </p>
                    </div>
                  </div>

                  {/* Delay notice */}
                  {flight.delay && (
                    <div className="flex items-start gap-sm p-sm bg-tertiary-fixed/20 rounded-lg border border-tertiary-fixed/30">
                      <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5">
                        info
                      </span>
                      <p className="text-label-sm text-on-tertiary-fixed-variant">{flight.delay}</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Departures board */}
        <section className="space-y-md">
          <h2 className="text-headline-md text-on-surface">Departures from BKK</h2>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant">
                <tr>
                  {["Flight", "Time", "Gate", "Status"].map((col) => (
                    <th key={col} className="p-3 text-label-sm text-on-surface-variant">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {DEPARTURES.map((f) => {
                  const cfg = statusConfig[f.status];
                  return (
                    <tr
                      key={f.flightNumber}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <td className="p-3">
                        <p className="text-label-md text-on-surface">{f.flightNumber}</p>
                        <p className="text-label-sm text-on-surface-variant">{f.destination}</p>
                      </td>
                      <td className="p-3 text-label-md text-on-surface">{f.departure}</td>
                      <td className="p-3 text-label-md text-on-surface">{f.gate ?? "TBC"}</td>
                      <td className="p-3">
                        <span className={`text-label-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
