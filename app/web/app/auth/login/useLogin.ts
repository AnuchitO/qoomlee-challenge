import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/flights");
  }

  function toggleShowPassword() {
    setShowPassword((v) => !v);
  }

  return {
    showPassword,
    toggleShowPassword,
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  };
}
