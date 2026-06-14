"use client";

import { useCheckInDetails } from "./useCheckInDetails";
import { CheckInDetailsView } from "./CheckInDetailsView";

export default function CheckInDetailsPageClient() {
  const props = useCheckInDetails();
  return <CheckInDetailsView {...props} />;
}
