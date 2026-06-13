"use client";

import QuickFillWidget from "../../components/_qqf/QuickFillWidget";
import type { FlightSearchState } from "../hooks/useFlightSearch";
import { searchScenarios } from "./searchScenarios";

interface QaQuickFillProps {
  onApplyScenario: (scenario: FlightSearchState) => void;
}

export default function QaQuickFill({ onApplyScenario }: QaQuickFillProps) {
  return (
    <QuickFillWidget
      title="QA Quick-fill"
      options={searchScenarios.map((scenario) => ({
        id: scenario.id,
        label: scenario.label,
        onSelect: () => onApplyScenario(scenario.state),
      }))}
    />
  );
}
