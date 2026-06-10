"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import TopAppBar from "../components/TopAppBar";

export default function CheckInPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <>
      <TopAppBar />
      <main className="pb-24 md:pb-8 max-w-[500px] mx-auto px-container-margin-mobile md:px-container-margin-desktop">
        {/* Success state: check-in open card */}
        <div className="flex flex-col items-center text-center space-y-lg py-xl">
          {/* Animated icon */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-surface-container-high flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[64px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
              >
                check_circle
              </span>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping opacity-25" />
          </div>

          <div className="space-y-sm">
            <h1 className="text-headline-lg-mobile text-on-surface">Online Check-in</h1>
            <p className="text-body-md text-on-surface-variant max-w-[280px] mx-auto">
              Enter your booking reference and last name to begin check-in.
            </p>
          </div>

          {/* Lookup form */}
          <section className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-md text-left">
            <div className="space-y-xs">
              <label className="text-label-sm text-on-surface-variant" htmlFor="bookingRef">
                Booking Reference (PNR)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  confirmation_number
                </span>
                <input
                  id="bookingRef"
                  type="text"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                  placeholder="e.g. QM92Z4"
                  maxLength={6}
                  className="w-full h-12 pl-12 pr-md rounded-xl border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-bright transition-all text-body-md tracking-widest uppercase"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-sm text-on-surface-variant" htmlFor="lastName">
                Last Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  person
                </span>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="As shown on passport"
                  className="w-full h-12 pl-12 pr-md rounded-xl border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-bright transition-all text-body-md"
                />
              </div>
            </div>

            <Link
              href={`/checkin/${bookingRef || "QM92Z4"}/passengers`}
              className="block w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 flex items-center justify-center"
            >
              Start Check-in
            </Link>
          </section>

          {/* Demo open flight card */}
          <div className="w-full bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-6xl">flight_takeoff</span>
            </div>
            <div className="flex justify-between items-start mb-sm">
              <div>
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm">
                  Economy
                </span>
                <h2 className="text-headline-md text-primary mt-sm">Flight QQ101</h2>
              </div>
              <div className="text-right">
                <p className="text-label-sm text-outline uppercase tracking-wider">Check-in Open</p>
                <p className="text-label-md text-on-surface font-bold">
                  <span
                    className="material-symbols-outlined text-green-600 text-[16px] align-middle mr-1"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    circle
                  </span>
                  Available Now
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-sm border-t border-outline-variant">
              <div>
                <p className="text-label-sm text-on-surface-variant">Bangkok (BKK)</p>
                <p className="text-headline-md text-on-surface">09:15</p>
              </div>
              <div className="flex flex-col items-center text-on-surface-variant flex-1 px-md">
                <p className="text-label-sm">8h 30m</p>
                <div className="w-full flex items-center my-xs">
                  <div className="flex-1 border-t-2 border-dashed border-outline-variant"></div>
                  <span className="material-symbols-outlined text-primary text-[20px] rotate-90 mx-1">
                    flight
                  </span>
                  <div className="flex-1 border-t-2 border-dashed border-outline-variant"></div>
                </div>
                <span className="bg-surface-container-high text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-medium">
                  Non-stop
                </span>
              </div>
              <div className="text-right">
                <p className="text-label-sm text-on-surface-variant">Sydney (SYD)</p>
                <p className="text-headline-md text-on-surface">20:45</p>
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-sm px-lg py-3 bg-error-container/10 border border-error-container rounded-xl w-full">
            <span className="material-symbols-outlined text-error text-[20px]">timer</span>
            <p className="text-label-md text-error">
              Check-in Deadline: <span className="font-bold">Closes in 18 hours</span>
            </p>
          </div>

          {/* Loyalty hint */}
          <div className="flex items-center justify-center gap-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">military_tech</span>
            <p className="text-label-sm">Gold Elite: Priority boarding enabled</p>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
