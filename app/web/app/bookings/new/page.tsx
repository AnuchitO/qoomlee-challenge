import type { Metadata } from "next";
import { Suspense } from "react";
import BookingPageClient from "./BookingPageClient";

export const metadata: Metadata = {
  title: "Book Your Flight · Qoomlee",
};

export default function BookingPage() {
  return (
    <Suspense>
      <BookingPageClient />
    </Suspense>
  );
}
