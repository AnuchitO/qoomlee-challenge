import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  formatCardNumber,
  formatExpiry,
  formatCvv,
  validateCardFields,
} from "@/lib/payment/cardFormatting";
import { clearPassengerDetails } from "@/lib/booking/passengerDetailsStorage";
import type { CardDetails } from "./_qqf/cardScenarios";

export function formatDeparture(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  return `${weekday} ${day} ${month}`;
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function generateBookingRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return (
    "QM" + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
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

export interface CardErrors {
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  terms?: string;
}

export function usePaymentClient({
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
  const handlePay = () => {
    if (activeMethod === "card") {
      const e: CardErrors = validateCardFields({ cardName, cardNumber, expiry, cvv });
      if (!agreed) e.terms = "You must agree to the terms to proceed";
      setErrors(e);
      if (Object.keys(e).length > 0) return;
    }

    clearPassengerDetails();

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

  return {
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
    handlePay,
    goBack: () => router.back(),
  };
}
