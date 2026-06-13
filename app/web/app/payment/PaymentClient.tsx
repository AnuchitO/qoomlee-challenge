"use client";

import { usePaymentClient, type PaymentClientProps } from "./usePaymentClient";
import { PaymentClientView } from "./PaymentClientView";
import QaQuickFill from "./_qqf/QaQuickFill";

export type { PaymentClientProps };

export default function PaymentClient(props: PaymentClientProps) {
  const state = usePaymentClient(props);
  return (
    <>
      <PaymentClientView {...state} />
      {process.env.NEXT_PUBLIC_ENABLE_TEST_SCENARIOS === "true" && (
        <QaQuickFill onApplyScenario={state.applyScenario} />
      )}
    </>
  );
}
