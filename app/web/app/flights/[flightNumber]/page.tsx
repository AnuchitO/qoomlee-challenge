import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Flight Details · Qoomlee",
};

const AMENITIES = [
  { icon: "wifi", label: "Wi-Fi", available: true },
  { icon: "power", label: "USB Power", available: true },
  { icon: "tv_with_camera", label: "In-flight Entertainment", available: true },
  { icon: "restaurant", label: "Meal Service", available: true },
  { icon: "local_bar", label: "Bar Service", available: false },
  { icon: "airline_seat_flat", label: "Lie-flat Seats", available: false },
];

export default async function FlightDetailsPage({
  params,
}: {
  params: Promise<{ flightNumber: string }>;
}) {
  const { flightNumber } = await params;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface-bright border-b border-outline-variant sticky top-0 z-50 flex items-center px-container-margin-mobile h-16">
        <Link
          href="/flights/results"
          className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </Link>
        <h1 className="text-headline-md text-on-surface ml-md">Flight Details</h1>
      </header>

      <main className="max-w-[500px] mx-auto pt-md px-container-margin-mobile pb-24 space-y-lg">
        {/* Airline header */}
        <div className="bg-secondary rounded-xl overflow-hidden flex items-center justify-between px-md py-sm">
          <div className="flex items-center gap-sm">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <span
                className="material-symbols-outlined text-secondary text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                flight_takeoff
              </span>
            </div>
            <span className="text-white text-label-md">Qoomlee</span>
          </div>
          <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-sm py-xs rounded">
            <span className="text-mono-data text-label-sm">{flightNumber || "QQ101"}</span>
          </div>
        </div>

        {/* Route timeline */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm">
          <div className="flex gap-md">
            {/* Timeline line */}
            <div className="flex flex-col items-center py-xs">
              <div className="w-3 h-3 rounded-full border-2 border-primary bg-white" />
              <div className="flex-1 w-px border-l-2 border-dashed border-outline-variant my-1" />
              <span
                className="material-symbols-outlined text-primary rotate-90"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                flight
              </span>
              <div className="flex-1 w-px border-l-2 border-dashed border-outline-variant my-1" />
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-lg">
              {/* Departure */}
              <div className="space-y-xs">
                <p className="text-headline-lg-mobile text-primary-container font-bold">09:15</p>
                <p className="text-label-md text-on-surface">Bangkok Suvarnabhumi (BKK)</p>
                <p className="text-label-sm text-on-surface-variant">Terminal 1, Gate F12</p>
                <p className="text-label-sm text-on-surface-variant">Mon, 20 May 2024</p>
              </div>

              {/* Flight info */}
              <div className="flex gap-md flex-wrap py-sm">
                <span className="px-sm py-xs bg-surface-container rounded-lg text-label-sm text-on-surface-variant">
                  8h 30m
                </span>
                <span className="px-sm py-xs bg-green-100 text-green-700 rounded-lg text-label-sm">
                  Non-stop
                </span>
                <span className="px-sm py-xs bg-surface-container rounded-lg text-label-sm text-on-surface-variant">
                  Boeing 787-9
                </span>
              </div>

              {/* Arrival */}
              <div className="space-y-xs">
                <p className="text-headline-lg-mobile text-primary font-bold">20:45</p>
                <p className="text-label-md text-on-surface">Sydney Kingsford Smith (SYD)</p>
                <p className="text-label-sm text-on-surface-variant">Terminal 1, Gate TBC</p>
                <p className="text-label-sm text-on-surface-variant">Mon, 20 May 2024</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cabin classes */}
        <section className="space-y-sm">
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider">
            Cabin Classes
          </h3>
          {[
            {
              label: "Economy",
              price: "฿8,450",
              seats: "180 seats",
              features: "30-in pitch, 17-in width",
            },
            {
              label: "Business",
              price: "฿28,900",
              seats: "24 seats",
              features: "Lie-flat, 60-in pitch",
            },
          ].map(({ label, price, seats, features }) => (
            <div
              key={label}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md flex items-center justify-between"
            >
              <div>
                <p className="text-label-md text-on-surface">{label}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {seats} · {features}
                </p>
              </div>
              <div className="text-right">
                <p className="text-headline-md text-primary">{price}</p>
                <p className="text-label-sm text-on-surface-variant">per person</p>
              </div>
            </div>
          ))}
        </section>

        {/* Amenities */}
        <section className="space-y-sm">
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider">
            Amenities
          </h3>
          <div className="grid grid-cols-2 gap-sm">
            {AMENITIES.map(({ icon, label, available }) => (
              <div
                key={label}
                className={`flex items-center gap-sm p-sm rounded-xl border ${
                  available
                    ? "border-outline-variant bg-surface-container-lowest"
                    : "border-outline-variant/30 bg-surface-container-lowest opacity-50"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    available ? "text-primary" : "text-outline"
                  }`}
                >
                  {icon}
                </span>
                <span className="text-label-sm text-on-surface">{label}</span>
                {!available && (
                  <span className="material-symbols-outlined text-outline text-[14px] ml-auto">
                    close
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Baggage policy */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm space-y-sm">
          <h3 className="text-label-md text-on-surface">Baggage Policy</h3>
          {[
            { icon: "backpack", label: "Carry-on", value: "1 × 7kg" },
            { icon: "luggage", label: "Economy checked", value: "1 × 23kg" },
            { icon: "luggage", label: "Business checked", value: "2 × 32kg" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-outline text-[20px]">{icon}</span>
                <span className="text-label-md text-on-surface">{label}</span>
              </div>
              <span className="text-label-md text-on-surface">{value}</span>
            </div>
          ))}
        </section>

        {/* CTA */}
        <Link
          href={`/bookings/new?flight=${flightNumber}`}
          className="block w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm"
        >
          Select this Flight
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      </main>
    </div>
  );
}
