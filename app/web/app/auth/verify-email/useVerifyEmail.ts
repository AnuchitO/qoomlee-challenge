import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useVerifyEmail() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const canResend = countdown <= 0;
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handleResend() {
    setCountdown(60);
    setOtp(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();
  }

  function handleVerify() {
    router.push("/flights");
  }

  function setInputRef(index: number) {
    return (el: HTMLInputElement | null) => {
      inputs.current[index] = el;
    };
  }

  const complete = otp.every((d) => d !== "");

  return {
    otp,
    countdown,
    canResend,
    complete,
    setInputRef,
    handleChange,
    handleKeyDown,
    handleResend,
    handleVerify,
  };
}
