"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Flight } from "@/lib/flight/types";
import { formatTHB } from "@/lib/currency/format";
import { loadPassengerDetails, savePassengerDetails } from "@/lib/booking/passengerDetailsStorage";
import { postJson } from "@/lib/api/httpClient";
import { authHeaders } from "@/lib/session/sessionToken";
import QaQuickFill from "./_qqf/QaQuickFill";
import type { PassengerDetails } from "./_qqf/passengerScenarios";

interface CreateBookingResponse {
  bookingId: number;
  bookingRef: string;
  expiresAt?: string;
}

const UPGRADE_PRICE_MINOR = 29900;

interface Props {
  flight: Flight;
  returnFlight?: Flight;
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

export default function BookingClient({ flight, returnFlight, passengers }: Props) {
  const router = useRouter();
  // Restore passenger details if the user navigated back from the payment page
  const [firstName, setFirstName] = useState(() => loadPassengerDetails()?.firstName ?? "");
  const [lastName, setLastName] = useState(() => loadPassengerDetails()?.lastName ?? "");
  const [email, setEmail] = useState(() => loadPassengerDetails()?.email ?? "");
  const [phone, setPhone] = useState(() => loadPassengerDetails()?.phone ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Persist passenger details so they survive navigation to/from the payment page
  useEffect(() => {
    savePassengerDetails({ firstName, lastName, email, phone });
  }, [firstName, lastName, email, phone]);

  const baseFareTotal = (flight.basePriceMinor + (returnFlight?.basePriceMinor ?? 0)) * passengers;
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

  const applyScenario = (details: PassengerDetails) => {
    setFirstName(details.firstName);
    setLastName(details.lastName);
    setEmail(details.email);
    setPhone(details.phone);
    setErrors({});
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setSubmitError("");
    setSubmitting(true);

    const apiBase = process.env.NEXT_PUBLIC_QOOMLEE_API_URL ?? "http://localhost:8082";
    const result = await postJson<CreateBookingResponse>(
      `${apiBase}/api/bookings`,
      {
        flightId: flight.id,
        passenger: { firstName, lastName, email, phone },
      },
      { headers: authHeaders() },
    );

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError("Something went wrong creating your booking. Please try again.");
      return;
    }

    const params = new URLSearchParams({
      ref: result.value.bookingRef,
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
    if (returnFlight) {
      params.set("returnFlightId", String(returnFlight.id));
      params.set("returnFlightNumber", returnFlight.flightNumber);
      params.set("returnOrigin", returnFlight.origin);
      params.set("returnDestination", returnFlight.destination);
      params.set("returnDepartureTime", returnFlight.departureTime);
      params.set("returnPrice", String(returnFlight.basePriceMinor));
    }
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
            <span className="text-body-md text-on-surface">{formatTHB(baseFareTotal / 100)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-body-md text-on-surface">Taxes &amp; Fees</span>
            <span className="text-body-md text-on-surface">{formatTHB(taxTotal / 100)}</span>
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
            +{formatTHB(UPGRADE_PRICE_MINOR / 100)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-sm border-t border-outline-variant">
          <span className="text-body-md font-semibold text-on-surface">Total Amount</span>
          <span className="text-headline-md text-primary">{formatTHB(grandTotal / 100)}</span>
        </div>
      </section>

      {/* Sticky Continue button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-container-margin-mobile md:px-container-margin-desktop pb-6 pt-3 bg-background/90 backdrop-blur-sm">
        <div className="max-w-screen-sm mx-auto space-y-xs">
          {submitError && (
            <p className="text-label-sm text-error text-center" role="alert">
              {submitError}
            </p>
          )}
          <button
            type="button"
            onClick={handleContinue}
            disabled={submitting}
            className="w-full bg-primary text-on-primary py-4 rounded-xl text-headline-md shadow-md active:scale-95 transition-transform flex items-center justify-center gap-sm disabled:opacity-60"
          >
            Continue to Payment
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {process.env.NEXT_PUBLIC_ENABLE_TEST_SCENARIOS === "true" && (
        <QaQuickFill onApplyScenario={applyScenario} />
      )}
    </>
  );
}
