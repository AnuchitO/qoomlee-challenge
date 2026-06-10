"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center justify-between px-container-margin-mobile h-16 w-full max-w-[480px]">
        <div className="flex items-center gap-md">
          <Link
            href="/auth/login"
            className="hover:bg-surface-container-high transition-colors p-2 rounded-full"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-headline-md text-on-surface">Reset Password</h1>
        </div>
        <div className="w-10" />
      </header>

      <main className="w-full max-w-[480px] pb-xxl px-container-margin-mobile">
        {!sent ? (
          <section className="flex flex-col items-center mt-xxl">
            <div className="flex flex-col items-center text-center gap-md">
              <div className="bg-primary-fixed p-lg rounded-full mb-md">
                <span className="material-symbols-outlined text-primary text-[64px]">key</span>
              </div>
              <h2 className="text-headline-lg-mobile text-on-surface">Forgot your password?</h2>
              <p className="text-body-md text-on-surface-variant">
                Enter your account email and we&apos;ll send a reset link.
              </p>
            </div>

            <div className="w-full mt-xl bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
                <label className="text-label-sm text-on-surface-variant" htmlFor="email">
                  Email address
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                    alternate_email
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="block w-full pl-10 h-14 border border-outline rounded-xl bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-body-md"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-sm w-full h-14 bg-primary-container text-on-primary-container text-label-md rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Send Reset Link
                </button>
              </form>
            </div>

            <p className="mt-lg text-body-md text-on-surface-variant text-center">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-primary text-label-md hover:underline">
                Sign in
              </Link>
            </p>
          </section>
        ) : (
          <section className="flex flex-col items-center mt-xxl">
            <div className="flex flex-col items-center text-center gap-md">
              <div className="bg-green-100 p-lg rounded-full mb-md">
                <span
                  className="material-symbols-outlined text-green-700 text-[64px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>
              <h2 className="text-headline-lg-mobile text-on-surface">Check your inbox</h2>
              <p className="text-body-md text-on-surface-variant">
                A reset link was sent to <span className="text-on-surface font-bold">{email}</span>.
                Check your spam folder if you don&apos;t see it.
              </p>
            </div>

            <div className="w-full mt-xl space-y-md">
              <button
                onClick={() => setSent(false)}
                className="w-full h-12 border border-outline-variant text-on-surface text-label-md rounded-xl hover:bg-surface-container-low transition-colors active:scale-95"
              >
                Try a different email
              </button>
              <Link
                href="/auth/login"
                className="block w-full h-12 bg-primary text-on-primary text-label-md rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
              >
                Back to Sign In
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
