import { useState } from "react";
import { useRouter } from "next/navigation";

export interface PaymentMethodForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  setDefault: boolean;
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export function useAddPaymentMethod() {
  const router = useRouter();
  const [form, setForm] = useState<PaymentMethodForm>({
    cardName: "Jonathan Doe",
    cardNumber: "",
    expiry: "",
    cvv: "",
    setDefault: true,
  });

  const displayNumber = form.cardNumber
    ? `•••• •••• •••• ${form.cardNumber.replace(/\s/g, "").slice(-4)}`
    : "•••• •••• •••• ••••";

  function setCardName(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, cardName: e.target.value }));
  }

  function setCardNumber(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, cardNumber: formatCardNumber(e.target.value) }));
  }

  function setExpiry(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }));
  }

  function setCvv(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }));
  }

  function setDefault(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, setDefault: e.target.checked }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/profile/settings");
  }

  return {
    form,
    displayNumber,
    setCardName,
    setCardNumber,
    setExpiry,
    setCvv,
    setDefault,
    handleSubmit,
  };
}
