"use client";

import { useVerifyEmail } from "./useVerifyEmail";
import { VerifyEmailView } from "./VerifyEmailView";

export default function VerifyEmailPage() {
  const props = useVerifyEmail();
  return <VerifyEmailView {...props} />;
}
