"use client";

import { usePaymentClient, type PaymentClientProps } from "./usePaymentClient";
import { PaymentClientView } from "./PaymentClientView";

export type { PaymentClientProps };

export default function PaymentClient(props: PaymentClientProps) {
  const state = usePaymentClient(props);
  return <PaymentClientView {...state} />;
}
