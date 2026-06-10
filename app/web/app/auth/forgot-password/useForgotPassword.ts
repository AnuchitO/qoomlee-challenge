import { useState } from "react";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  function handleTryAgain() {
    setSent(false);
  }

  return { email, setEmail, sent, handleSubmit, handleTryAgain };
}
