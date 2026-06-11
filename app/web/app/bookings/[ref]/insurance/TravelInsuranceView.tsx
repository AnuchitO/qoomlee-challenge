import Link from "next/link";
import type { InsurancePlan } from "./useTravelInsurance";
import { formatTHB } from "@/lib/utils/currency";

interface TravelInsuranceViewProps {
  ref: string;
  plans: InsurancePlan[];
  selected: string;
  selectPlan: (planId: string) => void;
  selectedPrice: number;
  handleAddInsurance: () => void;
}

export function TravelInsuranceView({
  ref,
  plans,
  selected,
  selectPlan,
  selectedPrice,
  handleAddInsurance,
}: TravelInsuranceViewProps) {
  return (
    <div className="min-h-screen bg-background pb-xxl">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-container-margin-mobile h-16 bg-surface-bright border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-md">
          <Link
            href={`/bookings/${ref}`}
            className="active:scale-95 duration-150 hover:bg-surface-container-low transition-colors p-2 rounded-full"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-headline-md text-primary font-bold">Travel Insurance</h1>
        </div>
      </header>

      <main className="pt-20 max-w-[480px] mx-auto px-container-margin-mobile space-y-lg pb-24">
        {/* Hero banner */}
        <section className="bg-secondary rounded-xl p-lg shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl" />
          <div className="relative z-10">
            <h2 className="text-headline-md text-on-secondary font-bold">Protect your trip</h2>
            <p className="text-body-md text-on-secondary/80 mt-xs">From ฿290 per person</p>
          </div>
          <span
            className="material-symbols-outlined text-on-secondary/20 absolute right-8 top-1/2 -translate-y-1/2 select-none"
            style={{ fontSize: "96px" }}
          >
            shield
          </span>
        </section>

        {/* Plan cards */}
        {plans.map((plan) => (
          <article
            key={plan.id}
            onClick={() => selectPlan(plan.id)}
            className={`rounded-xl border p-md shadow-sm cursor-pointer transition-all hover:shadow-md relative ${
              plan.featured
                ? "bg-surface-container-lowest border-2 border-primary shadow-lg"
                : "bg-surface-container-lowest border-outline-variant"
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 -right-2 bg-primary-container text-on-primary-container text-label-sm px-3 py-1 rounded-full font-bold shadow-sm">
                Most Popular
              </div>
            )}
            <div className="flex justify-between items-center mb-md">
              <span
                className={`px-3 py-1 rounded-full text-label-sm font-bold ${
                  plan.featured
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-secondary-container text-on-secondary-container"
                }`}
              >
                {plan.name}
              </span>
              <div className="flex items-center gap-sm">
                <p className="text-headline-md text-primary">
                  {formatTHB(plan.price)}
                  <span className="text-label-sm text-on-surface-variant">/person</span>
                </p>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selected === plan.id ? "border-primary bg-primary" : "border-outline-variant"
                  }`}
                >
                  {selected === plan.id && (
                    <span
                      className="material-symbols-outlined text-on-primary text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  )}
                </div>
              </div>
            </div>

            <ul className="space-y-sm mb-lg">
              {plan.benefits.map((b) => (
                <li key={b} className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                    check
                  </span>
                  <span className="text-body-md text-on-surface-variant">{b}</span>
                </li>
              ))}
              {plan.exclusions.map((e) => (
                <li key={e} className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
                    close
                  </span>
                  <span className="text-body-md text-outline">{e}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={(ev) => {
                ev.stopPropagation();
                selectPlan(plan.id);
              }}
              className={`w-full h-10 rounded-xl text-label-md font-bold active:scale-95 transition-all ${
                selected === plan.id
                  ? "bg-primary text-on-primary"
                  : "border border-primary text-primary hover:bg-primary-container/10"
              }`}
            >
              {selected === plan.id ? "Selected" : `Add ${plan.name} Plan`}
            </button>
          </article>
        ))}

        {/* No thanks */}
        <button className="w-full text-label-md text-on-surface-variant hover:underline py-sm">
          No thanks, I&apos;ll travel without insurance
        </button>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50">
        <button
          onClick={handleAddInsurance}
          className="w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm"
        >
          Add Insurance · {formatTHB(selectedPrice)}
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
