"use client";

import { useAddPaymentMethod } from "./useAddPaymentMethod";
import { AddPaymentMethodView } from "./AddPaymentMethodView";

export default function AddPaymentMethodPage() {
  const props = useAddPaymentMethod();
  return <AddPaymentMethodView {...props} />;
}
