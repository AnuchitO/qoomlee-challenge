"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FlightData } from "./components/FlightSummaryCard";

function formatPrice(minor: number, currency: string): string {
  const major = minor / 100;
  if (currency === "THB") return `฿${major.toLocaleString()}`;
  return `$${major.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const UPGRADE_PRICE_MINOR = 29900;

interface Props {
  flight: FlightData;
  passengers: number;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const inputBase =
  "w-full border rounded-xl px-md py-3 bg-surface-bright text-body-md placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors";

export default function BookingClient({ flight, passengers }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const baseFareTotal = flight.basePriceMinor * passengers;
  const taxTotal = Math.round(baseFareTotal * 0.15);
  const grandTotal = baseFareTotal + taxTotal;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim()) e.lastName = "Required";
    if (!email.trim() || !email.includes("@")) e.email = "Valid email required";
    if (!phone.trim()) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    const params = new URLSearchParams({
      flightId: String(flight.id),
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      price: String(flight.basePriceMinor),
      currency: flight.currency,
      passengers: String(passengers),
      firstName,
      lastName,
      email,
      phone,
    });
    router.push(`/payment?${params.toString()}`);
  };

  return (
    <>
      {/* Passenger Details */}
      <section className="space-y-md">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">person</span>
          <h2 className="text-headline-md text-on-surface">Passenger Details</h2>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label className="block text-label-sm text-on-surface-variant px-1">First Name</label>
            <input
              type="text"
              placeholder="e.g. John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`${inputBase} ${errors.firstName ? "border-error" : "border-outline-variant"}`}
            />
            {errors.firstName && (
              <p className="text-label-sm text-error px-1">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-xs">
            <label className="block text-label-sm text-on-surface-variant px-1">Last Name</label>
            <input
              type="text"
              placeholder="e.g. Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`${inputBase} ${errors.lastName ? "border-error" : "border-outline-variant"}`}
            />
            {errors.lastName && <p className="text-label-sm text-error px-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-xs">
          <label className="block text-label-sm text-on-surface-variant px-1">Email Address</label>
          <input
            type="email"
            placeholder="john.doe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputBase} ${errors.email ? "border-error" : "border-outline-variant"}`}
          />
          {errors.email && <p className="text-label-sm text-error px-1">{errors.email}</p>}
        </div>

        <div className="space-y-xs">
          <label className="block text-label-sm text-on-surface-variant px-1">Phone Number</label>
          <div className="flex gap-sm">
            <div className="flex items-center justify-center border border-outline-variant rounded-xl px-md bg-surface-bright shrink-0">
              <span className="text-body-md text-on-surface">+66</span>
            </div>
            <input
              type="tel"
              placeholder="000 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`flex-1 border rounded-xl px-md py-3 bg-surface-bright text-body-md placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors ${
                errors.phone ? "border-error" : "border-outline-variant"
              }`}
            />
          </div>
          {errors.phone && <p className="text-label-sm text-error px-1">{errors.phone}</p>}
        </div>
      </section>

      {/* Payment Summary */}
      <section className="bg-surface-container rounded-xl p-md space-y-md">
        <p className="text-label-sm text-on-surface-variant font-semibold tracking-widest uppercase">
          Payment Summary
        </p>

        <div className="space-y-sm">
          <div className="flex justify-between items-center">
            <span className="text-body-md text-on-surface">Base Fare ({passengers}x Adult)</span>
            <span className="text-body-md text-on-surface">
              {formatPrice(baseFareTotal, flight.currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-body-md text-on-surface">Taxes &amp; Fees</span>
            <span className="text-body-md text-on-surface">
              {formatPrice(taxTotal, flight.currency)}
            </span>
          </div>
        </div>

        {/* Upgrade upsell */}
        <div className="bg-tertiary-fixed rounded-xl px-md py-sm flex items-center gap-md">
          <span
            className="material-symbols-outlined text-tertiary-container shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            workspace_premium
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-label-md font-semibold text-on-tertiary-fixed-variant">
              Upgrade to Business
            </p>
            <p className="text-label-sm text-on-tertiary-fixed-variant/70">
              Lounge access &amp; more
            </p>
          </div>
          <span className="text-label-md font-semibold text-tertiary-container shrink-0">
            +{formatPrice(UPGRADE_PRICE_MINOR, flight.currency)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-sm border-t border-outline-variant">
          <span className="text-body-md font-semibold text-on-surface">Total Amount</span>
          <span className="text-headline-md text-primary">
            {formatPrice(grandTotal, flight.currency)}
          </span>
        </div>
      </section>

      {/* Sticky Continue button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-container-margin-mobile md:px-container-margin-desktop pb-6 pt-3 bg-background/90 backdrop-blur-sm">
        <div className="max-w-screen-sm mx-auto">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-primary text-on-primary py-4 rounded-xl text-headline-md shadow-md active:scale-95 transition-transform flex items-center justify-center gap-sm"
          >
            Continue to Payment
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </>
  );
}
