import Link from "next/link";
import BottomNav from "../../components/BottomNav";

export default function BookingNotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant sticky top-0 z-50 flex items-center px-container-margin-mobile h-16">
        <Link
          href="/checkin"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </Link>
        <h1 className="text-headline-md text-on-surface ml-md">Check-in</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-container-margin-mobile text-center pb-24 space-y-lg max-w-[380px] mx-auto">
        {/* Illustration */}
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 hero-gradient rounded-full opacity-10" />
          <div className="absolute inset-2 bg-surface-container-lowest rounded-full flex items-center justify-center relative z-10 border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[48px]">search_off</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-md">
          <h1 className="text-headline-lg-mobile text-on-surface">Booking Not Found</h1>
          <p className="text-body-md text-on-surface-variant px-md">
            We couldn&apos;t find a booking with the details provided. Please check your reference
            number and try again.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full space-y-md">
          <Link
            href="/checkin"
            className="block w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
            Try Again
          </Link>
          <Link
            href="/support"
            className="block w-full h-14 border border-outline-variant bg-surface-container-lowest text-on-surface text-label-md rounded-xl active:scale-95 transition-all hover:bg-surface-container-low flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            Contact Support
          </Link>
        </div>

        {/* Help hint */}
        <div className="w-full flex items-start gap-md p-md bg-surface-container-low rounded-xl text-left border border-outline-variant">
          <div className="bg-primary-fixed p-sm rounded-lg">
            <span className="material-symbols-outlined text-on-primary-fixed-variant">info</span>
          </div>
          <div>
            <h4 className="text-label-md text-on-surface">Need help?</h4>
            <p className="text-label-sm text-on-surface-variant mt-xs">
              Check your confirmation email for the 6-digit booking reference (e.g. QM92Z4).
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
