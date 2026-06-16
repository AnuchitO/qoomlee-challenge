import Link from "next/link";
import { Skeleton } from "../components/skeletons/Skeleton";
import { formatTHB } from "@/lib/currency/format";
import { FEATURE_ALT_PAYMENT_METHODS } from "@/lib/features";
import {
  formatCountdown,
  formatDeparture,
  PAYMENT_METHODS,
  PROMO_DISCOUNT_MINOR,
  INSURANCE_MINOR,
  VALID_PROMO,
  type BookingState,
  type CardErrors,
  type PaymentMethod,
} from "./usePaymentClient";

interface PaymentClientViewProps {
  bookingState: BookingState;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  passengers: number;
  secondsLeft: number;
  promoInput: string;
  promoApplied: boolean;
  promoError: string;
  handlePromoInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleApplyPromo: () => void;
  activeMethod: PaymentMethod;
  setActiveMethod: (method: PaymentMethod) => void;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  saveCard: boolean;
  sameAddress: boolean;
  agreed: boolean;
  errors: CardErrors;
  handleCardNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExpiryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCvvChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveCardChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSameAddressToggle: () => void;
  handleAgreedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  baseFareMinor: number;
  taxMinor: number;
  discountMinor: number;
  totalMinor: number;
  submitError: string;
  submitting: boolean;
  handlePay: () => void;
  goBack: () => void;
}

const inputClass = (hasError?: boolean) =>
  `w-full border rounded-xl px-md py-3 bg-surface-bright text-body-md placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${
    hasError ? "border-error" : "border-outline-variant"
  }`;

export function PaymentClientView({
  bookingState,
  flightNumber,
  origin,
  destination,
  departureTime,
  passengers,
  secondsLeft,
  promoInput,
  promoApplied,
  promoError,
  handlePromoInputChange,
  handleApplyPromo,
  activeMethod,
  setActiveMethod,
  cardName,
  cardNumber,
  expiry,
  cvv,
  saveCard,
  sameAddress,
  agreed,
  errors,
  handleCardNameChange,
  handleCardNumberChange,
  handleExpiryChange,
  handleCvvChange,
  handleSaveCardChange,
  handleSameAddressToggle,
  handleAgreedChange,
  baseFareMinor,
  taxMinor,
  discountMinor,
  totalMinor,
  submitError,
  submitting,
  handlePay,
  goBack,
}: PaymentClientViewProps) {
  const visiblePaymentMethods = FEATURE_ALT_PAYMENT_METHODS
    ? PAYMENT_METHODS
    : PAYMENT_METHODS.filter((m) => m.id === "card");

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Full-page overlay — blocks all interaction while payment is processing */}
      {submitting && (
        <div
          data-testid="payment-loading-overlay"
          aria-busy="true"
          aria-label="Processing payment"
          className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-md pointer-events-auto"
        >
          <span className="material-symbols-outlined text-primary text-[56px] animate-spin">
            progress_activity
          </span>
          <p className="text-body-md text-on-surface font-semibold">Processing your payment…</p>
          <p className="text-label-sm text-on-surface-variant">Please don&apos;t close this page</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-bright border-b border-outline-variant shadow-sm">
        <div className="max-w-screen-sm mx-auto px-container-margin-mobile flex items-center justify-between h-16">
          <button
            onClick={goBack}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="text-headline-md text-primary">Secure Payment</h1>
          <span className="material-symbols-outlined text-on-surface-variant">lock</span>
        </div>
      </header>

      {/* Progress stepper */}
      <div className="max-w-screen-sm mx-auto px-container-margin-mobile pt-sm pb-xs">
        <ol className="flex items-center text-label-sm">
          {(["Flights", "Seats", "Extras", "Payment"] as const).map((step, i, arr) => (
            <li
              key={step}
              className={`flex-1 text-center font-medium ${step === "Payment" ? "text-primary" : "text-on-surface-variant"}`}
            >
              {step}
              {i < arr.length - 1 && <span className="mx-1 text-outline-variant">›</span>}
            </li>
          ))}
        </ol>
      </div>

      {bookingState === "loading" && (
        <div className="max-w-screen-sm mx-auto px-container-margin-mobile py-md space-y-md">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {bookingState === "expired" && (
        <div className="max-w-screen-sm mx-auto px-container-margin-mobile py-md">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-xl flex flex-col items-center text-center gap-md">
            <span className="material-symbols-outlined text-error text-[48px]">schedule</span>
            <h2 className="text-headline-md text-on-surface">Your booking hold has expired</h2>
            <p className="text-body-md text-on-surface-variant">
              We couldn&apos;t hold your seats any longer. Please search again to start a new
              booking.
            </p>
            <Link
              href="/flights"
              className="bg-primary text-on-primary px-lg py-3 rounded-xl text-label-md font-semibold"
            >
              Back to Flight Search
            </Link>
          </div>
        </div>
      )}

      {bookingState === "ready" && (
        <div className="max-w-screen-sm mx-auto px-container-margin-mobile py-md space-y-md">
          {/* Booking summary */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-md">
            <div className="flex justify-between items-center mb-sm">
              <span className="text-label-sm text-on-surface-variant font-medium">
                Booking Summary
              </span>
              <div className="flex items-center gap-xs bg-primary-container/30 text-primary rounded-full px-sm py-0.5">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span className="text-label-md font-semibold tabular-nums" data-testid="countdown">
                  {formatCountdown(secondsLeft)}
                </span>
              </div>
            </div>

            <p className="text-label-md font-semibold text-on-surface">
              {flightNumber} · {origin} → {destination}
            </p>
            <p className="text-label-sm text-on-surface-variant mb-md">
              {formatDeparture(departureTime)} · {passengers} Adult{passengers > 1 ? "s" : ""}
            </p>

            <div className="space-y-sm border-t border-dashed border-outline-variant pt-md">
              <div className="flex justify-between">
                <span className="text-body-md text-on-surface">Base fare</span>
                <span className="text-body-md text-on-surface">
                  {formatTHB(baseFareMinor / 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-md text-on-surface">Taxes &amp; Fees</span>
                <span className="text-body-md text-on-surface">{formatTHB(taxMinor / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-md text-on-surface">Economy Seat</span>
                <span className="text-body-md text-[#008544] font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-md text-on-surface">Travel Insurance</span>
                <span className="text-body-md text-on-surface">
                  {formatTHB(INSURANCE_MINOR / 100)}
                </span>
              </div>
              {promoApplied && (
                <div className="flex justify-between">
                  <span className="text-body-md font-semibold text-on-surface">Promo Discount</span>
                  <span className="text-body-md font-semibold text-primary">
                    -{formatTHB(discountMinor / 100)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-md mt-sm border-t border-outline-variant">
              <span className="text-body-md font-semibold text-on-surface">Total Amount</span>
              <span className="text-headline-md text-primary">{formatTHB(totalMinor / 100)}</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="space-y-sm">
            <div className="flex gap-sm">
              <input
                type="text"
                placeholder="Promo code"
                value={promoInput}
                onChange={handlePromoInputChange}
                className="flex-1 border border-outline-variant rounded-xl px-md py-3 bg-surface-bright text-body-md placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              <button
                onClick={handleApplyPromo}
                className="bg-primary text-on-primary px-lg rounded-xl text-label-md active:scale-95 transition-transform shrink-0"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-label-sm text-error px-1">{promoError}</p>}
            {promoApplied && (
              <div className="bg-primary-container/30 rounded-xl px-md py-sm flex items-center gap-sm">
                <span
                  className="material-symbols-outlined text-primary text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <span className="text-label-md text-primary font-semibold">
                  {VALID_PROMO} applied — {formatTHB(PROMO_DISCOUNT_MINOR / 100)} off!
                </span>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="space-y-md">
            <p className="text-label-sm text-on-surface-variant font-semibold tracking-widest uppercase">
              Payment Method
            </p>

            {visiblePaymentMethods.length > 1 && (
              <div className="flex border border-outline-variant rounded-xl overflow-hidden">
                {visiblePaymentMethods.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveMethod(id)}
                    className={`flex-1 py-2 text-label-md transition-colors ${
                      activeMethod === id
                        ? "bg-primary text-on-primary"
                        : "bg-surface-bright text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {activeMethod === "card" && (
              <div className="space-y-md">
                <div className="space-y-xs">
                  <label className="block text-label-sm text-on-surface-variant px-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Johnathan Doe"
                    value={cardName}
                    onChange={handleCardNameChange}
                    className={inputClass(!!errors.cardName)}
                  />
                  {errors.cardName && (
                    <p className="text-label-sm text-error px-1">{errors.cardName}</p>
                  )}
                </div>

                <div className="space-y-xs">
                  <label className="block text-label-sm text-on-surface-variant px-1">
                    Card Number
                  </label>
                  <div
                    className={`flex items-center gap-sm border rounded-xl px-md bg-surface-bright ${
                      errors.cardNumber ? "border-error" : "border-outline-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
                      credit_card
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-body-md text-on-surface placeholder:text-outline outline-none"
                    />
                  </div>
                  {errors.cardNumber && (
                    <p className="text-label-sm text-error px-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-label-sm text-on-surface-variant px-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className={inputClass(!!errors.expiry)}
                    />
                    {errors.expiry && (
                      <p className="text-label-sm text-error px-1">{errors.expiry}</p>
                    )}
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-label-sm text-on-surface-variant px-1">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cvv}
                      onChange={handleCvvChange}
                      className={inputClass(!!errors.cvv)}
                    />
                    {errors.cvv && <p className="text-label-sm text-error px-1">{errors.cvv}</p>}
                  </div>
                </div>

                <label className="flex items-center gap-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={handleSaveCardChange}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-body-md text-on-surface">
                    Save card for future bookings
                  </span>
                </label>

                <div className="bg-surface-container rounded-xl px-md py-sm flex items-center justify-between">
                  <div>
                    <p className="text-label-md font-semibold text-on-surface">Billing Address</p>
                    <p className="text-label-sm text-on-surface-variant">Same as account profile</p>
                  </div>
                  <button
                    onClick={handleSameAddressToggle}
                    role="switch"
                    aria-checked={sameAddress}
                    aria-label="Toggle billing address"
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      sameAddress ? "bg-primary" : "bg-outline-variant"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        sameAddress ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeMethod !== "card" && (
              <div className="rounded-xl border border-dashed border-outline-variant p-xl flex flex-col items-center gap-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[40px]">
                  {activeMethod === "promptpay"
                    ? "qr_code_2"
                    : activeMethod === "bank"
                      ? "account_balance"
                      : "payments"}
                </span>
                <p className="text-body-md">
                  {activeMethod === "promptpay"
                    ? "PromptPay"
                    : activeMethod === "bank"
                      ? "Bank Transfer"
                      : "Other methods"}{" "}
                  coming soon
                </p>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-sm">
            <label className="flex items-start gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={handleAgreedChange}
                className={`mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary ${
                  errors.terms ? "border-error" : "border-outline-variant"
                }`}
              />
              <span className="text-label-sm text-on-surface">
                I agree to the{" "}
                <span className="text-primary underline">Terms &amp; Conditions</span>, privacy
                policy, and booking rules of Qoomlee Airline.
              </span>
            </label>
            {errors.terms && <p className="text-label-sm text-error px-1">{errors.terms}</p>}

            <div className="flex items-start gap-sm bg-surface-container rounded-xl px-md py-sm">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-label-sm text-on-surface-variant">
                Cancellation policy: Full refund if cancelled within 24 hours of booking. Standard
                fees apply thereafter.
              </p>
            </div>

            <p className="text-center text-label-sm text-on-surface-variant flex items-center justify-center gap-md">
              <span className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                256-bit SSL
              </span>
              <span className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                PCI DSS compliant
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Sticky pay button */}
      {bookingState === "ready" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-container-margin-mobile md:px-container-margin-desktop pb-6 pt-3 bg-background/90 backdrop-blur-sm">
          <div className="max-w-screen-sm mx-auto space-y-sm">
            {submitError && (
              <p className="text-label-sm text-error text-center" role="alert">
                {submitError}
              </p>
            )}
            <button
              onClick={handlePay}
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-4 rounded-xl text-headline-md shadow-md active:scale-95 transition-transform flex items-center justify-center gap-sm disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Pay {formatTHB(totalMinor / 100)} Securely
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
