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
      options={cardScenarios.map((scenario) => ({
        id: scenario.id,
        label: scenario.label,
        onSelect: () => onApplyScenario(scenario.details),
      }))}
    />
  );
}
