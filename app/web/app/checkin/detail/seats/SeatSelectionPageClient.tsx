"use client";

import { useSeatSelection } from "./useSeatSelection";
import { SeatSelectionView } from "./SeatSelectionView";

export default function SeatSelectionPageClient() {
  const props = useSeatSelection();
  return <SeatSelectionView {...props} />;
}
