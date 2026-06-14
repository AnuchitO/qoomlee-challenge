import type { Metadata } from "next";
import { Suspense } from "react";
import ConfirmationPageClient from "./ConfirmationPageClient";

export const metadata: Metadata = {
  title: "Booking Confirmed · Qoomlee",
};

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationPageClient />
    </Suspense>
  );
}
