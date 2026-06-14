import type { Metadata } from "next";
import Link from "next/link";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import { mockBookings as BOOKINGS } from "@/lib/booking/mock";

export const metadata: Metadata = {
  title: "My Bookings · Qoomlee",
};

const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700" },
  pending: { label: "Pending", color: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  cancelled: { label: "Cancelled", color: "bg-error-container text-error" },
};

export default function BookingsPage() {
  return (
    <>
      <TopAppBar />
      <main className="pb-28 md:pb-8 max-w-2xl mx-auto px-container-margin-mobile md:px-container-margin-desktop py-lg space-y-lg">
        <h1 className="text-headline-lg-mobile text-on-surface">My Bookings</h1>

        {BOOKINGS.map((booking) => (
          <Link
            key={booking.ref}
            href={`/bookings/detail?ref=${booking.ref}`}
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
                  {booking.ref}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-label-sm font-bold ${statusConfig[booking.status].color}`}
              >
                {statusConfig[booking.status].label}
              </span>
            </div>

            {/* Route info */}
            <div className="p-md flex items-center justify-between">
              <div>
                <h2 className="text-headline-md text-on-surface">{booking.route}</h2>
                <p className="text-body-md text-on-surface-variant mt-xs">{booking.date}</p>
                <p className="text-label-sm text-on-surface-variant mt-xs">
                  {booking.flightNumber} · {booking.passengers} passengers
                </p>
              </div>
              <div className="text-right">
                <p className="text-label-sm text-on-surface-variant">Total paid</p>
                <p className="text-headline-md text-primary font-bold">{booking.totalPaid}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-outline-variant px-md py-sm flex items-center justify-between">
              <div className="flex items-center gap-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                <span className="text-label-sm">Check-in available</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                chevron_right
              </span>
            </div>
          </Link>
        ))}

        {BOOKINGS.length === 0 && (
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
