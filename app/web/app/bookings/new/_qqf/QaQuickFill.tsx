"use client";

import QuickFillWidget from "../../../components/_qqf/QuickFillWidget";
import { passengerScenarios, type PassengerDetails } from "./passengerScenarios";

interface QaQuickFillProps {
  onApplyScenario: (details: PassengerDetails) => void;
}

export default function QaQuickFill({ onApplyScenario }: QaQuickFillProps) {
  return (
    <QuickFillWidget
      title="QA Quick-fill"
      options={passengerScenarios.map((scenario) => ({
        id: scenario.id,
        label: scenario.label,
        onSelect: () => onApplyScenario(scenario.details),
      }))}
    />
  );
}
