"use client";

import { useRegister } from "./useRegister";
import { RegisterView } from "./RegisterView";

export default function RegisterPage() {
  const props = useRegister();
  return <RegisterView {...props} />;
}
