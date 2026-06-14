import type { Metadata } from "next";
import { Suspense } from "react";
import ManageBookingPageClient from "./ManageBookingPageClient";
import { BookingDetailSkeleton } from "./_skeleton/BookingDetailSkeleton";

export const metadata: Metadata = {
  title: "Manage Booking · Qoomlee",
};

export default function ManageBookingPage() {
  return (
    <Suspense fallback={<BookingDetailSkeleton />}>
      <ManageBookingPageClient />
    </Suspense>
  );
}
