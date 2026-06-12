import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCardNumber, formatExpiry, formatCvv } from "@/lib/payment/cardFormatting";

export interface PaymentMethodForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  setDefault: boolean;
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
    setForm((f) => ({ ...f, cvv: formatCvv(e.target.value) }));
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
