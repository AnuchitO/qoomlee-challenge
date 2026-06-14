import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentPageClient from "./PaymentPageClient";

export const metadata: Metadata = {
  title: "Secure Payment · Qoomlee",
};

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentPageClient />
    </Suspense>
  );
}
