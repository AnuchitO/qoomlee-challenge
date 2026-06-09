import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: "Secure Payment · Qoomlee",
};

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const p = await searchParams;
  const str = (v: string | string[] | undefined, fallback = ""): string =>
    Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);

  return (
    <PaymentClient
      flightNumber={str(p.flightNumber, "—")}
      origin={str(p.origin, "—")}
      destination={str(p.destination, "—")}
      departureTime={str(p.departureTime, new Date().toISOString())}
      basePriceMinor={Number(str(p.price, "0"))}
      currency={str(p.currency, "THB")}
      passengers={Math.max(1, Number(str(p.passengers, "1")))}
      firstName={str(p.firstName)}
      lastName={str(p.lastName)}
      email={str(p.email)}
      phone={str(p.phone)}
    />
  );
}
