"use client";

import { useRefundRequest } from "./useRefundRequest";
import { RefundRequestView } from "./RefundRequestView";

export default function RefundRequestPageClient() {
  const props = useRefundRequest();
  return <RefundRequestView {...props} />;
}
