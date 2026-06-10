import { useState } from "react";
import { useRouter } from "next/navigation";

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  confirm: string;
  terms: boolean;
}

export function useRegister() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirm: "",
    terms: false,
  });

  const set = (k: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  function toggleShowPassword() {
    setShowPassword((v) => !v);
  }

  function toggleShowConfirm() {
    setShowConfirm((v) => !v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/flights");
  }

  return {
    showPassword,
    toggleShowPassword,
    showConfirm,
    toggleShowConfirm,
    form,
    set,
    handleSubmit,
  };
}
