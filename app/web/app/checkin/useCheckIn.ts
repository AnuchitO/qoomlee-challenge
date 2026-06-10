import { useState } from "react";

export function useCheckIn() {
  const [bookingRef, setBookingRef] = useState("");
  const [lastName, setLastName] = useState("");

  function handleBookingRefChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBookingRef(e.target.value.toUpperCase());
  }

  function handleLastNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLastName(e.target.value);
  }

  return { bookingRef, lastName, handleBookingRefChange, handleLastNameChange };
}
