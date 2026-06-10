import Link from "next/link";
import type { PaymentMethodForm } from "./useAddPaymentMethod";

interface AddPaymentMethodViewProps {
  form: PaymentMethodForm;
  displayNumber: string;
  setCardName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCardNumber: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setExpiry: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCvv: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDefault: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function AddPaymentMethodView({
  form,
  displayNumber,
  setCardName,
  setCardNumber,
  setExpiry,
  setCvv,
  setDefault,
  handleSubmit,
}: AddPaymentMethodViewProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant sticky top-0 z-50 flex items-center px-container-margin-mobile h-16">
        <Link
          href="/profile/settings"
          className="active:scale-95 transition-transform p-2 hover:bg-primary-container/10 rounded-full"
        >
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </Link>
        <h1 className="text-headline-md text-primary ml-md">Payment Method</h1>
      </header>

      <main className="pt-md pb-32 max-w-[500px] mx-auto w-full px-container-margin-mobile space-y-lg">
        {/* Card preview */}
        <section className="bg-primary-container text-on-primary-container rounded-xl p-lg aspect-[1.58/1] relative overflow-hidden shadow-lg">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-center">
              <span className="text-headline-md font-bold tracking-tight">Qoomlee</span>
              <span className="material-symbols-outlined text-[32px] opacity-90">contactless</span>
            </div>
            <p className="text-mono-data text-xl tracking-[0.2em]">{displayNumber}</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-label-sm uppercase opacity-70">Card Holder</p>
                <p className="text-label-md">{form.cardName || "Jonathan Doe"}</p>
              </div>
              <div className="text-right">
                <p className="text-label-sm uppercase opacity-70">Expires</p>
                <p className="text-label-md">{form.expiry || "MM/YY"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-md">
          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant">Cardholder Name</label>
            <input
              type="text"
              value={form.cardName}
              onChange={setCardName}
              placeholder="As printed on card"
              className="w-full h-14 px-md rounded-xl bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-md transition-all"
            />
          </div>

          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={form.cardNumber}
                onChange={setCardNumber}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full h-14 px-md rounded-xl bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-mono-data tracking-wider transition-all"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                credit_card
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant">Expiry Date</label>
              <input
                type="text"
                value={form.expiry}
                onChange={setExpiry}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full h-14 px-md rounded-xl bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-mono-data tracking-wider transition-all"
              />
            </div>
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant">CVV</label>
              <input
                type="password"
                value={form.cvv}
                onChange={setCvv}
                placeholder="•••"
                maxLength={4}
                className="w-full h-14 px-md rounded-xl bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-mono-data tracking-wider transition-all"
              />
            </div>
          </div>

          <label className="flex items-center gap-md cursor-pointer">
            <input
              type="checkbox"
              checked={form.setDefault}
              onChange={setDefault}
              className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
            />
            <span className="text-label-md text-on-surface">Set as default payment method</span>
          </label>

          <button
            type="submit"
            className="w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            Save Card
          </button>
        </form>

        {/* Security note */}
        <div className="flex items-center gap-sm text-center justify-center">
          <span
            className="material-symbols-outlined text-outline text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock
          </span>
          <p className="text-label-sm text-on-surface-variant">
            Your card details are encrypted and secure
          </p>
        </div>
      </main>
    </div>
  );
}
