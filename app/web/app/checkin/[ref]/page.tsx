"use client";

import { useCheckInDetails } from "./useCheckInDetails";
import { CheckInDetailsView } from "./CheckInDetailsView";

export default function CheckInDetailsPage() {
  const props = useCheckInDetails();
  return <CheckInDetailsView {...props} />;
}
