"use client";

import Link from "next/link";
import TopAppBar from "../../components/TopAppBar";
import BottomNav from "../../components/BottomNav";
import FlightRoute from "../../components/FlightRoute";
import { BookingDetailSkeleton } from "./_skeleton/BookingDetailSkeleton";
import { findAirport } from "../../flights/data/airports";
import { useManageBooking } from "./useManageBooking";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

function formatDuration(depIso: string, arrIso: string): string {
  const minutes = Math.round((Date.parse(arrIso) - Date.parse(depIso)) / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function ManageBookingPageClient() {
  const { ref, loadState, booking } = useManageBooking();

  return (
    <>
      <TopAppBar />
      <main className="pb-24 max-w-6xl mx-auto px-container-margin-mobile md:px-container-margin-desktop py-lg space-y-lg">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <p className="text-label-sm text-primary mb-xs">Reference: {ref}</p>
            <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Manage Your Trip
            </h2>
          </div>
        </section>

        {loadState === "loading" && <BookingDetailSkeleton />}

        {loadState === "ready" && booking && (
          <>
            {/* Booking selector */}
            <section className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-md">
                <div className="p-sm bg-primary-container text-on-primary-container rounded-lg">
                  <span className="material-symbols-outlined">luggage</span>
                </div>
                <div>
                  <h3 className="text-headline-md text-on-surface">
                    {booking.flight.origin} — {booking.flight.destination}
                  </h3>
                  <p className="text-body-md text-on-surface-variant">
                    {formatDate(booking.flight.departureTime)}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              {/* Trip details */}
              <div className="lg:col-span-2 space-y-md">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                  {/* Segment header */}
                  <div className="bg-secondary px-md py-sm flex justify-between items-center">
                    <div className="flex items-center gap-sm text-white">
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        flight_takeoff
                      </span>
                      <span className="text-label-md">{booking.flight.flightNumber} · Economy</span>
                    </div>
                    <span className="text-label-sm text-white/70">
                      {formatDate(booking.flight.departureTime)}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="p-md">
                    <FlightRoute
                      size="xl"
                      origin={booking.flight.origin}
                      destination={booking.flight.destination}
                      originLabel={
                        findAirport(booking.flight.origin)?.city ?? booking.flight.origin
                      }
                      destinationLabel={
                        findAirport(booking.flight.destination)?.city ?? booking.flight.destination
                      }
                      departureTime={formatTime(booking.flight.departureTime)}
                      arrivalTime={formatTime(booking.flight.arrivalTime)}
                      duration={formatDuration(
                        booking.flight.departureTime,
                        booking.flight.arrivalTime,
                      )}
                      stopLabel="Non-stop"
                      showDots
                    />

                    {/* Passenger info */}
                    <div className="border-t border-outline-variant pt-md grid grid-cols-2 gap-md mt-md">
                      <div className="space-y-sm">
                        <p className="text-label-sm text-on-surface-variant uppercase">Passenger</p>
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-outline">person</span>
                          <p className="text-label-md text-on-surface">
                            {booking.passenger.firstName} {booking.passenger.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-sm">
                        <p className="text-label-sm text-on-surface-variant uppercase">Seat</p>
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-outline">event_seat</span>
                          <p className="text-label-md text-on-surface">—</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boarding pass strip */}
                  <div className="relative h-4 flex items-center justify-between overflow-hidden">
                    <div className="h-8 w-8 bg-background rounded-full -ml-4 border border-outline-variant" />
                    <div className="flex-1 border-t-2 border-dashed border-outline-variant mx-2" />
                    <div className="h-8 w-8 bg-background rounded-full -mr-4 border border-outline-variant" />
                  </div>
                  <div className="px-md py-sm bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-on-surface-variant">
                        qr_code_2
                      </span>
                      <span className="text-label-sm text-on-surface-variant">
                        Gate opens at 08:15
                      </span>
                    </div>
                    <Link
                      href={`/passes/detail?ref=${ref}`}
                      className="text-primary text-label-md underline underline-offset-4 hover:opacity-80"
                    >
                      View Boarding Pass
                    </Link>
                  </div>
                </div>
              </div>

              {/* Management options */}
              <div className="space-y-md">
                <h3 className="text-label-md text-on-surface-variant uppercase ml-xs">
                  Trip Management
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-sm">
                  {[
                    { icon: "sync_alt", label: "Change Flight", desc: "Modify your flight" },
                    { icon: "event_seat", label: "Select Seat", desc: "Choose your seat" },
                    { icon: "luggage", label: "Add Baggage", desc: "Extra luggage" },
                    { icon: "restaurant", label: "Select Meals", desc: "Meal preferences" },
                    {
                      icon: "how_to_reg",
                      label: "Check-in",
                      desc: "Online check-in",
                      href: `/checkin/detail/passengers?ref=${ref}`,
                    },
                    { icon: "cancel", label: "Cancel Booking", desc: "Refund policy applies" },
                  ].map(({ icon, label, desc, href }) =>
                    href ? (
                      <Link
                        key={label}
                        href={href}
                        className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl flex flex-col items-start gap-md hover:bg-surface-container-high transition-colors text-left active:scale-95 duration-150"
                      >
                        <span className="material-symbols-outlined text-primary">{icon}</span>
                        <div>
                          <span className="text-label-md text-on-surface block">{label}</span>
                          <span className="text-label-sm text-on-surface-variant">{desc}</span>
                        </div>
                      </Link>
                    ) : (
                      <button
                        key={label}
                        className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl flex flex-col items-start gap-md hover:bg-surface-container-high transition-colors text-left active:scale-95 duration-150"
                      >
                        <span
                          className={`material-symbols-outlined ${label === "Cancel Booking" ? "text-error" : "text-primary"}`}
                        >
                          {icon}
                        </span>
                        <div>
                          <span
                            className={`text-label-md block ${label === "Cancel Booking" ? "text-error" : "text-on-surface"}`}
                          >
                            {label}
                          </span>
                          <span className="text-label-sm text-on-surface-variant">{desc}</span>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}
