"use client";

import QuickFillWidget from "../../components/_qqf/QuickFillWidget";
import { cardScenarios, type CardDetails } from "./cardScenarios";

interface QaQuickFillProps {
  onApplyScenario: (details: CardDetails) => void;
}

export default function QaQuickFill({ onApplyScenario }: QaQuickFillProps) {
  return (
    <QuickFillWidget
      title="QA Quick-fill"
      // Clear the sticky "Pay Securely" bar (124px tall on mobile and desktop, includes badges row).
      anchorClassName="bottom-36 right-4 md:bottom-36"
      options={cardScenarios.map((scenario) => ({
        id: scenario.id,
        label: scenario.label,
        onSelect: () => onApplyScenario(scenario.details),
      }))}
    />
  );
}
