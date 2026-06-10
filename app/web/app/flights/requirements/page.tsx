import type { Metadata } from "next";
import Link from "next/link";
import TopAppBar from "../../components/TopAppBar";

export const metadata: Metadata = {
  title: "Travel Requirements · Qoomlee",
};

interface Requirement {
  id: string;
  title: string;
  status: "required" | "not-required" | "check";
  details: string;
  link?: string;
}

const REQUIREMENTS: Requirement[] = [
  {
    id: "passport",
    title: "Valid Passport",
    status: "required",
    details:
      "Must be valid for at least 6 months beyond intended stay. Australian entry requires a machine-readable passport.",
  },
  {
    id: "visa",
    title: "Australian ETA",
    status: "required",
    details:
      "Thai passport holders require an Electronic Travel Authority (ETA). Apply online at least 72 hours before travel.",
    link: "https://immi.homeaffairs.gov.au",
  },
  {
    id: "vaccination",
    title: "COVID-19 Vaccination",
    status: "not-required",
    details: "No vaccination certificate required as of current date. Requirements may change.",
  },
  {
    id: "currency",
    title: "Currency Restrictions",
    status: "check",
    details: "Must declare amounts over AUD 10,000 on arrival.",
  },
  {
    id: "customs",
    title: "Customs Declaration",
    status: "required",
    details:
      "All passengers must complete an Incoming Passenger Card. Food, plant material, and animal products must be declared.",
  },
];

const statusConfig = {
  required: {
    label: "Required",
    bg: "bg-error-container/20",
    text: "text-error",
    icon: "priority_high",
  },
  "not-required": {
    label: "Not Required",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "check",
  },
  check: {
    label: "Check",
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed-variant",
    icon: "info",
  },
};

export default function TravelRequirementsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <main className="pb-24 max-w-[500px] mx-auto px-container-margin-mobile py-lg space-y-lg">
        {/* Route header */}
        <header className="bg-secondary rounded-xl p-md text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined">flight</span>
              <h2 className="text-headline-md">Bangkok → Sydney</h2>
            </div>
            <span className="material-symbols-outlined opacity-80">public</span>
          </div>
          <p className="mt-xs text-label-sm text-white/80">Verify all requirements before travel</p>
        </header>

        {/* Progress stepper */}
        <div className="flex items-center justify-between px-md py-sm">
          {["Flight", "Details", "Requirements", "Payment"].map((step, i) => (
            <div key={step} className="flex items-center gap-xs flex-1">
              <div className="flex flex-col items-center gap-xs">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    i <= 2
                      ? "bg-primary text-on-primary"
                      : "border-2 border-outline-variant text-on-surface-variant"
                  }`}
                >
                  {i < 2 ? (
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-label-sm ${i <= 2 ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {step}
                </span>
              </div>
              {i < 3 && (
                <div
                  className={`flex-1 h-0.5 mb-4 mx-xs ${i < 2 ? "bg-primary" : "bg-outline-variant"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Requirements list */}
        <div className="space-y-sm">
          {REQUIREMENTS.map((req) => {
            const cfg = statusConfig[req.status];
            return (
              <div
                key={req.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm"
              >
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-xs">
                      <h3 className="text-label-md text-on-surface">{req.title}</h3>
                      <span
                        className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full text-label-sm font-bold ${cfg.bg} ${cfg.text}`}
                      >
                        <span
                          className="material-symbols-outlined text-[12px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {cfg.icon}
                        </span>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">{req.details}</p>
                    {req.link && (
                      <p className="text-label-sm text-primary mt-xs hover:underline cursor-pointer">
                        Apply online →
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant">
          <span className="material-symbols-outlined text-outline text-[20px] shrink-0">info</span>
          <p className="text-label-sm text-on-surface-variant">
            Entry requirements can change at short notice. Always verify with official embassy and
            government websites before travel.
          </p>
        </div>

        <Link
          href="/payment"
          className="block w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm"
        >
          Continue to Payment
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      </main>
    </div>
  );
}
