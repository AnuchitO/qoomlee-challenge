import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getJson } from "@/lib/api/httpClient";
import { authHeaders } from "@/lib/session/sessionToken";

export interface BookingFlight {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

export interface BookingPassenger {
  firstName: string;
  lastName: string;
  email: string;
}

export interface BookingDetail {
  bookingRef: string;
  status: string;
  passenger: BookingPassenger;
  flight: BookingFlight;
}

export type ManageBookingState = "loading" | "ready" | "not_found";

export function useManageBooking() {
  const ref = useSearchParams().get("ref") ?? "";
  const router = useRouter();
  const [loadState, setLoadState] = useState<ManageBookingState>("loading");
  const [booking, setBooking] = useState<BookingDetail | null>(null);

  useEffect(() => {
    if (!ref) {
      router.replace("/bookings");
      return;
    }

    let cancelled = false;
    const apiBase = process.env.NEXT_PUBLIC_QOOMLEE_API_URL ?? "http://localhost:8082";

    getJson<BookingDetail>(`${apiBase}/api/bookings/${ref}`, {
      headers: authHeaders(),
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        router.replace("/bookings");
        return;
      }
      setBooking(result.value);
      setLoadState("ready");
    });

    return () => {
      cancelled = true;
    };
  }, [ref, router]);

  return { ref, loadState, booking };
}
