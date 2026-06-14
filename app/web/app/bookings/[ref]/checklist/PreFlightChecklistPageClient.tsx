"use client";

import { usePreFlightChecklist } from "./usePreFlightChecklist";
import { PreFlightChecklistView } from "./PreFlightChecklistView";

export default function PreFlightChecklistPageClient() {
  const props = usePreFlightChecklist();
  return <PreFlightChecklistView {...props} />;
}
