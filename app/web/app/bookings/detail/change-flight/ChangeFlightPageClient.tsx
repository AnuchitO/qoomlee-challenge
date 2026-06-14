"use client";

import { useChangeFlight } from "./useChangeFlight";
import { ChangeFlightView } from "./ChangeFlightView";

export default function ChangeFlightPageClient() {
  const props = useChangeFlight();
  return <ChangeFlightView {...props} />;
}
