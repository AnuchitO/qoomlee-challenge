"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
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

  const complete = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[375px] mx-auto px-container-margin-mobile">
      <header className="h-16 flex items-center">
        <Link
          href="/auth/register"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container active:scale-95 transition-all text-primary"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center pt-xl">
        {/* Icon */}
        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-primary-fixed/50">
          <span
            className="material-symbols-outlined text-[80px] text-primary-fixed-dim"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mail
          </span>
        </div>

        <h2 className="text-headline-lg-mobile text-center mt-xl text-on-surface">
          Verify your email
        </h2>
        <p className="text-body-md text-center text-on-surface-variant px-lg mt-md">
          We&apos;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-on-surface">john@example.com</span>. Enter it below to
          activate your account.
        </p>

        {/* OTP inputs */}
        <div className="flex gap-sm mt-xl justify-center w-full">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 rounded-xl border-2 text-center text-headline-md text-primary bg-surface transition-all focus:outline-none ${
                digit
                  ? "border-primary bg-primary-fixed/10"
                  : "border-outline-variant focus:border-primary"
              }`}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="mt-xl flex items-center gap-xs justify-center">
          <span className="text-label-sm text-on-surface-variant">Didn&apos;t receive the code?</span>
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-label-md text-primary cursor-pointer underline"
            >
              Resend Now
            </button>
          ) : (
            <span className="text-label-md text-on-surface-variant">Resend in {countdown}s</span>
          )}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={!complete}
          className="w-full h-14 bg-primary text-on-primary rounded-xl text-headline-md mt-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform duration-150 disabled:opacity-50 disabled:pointer-events-none"
        >
          Verify &amp; Complete
        </button>

        <Link
          href="/auth/register"
          className="text-label-md text-primary text-center mt-lg mb-xxl block hover:underline decoration-2 underline-offset-4"
        >
          Change email address
        </Link>
      </main>
    </div>
  );
}
