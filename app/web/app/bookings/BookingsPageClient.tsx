"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import { BookingsListSkeleton } from "./_skeleton/BookingsListSkeleton";
import { getJson } from "@/lib/api/httpClient";
import { authHeaders } from "@/lib/session/sessionToken";
import { formatTHB } from "@/lib/currency/format";
import { formatFlightTime } from "@/lib/flight/dateTime";

export interface Summary {
  bookingRef: string;
  status: "PENDING" | "CONFIRMED" | "EXPIRED";
  expiresAt?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  passengers: number;
  totalAmount: string;
  currency: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function minutesUntil(iso: string): number {
  return Math.max(0, Math.round((Date.parse(iso) - Date.now()) / 60000));
}

function statusBadge(booking: Summary): { label: string; color: string } {
  switch (booking.status) {
    case "CONFIRMED":
      return { label: "Confirmed", color: "bg-green-100 text-green-700" };
    case "PENDING":
      return {
        label: `Awaiting payment · expires in ${minutesUntil(booking.expiresAt ?? "")}m`,
        color: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
      };
    case "EXPIRED":
      return { label: "Expired", color: "bg-surface-container-high text-on-surface-variant" };
  }
}

export default function BookingsPageClient() {
  const [bookings, setBookings] = useState<Summary[] | null>(null);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_QOOMLEE_API_URL ?? "http://localhost:8082";

    getJson<Summary[]>(`${apiBase}/api/bookings`, { headers: authHeaders() }).then((result) => {
      setBookings(result.ok ? result.value : []);
    });
  }, []);

  return (
    <>
      <TopAppBar />
      <main className="pb-28 md:pb-8 max-w-2xl mx-auto px-container-margin-mobile md:px-container-margin-desktop py-lg space-y-lg">
        <h1 className="text-headline-lg-mobile text-on-surface">My Bookings</h1>

        {bookings === null && <BookingsListSkeleton />}

        {bookings?.map((booking) => {
          const badge = statusBadge(booking);
          return (
            <Link
              key={booking.bookingRef}
              href={`/bookings/detail?ref=${booking.bookingRef}`}
              className="block bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99] overflow-hidden group"
            >
              {/* Card header */}
              <div className="bg-surface-container px-md py-sm flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span
                    className="material-symbols-outlined text-primary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    airplane_ticket
                  </span>
                  <span className="text-label-sm text-on-surface-variant font-mono tracking-wider">
                    {booking.bookingRef}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-label-sm font-bold ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              {/* Route info */}
              <div className="p-md flex items-center justify-between">
                <div>
                  <h2 className="text-headline-md text-on-surface">
                    {booking.origin} — {booking.destination}
                  </h2>
                  <p className="text-body-md text-on-surface-variant mt-xs">
                    {formatDate(booking.departureTime)}
                  </p>
                  <p className="text-label-sm text-on-surface-variant mt-xs">
                    {formatFlightTime(booking.departureTime)} →{" "}
                    {formatFlightTime(booking.arrivalTime)}
                  </p>
                  <p className="text-label-sm text-on-surface-variant mt-xs">
                    {booking.flightNumber} · {booking.passengers} passengers
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-label-sm text-on-surface-variant">Total</p>
                  <p className="text-headline-md text-primary font-bold">
                    {formatTHB(Number(booking.totalAmount))}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}

        {bookings?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-xxl gap-md text-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[64px]">
              confirmation_number
            </span>
            <h2 className="text-headline-md text-on-surface">No bookings yet</h2>
            <p className="text-body-md text-on-surface-variant max-w-[260px]">
              Book your first flight to get started.
            </p>
            <Link
              href="/flights"
              className="mt-sm px-xl py-3 bg-primary text-on-primary text-label-md rounded-xl active:scale-95 transition-all"
            >
              Search Flights
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
