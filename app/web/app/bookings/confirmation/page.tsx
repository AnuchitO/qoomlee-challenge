import type { Metadata } from "next";
import TopAppBar from "../../components/TopAppBar";
import { formatTHB } from "@/lib/currency/format";
import CopyPNR from "./CopyPNR";

export const metadata: Metadata = {
  title: "Booking Confirmed · Qoomlee",
};

interface SearchParams {
  ref?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  totalMinor?: string;
  currency?: string;
}

function str(v: string | undefined, fallback = ""): string {
  return v ?? fallback;
}

function formatDeparture(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const p = await searchParams;

  const bookingRef = str(p.ref, "—");
  const flightNumber = str(p.flightNumber, "—");
  const origin = str(p.origin, "—");
  const destination = str(p.destination, "—");
  const departureTime = str(p.departureTime, new Date().toISOString());
  const firstName = str(p.firstName);
  const lastName = str(p.lastName);
  const email = str(p.email);
  const totalMinor = Number(str(p.totalMinor, "0"));

  const passengerName = [firstName, lastName].filter(Boolean).join(" ") || "—";

  return (
    <>
      <TopAppBar />
      <main className="pb-24">
        {/* Success hero */}
        <section
          className="hero-gradient pt-xl pb-[72px] flex flex-col items-center text-center"
          data-testid="confirmation-hero"
        >
          <span
            className="material-symbols-outlined text-white text-[72px] mb-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-white mb-xs">
            Booking Confirmed!
          </h1>
          <p className="text-body-md text-white/80">Your adventure begins here ✈</p>
        </section>

        <div className="max-w-screen-sm mx-auto px-container-margin-mobile md:px-container-margin-desktop -mt-8 relative z-10 space-y-md pb-md">
          {/* PNR card */}
          <div
            className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg p-md"
            data-testid="pnr-card"
          >
            <div className="flex justify-between items-start mb-sm">
              <div>
                <span className="text-label-sm text-on-surface-variant block mb-xs uppercase tracking-wider">
                  Booking Reference
                </span>
                <div className="flex items-start gap-1">
                  <span
                    className="font-mono text-headline-lg text-primary tracking-[0.15em] font-bold"
                    data-testid="booking-ref"
                  >
                    {bookingRef}
                  </span>
                  <CopyPNR value={bookingRef} />
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[28px] mt-1">
                airplane_ticket
              </span>
            </div>
            <div className="border-t border-outline-variant pt-sm">
              <p
                className="text-label-md text-on-surface-variant"
                data-testid="flight-summary-line"
              >
                {flightNumber} · {origin} → {destination} · {formatDeparture(departureTime)}
              </p>
            </div>
          </div>

          {/* Passenger & payment details */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md space-y-sm">
            <h2 className="text-title-md text-on-surface font-semibold">Booking Details</h2>

            <div className="space-y-xs text-body-md">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Passenger</span>
                <span className="text-on-surface font-medium" data-testid="passenger-name">
                  {passengerName}
                </span>
              </div>
              {email && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Email</span>
                  <span className="text-on-surface" data-testid="passenger-email">
                    {email}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Route</span>
                <span className="text-on-surface" data-testid="route">
                  {origin} → {destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Flight</span>
                <span className="text-on-surface" data-testid="flight-number">
                  {flightNumber}
                </span>
              </div>
              <div className="border-t border-outline-variant pt-sm flex justify-between">
                <span className="text-on-surface-variant font-medium">Total Paid</span>
                <span className="text-primary font-bold text-title-md" data-testid="total-amount">
                  {formatTHB(totalMinor / 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-sm bg-primary-container rounded-xl px-md py-sm">
            <span
              className="material-symbols-outlined text-primary text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <p className="text-body-sm text-on-primary-container">
              A confirmation email has been sent to{" "}
              <span className="font-medium">{email || "your inbox"}</span>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
