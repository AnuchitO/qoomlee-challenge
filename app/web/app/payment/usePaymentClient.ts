import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  formatCardNumber,
  formatExpiry,
  formatCvv,
  validateCardFields,
} from "@/lib/payment/cardFormatting";
import { clearPassengerDetails } from "@/lib/booking/passengerDetailsStorage";
import { getJson, postJson } from "@/lib/api/httpClient";
import { authHeaders } from "@/lib/session/sessionToken";
import type { CardDetails } from "./_qqf/cardScenarios";

export function formatDeparture(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${weekday} ${day} ${month}`;
}

function isBookingExpiredError(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    (body as { error: unknown }).error === "booking_expired"
  );
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export const VALID_PROMO = "QOOMFIRST";
export const PROMO_DISCOUNT_MINOR = 50000; // ฿500
export const INSURANCE_MINOR = 59000; // ฿590

export type PaymentMethod = "card" | "promptpay" | "bank" | "other";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "card", label: "Card" },
  { id: "promptpay", label: "PromptPay" },
  { id: "bank", label: "Bank" },
  { id: "other", label: "Other" },
];

export type BookingState = "loading" | "ready" | "expired";

interface BookingResponse {
  status: string;
  expiresAt?: string;
  totalAmountMinor?: number;
}

interface ChargeResponse {
  paymentId: number;
  status: string;
}

export interface PaymentClientProps {
  bookingRef: string;
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

export interface CardErrors {
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  terms?: string;
}

export function usePaymentClient({
  bookingRef,
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

  // booking lookup — seeds the countdown and gates the form
  const [bookingState, setBookingState] = useState<BookingState>("loading");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [bookingTotalMinor, setBookingTotalMinor] = useState(0);

  useEffect(() => {
    if (!bookingRef) {
      router.replace("/bookings/new");
      return;
    }

    let cancelled = false;
    const apiBase = process.env.NEXT_PUBLIC_QOOMLEE_API_URL ?? "http://localhost:8082";

    getJson<BookingResponse>(`${apiBase}/api/bookings/${bookingRef}`, {
      headers: authHeaders(),
    }).then((result) => {
      if (cancelled) return;

      if (!result.ok) {
        router.replace("/bookings/new");
        return;
      }

      const booking = result.value;

      if (booking.status === "CONFIRMED") {
        router.replace(`/bookings/confirmation?ref=${bookingRef}`);
        return;
      }

      if (booking.status === "EXPIRED") {
        setBookingState("expired");
        return;
      }

      const secs = booking.expiresAt
        ? Math.max(0, Math.round((Date.parse(booking.expiresAt) - Date.now()) / 1000))
        : 0;
      setSecondsLeft(secs);
      if (booking.totalAmountMinor) setBookingTotalMinor(booking.totalAmountMinor);
      setBookingState("ready");
    });

    return () => {
      cancelled = true;
    };
  }, [bookingRef, router]);

  // countdown tick
  useEffect(() => {
    if (bookingState !== "ready") return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [bookingState]);

  // promo
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  function handlePromoInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPromoInput(e.target.value);
    setPromoError("");
  }

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

  function handleCardNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCardName(e.target.value);
  }

  function handleCardNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCardNumber(formatCardNumber(e.target.value));
  }

  function handleExpiryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setExpiry(formatExpiry(e.target.value));
  }

  function handleCvvChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCvv(formatCvv(e.target.value));
  }

  function handleSaveCardChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSaveCard(e.target.checked);
  }

  function handleSameAddressToggle() {
    setSameAddress((v) => !v);
  }

  function handleAgreedChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAgreed(e.target.checked);
    if (e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }));
  }

  const applyScenario = (details: CardDetails) => {
    setCardName(details.cardName);
    setCardNumber(formatCardNumber(details.cardNumber));
    setExpiry(formatExpiry(details.expiry));
    setCvv(formatCvv(details.cvv));
    setAgreed(details.agreed);
    setErrors({});

    if (details.promoCode) {
      setPromoInput(details.promoCode);
      setPromoApplied(details.promoCode.toUpperCase() === VALID_PROMO);
      setPromoError("");
    }
  };

  // pricing
  const baseFareMinor = basePriceMinor * passengers;
  const taxMinor = Math.round(baseFareMinor * 0.15);
  const discountMinor = promoApplied ? PROMO_DISCOUNT_MINOR : 0;
  const totalMinor = baseFareMinor + taxMinor + INSURANCE_MINOR - discountMinor;

  // pay
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (activeMethod === "card") {
      const e: CardErrors = validateCardFields({ cardName, cardNumber, expiry, cvv });
      if (!agreed) e.terms = "You must agree to the terms to proceed";
      setErrors(e);
      if (Object.keys(e).length > 0) return;
    }

    setSubmitError("");
    setSubmitting(true);

    const [month, shortYear] = expiry.split("/");
    const apiBase = process.env.NEXT_PUBLIC_PAYMENT_API_URL ?? "http://localhost:8084";
    const result = await postJson<ChargeResponse>(
      `${apiBase}/api/payments/charge`,
      {
        bookingRef,
        cardName,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expirationMonth: parseInt(month, 10),
        expirationYear: 2000 + parseInt(shortYear, 10),
        securityCode: cvv,
        amountMinor: bookingTotalMinor || totalMinor,
        currency,
      },
      { headers: authHeaders() },
    );

    setSubmitting(false);

    if (!result.ok) {
      if (
        result.error.type === "BAD_STATUS" &&
        result.error.status === 409 &&
        isBookingExpiredError(result.error.body)
      ) {
        setBookingState("expired");
        return;
      }

      setSubmitError("We couldn't process your payment. Please try again.");
      return;
    }

    clearPassengerDetails();

    const params = new URLSearchParams({
      ref: bookingRef,
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

  return {
    bookingState,
    flightNumber,
    origin,
    destination,
    departureTime,
    currency,
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
    applyScenario,
    baseFareMinor,
    taxMinor,
    discountMinor,
    totalMinor,
    submitError,
    submitting,
    handlePay,
    goBack: () => router.back(),
  };
}
