"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressStepper from "./components/ProgressStepper";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatPrice(minor: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
}

function formatDeparture(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${weekday} ${day} ${month}`;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})(?=.)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function generateBookingRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return (
    "QM" + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
}

// ── constants ─────────────────────────────────────────────────────────────────

const VALID_PROMO = "QOOMFIRST";
const PROMO_DISCOUNT_MINOR = 50000; // ฿500
const INSURANCE_MINOR = 59000; // ฿590

type PaymentMethod = "card" | "promptpay" | "bank" | "other";

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "card", label: "Card" },
  { id: "promptpay", label: "PromptPay" },
  { id: "bank", label: "Bank" },
  { id: "other", label: "Other" },
];

// ── types ─────────────────────────────────────────────────────────────────────

export interface PaymentClientProps {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  basePriceMinor: number;
  currency: string;
  passengers: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CardErrors {
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  terms?: string;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function PaymentClient({
  flightNumber,
  origin,
  destination,
  departureTime,
  basePriceMinor,
  currency,
  passengers,
  firstName,
  lastName,
  email,
}: PaymentClientProps) {
  const router = useRouter();

  // countdown — 15 minutes
  const [secondsLeft, setSecondsLeft] = useState(900);
  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  // promo
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = () => {
    if (promoInput.trim().toUpperCase() === VALID_PROMO) {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoApplied(false);
      setPromoError("Invalid promo code");
    }
  };

  // payment method
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>("card");

  // card form
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [sameAddress, setSameAddress] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<CardErrors>({});

  // pricing
  const baseFareMinor = basePriceMinor * passengers;
  const taxMinor = Math.round(baseFareMinor * 0.15);
  const discountMinor = promoApplied ? PROMO_DISCOUNT_MINOR : 0;
  const totalMinor = baseFareMinor + taxMinor + INSURANCE_MINOR - discountMinor;

  // pay
  const handlePay = () => {
    if (activeMethod === "card") {
      const e: CardErrors = {};
      if (!cardName.trim()) e.cardName = "Required";
      if (cardNumber.replace(/\s/g, "").length !== 16)
        e.cardNumber = "Enter a valid 16-digit card number";
      if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = "Use MM/YY format";
      if (!/^\d{3,4}$/.test(cvv)) e.cvv = "3 or 4 digits required";
      if (!agreed) e.terms = "You must agree to the terms to proceed";
      setErrors(e);
      if (Object.keys(e).length > 0) return;
    }

    const ref = generateBookingRef();
    const params = new URLSearchParams({
      ref,
      flightNumber,
      origin,
      destination,
      departureTime,
      firstName,
      lastName,
      email,
      totalMinor: String(totalMinor),
      currency,
    });
    router.push(`/bookings/confirmation?${params.toString()}`);
  };

  const inputClass = (hasError?: boolean) =>
    `w-full border rounded-xl px-md py-3 bg-surface-bright text-body-md placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${
      hasError ? "border-error" : "border-outline-variant"
    }`;

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-bright border-b border-outline-variant shadow-sm">
        <div className="max-w-screen-sm mx-auto px-container-margin-mobile flex items-center justify-between h-16">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors active:scale-95"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="text-headline-md text-primary">Secure Payment</h1>
          <span className="material-symbols-outlined text-on-surface-variant">lock</span>
        </div>
      </header>

      <div className="max-w-screen-sm mx-auto px-container-margin-mobile py-md space-y-md">
        {/* Step progress */}
        <ProgressStepper />

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
                {formatPrice(baseFareMinor, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-md text-on-surface">Taxes &amp; Fees</span>
              <span className="text-body-md text-on-surface">
                {formatPrice(taxMinor, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-md text-on-surface">Economy Seat</span>
              <span className="text-body-md text-[#008544] font-medium">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-md text-on-surface">Travel Insurance</span>
              <span className="text-body-md text-on-surface">
                {formatPrice(INSURANCE_MINOR, currency)}
              </span>
            </div>
            {promoApplied && (
              <div className="flex justify-between">
                <span className="text-body-md font-semibold text-on-surface">Promo Discount</span>
                <span className="text-body-md font-semibold text-primary">
                  -{formatPrice(PROMO_DISCOUNT_MINOR, currency)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-md mt-sm border-t border-outline-variant">
            <span className="text-body-md font-semibold text-on-surface">Total Amount</span>
            <span className="text-headline-md text-primary">
              {formatPrice(totalMinor, currency)}
            </span>
          </div>
        </div>

        {/* Promo code */}
        <div className="space-y-sm">
          <div className="flex gap-sm">
            <input
              type="text"
              placeholder="Promo code"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value);
                setPromoError("");
              }}
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
                {VALID_PROMO} applied — {formatPrice(PROMO_DISCOUNT_MINOR, currency)} off!
              </span>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="space-y-md">
          <p className="text-label-sm text-on-surface-variant font-semibold tracking-widest uppercase">
            Payment Method
          </p>

          <div className="flex border border-outline-variant rounded-xl overflow-hidden">
            {PAYMENT_METHODS.map(({ id, label }) => (
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
                  onChange={(e) => setCardName(e.target.value)}
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
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
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
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
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
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className={inputClass(!!errors.cvv)}
                  />
                  {errors.cvv && <p className="text-label-sm text-error px-1">{errors.cvv}</p>}
                </div>
              </div>

              <label className="flex items-center gap-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-body-md text-on-surface">Save card for future bookings</span>
              </label>

              <div className="bg-surface-container rounded-xl px-md py-sm flex items-center justify-between">
                <div>
                  <p className="text-label-md font-semibold text-on-surface">Billing Address</p>
                  <p className="text-label-sm text-on-surface-variant">Same as account profile</p>
                </div>
                <button
                  onClick={() => setSameAddress((v) => !v)}
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
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }));
              }}
              className={`mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary ${
                errors.terms ? "border-error" : "border-outline-variant"
              }`}
            />
            <span className="text-label-sm text-on-surface">
              I agree to the <span className="text-primary underline">Terms &amp; Conditions</span>,
              privacy policy, and booking rules of Qoomlee Airline.
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
        </div>
      </div>

      {/* Sticky pay button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-container-margin-mobile pb-6 pt-3 bg-background/90 backdrop-blur-sm">
        <div className="max-w-screen-sm mx-auto space-y-xs">
          <button
            onClick={handlePay}
            className="w-full bg-primary text-on-primary py-4 rounded-xl text-headline-md shadow-md active:scale-95 transition-transform flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined text-[20px]">lock</span>
            Pay {formatPrice(totalMinor, currency)} Securely
          </button>
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
    </div>
  );
}
