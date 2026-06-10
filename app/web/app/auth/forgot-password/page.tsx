"use client";

import { useForgotPassword } from "./useForgotPassword";
import { ForgotPasswordView } from "./ForgotPasswordView";

export default function ForgotPasswordPage() {
  const props = useForgotPassword();
  return <ForgotPasswordView {...props} />;
}
