"use client";

import { useSearchParams } from "next/navigation";
import PaymentClient from "./PaymentClient";

export default function PaymentPageClient() {
  const searchParams = useSearchParams();
  const str = (key: string, fallback = ""): string => searchParams.get(key) ?? fallback;

  return (
    <PaymentClient
      flightNumber={str("flightNumber", "—")}
      origin={str("origin", "—")}
      destination={str("destination", "—")}
      departureTime={str("departureTime", new Date().toISOString())}
      basePriceMinor={Number(str("price", "0"))}
      currency={str("currency", "THB")}
      passengers={Math.max(1, Number(str("passengers", "1")))}
      firstName={str("firstName")}
      lastName={str("lastName")}
      email={str("email")}
      phone={str("phone")}
    />
  );
}
