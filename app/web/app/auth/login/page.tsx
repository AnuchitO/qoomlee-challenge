"use client";

import { useLogin } from "./useLogin";
import { LoginView } from "./LoginView";

export default function LoginPage() {
  const props = useLogin();
  return <LoginView {...props} />;
}
