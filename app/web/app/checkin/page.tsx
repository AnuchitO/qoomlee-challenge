"use client";

import { useCheckIn } from "./useCheckIn";
import { CheckInView } from "./CheckInView";

export default function CheckInPage() {
  const props = useCheckIn();
  return <CheckInView {...props} />;
}
