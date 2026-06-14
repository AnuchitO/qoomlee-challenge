import type { Metadata } from "next";
import { Suspense } from "react";
import ManageBookingPageClient from "./ManageBookingPageClient";

export const metadata: Metadata = {
  title: "Manage Booking · Qoomlee",
};

export default function ManageBookingPage() {
  return (
    <Suspense>
      <ManageBookingPageClient />
    </Suspense>
  );
}
