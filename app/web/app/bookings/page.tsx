import type { Metadata } from "next";
import BookingsPageClient from "./BookingsPageClient";

export const metadata: Metadata = {
  title: "My Bookings · Qoomlee",
};

export default function BookingsPage() {
  return <BookingsPageClient />;
}
