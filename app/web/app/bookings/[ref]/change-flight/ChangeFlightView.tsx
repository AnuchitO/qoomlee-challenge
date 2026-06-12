import Link from "next/link";
import FlightRoute from "../../../components/FlightRoute";
import type { mockFlightAlternatives } from "@/lib/flight/mock";

interface ChangeFlightViewProps {
  ref: string;
  alternatives: typeof mockFlightAlternatives;
  selectedDate: string;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  confirming: string | null;
  handleSelect: (flightId: string) => void;
}

export function ChangeFlightView({
  ref,
  alternatives,
  selectedDate,
  handleDateChange,
  confirming,
  handleSelect,
}: ChangeFlightViewProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant sticky top-0 z-50 flex items-center px-container-margin-mobile h-16">
        <Link
          href={`/bookings/${ref}`}
          className="p-2 -ml-sm rounded-full active:scale-95 transition-transform duration-150 hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </Link>
        <h1 className="ml-md text-headline-md text-on-surface">Change Flight</h1>
      </header>

      <main className="pb-24 max-w-[500px] mx-auto w-full px-container-margin-mobile py-md space-y-md">
        {/* Current flight */}
        <section className="bg-surface-container rounded-xl border border-outline-variant p-md">
          <p className="text-label-sm text-on-surface-variant mb-sm">Current flight</p>
          <h2 className="text-label-md text-on-surface">
            QQ101 · BKK → SYD · Thu, 24 Oct · 08:00–16:30
          </h2>
          <p className="text-label-sm text-on-surface-variant mt-xs">
            1 Adult · Economy · Seat 14A
          </p>
          <div className="bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/20 rounded-xl p-sm mt-sm flex gap-sm items-center">
            <span className="material-symbols-outlined text-[16px] text-tertiary">warning</span>
            <p className="text-label-sm text-on-surface">
              Change fee: ฿850 per passenger applies to all alternatives
            </p>
          </div>
        </section>

        {/* Date picker */}
        <div className="space-y-xs">
          <label className="text-label-sm text-on-surface-variant">New travel date</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full h-12 px-md rounded-xl border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none bg-surface-bright transition-all text-body-md"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
              calendar_today
            </span>
          </div>
        </div>

        {/* Alternative flights */}
        <div>
          <h3 className="text-label-md text-on-surface-variant mb-sm">Select a new flight</h3>
          <div className="space-y-sm">
            {alternatives.map((flight) => (
              <div
                key={flight.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md active:scale-[0.98] transition-transform duration-200"
              >
                <div className="flex justify-between items-start mb-sm">
                  <div>
                    <span className="text-label-md text-on-surface">{flight.flightNumber}</span>
                    <span className="text-label-sm text-on-surface-variant ml-sm">
                      {flight.stops}
                    </span>
                  </div>
                  <span
                    className={`text-label-sm font-bold px-2 py-0.5 rounded-full ${
                      flight.price < 0
                        ? "bg-green-100 text-green-700"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {flight.diff}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <FlightRoute
                    size="sm"
                    className="gap-md"
                    origin="BKK"
                    destination="SYD"
                    departureTime={flight.departure}
                    arrivalTime={flight.arrival}
                    duration={flight.duration}
                  />
                  <button
                    onClick={() => handleSelect(flight.id)}
                    disabled={!!confirming}
                    className="bg-primary-container text-on-primary-container px-lg py-sm rounded-xl text-label-md active:scale-95 transition-transform disabled:opacity-50 ml-md"
                  >
                    {confirming === flight.id ? "Confirming..." : "Select"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
