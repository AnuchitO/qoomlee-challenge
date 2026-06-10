"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/flights");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero header */}
      <section className="hero-gradient pt-xl pb-[96px] relative overflow-hidden flex flex-col items-center justify-center text-center px-container-margin-mobile">
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent opacity-40" />
        <div className="relative z-10 flex flex-col items-center gap-sm">
          <span
            className="material-symbols-outlined text-white text-[56px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            flight_takeoff
          </span>
          <h1 className="text-headline-lg-mobile text-white tracking-tight">Qoomlee</h1>
          <h2 className="text-headline-lg-mobile text-white mt-xs">Welcome back</h2>
          <p className="text-body-md text-white/80 max-w-[280px]">
            Sign in to manage your bookings and explore new horizons.
          </p>
        </div>
      </section>

      {/* Form card */}
      <main className="max-w-[500px] w-full mx-auto px-container-margin-mobile -mt-10 relative z-20 pb-24">
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-lg">
          <form className="space-y-lg" onSubmit={handleSubmit}>
            <div className="space-y-xs">
              <label className="text-label-sm text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                  alternate_email
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full h-12 pl-12 pr-4 bg-surface border border-outline rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-body-md text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label className="text-label-sm text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-label-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-12 pl-12 pr-12 bg-surface border border-outline rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-body-md text-on-surface"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-md my-lg">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-label-sm text-on-surface-variant">or continue with</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-md">
            <button className="h-12 border border-outline-variant rounded-xl flex items-center justify-center gap-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors active:scale-95">
              <span className="material-symbols-outlined text-[20px]">g_translate</span>
              Google
            </button>
            <button className="h-12 border border-outline-variant rounded-xl flex items-center justify-center gap-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors active:scale-95">
              <span className="material-symbols-outlined text-[20px]">smartphone</span>
              Apple
            </button>
          </div>
        </section>

        <p className="text-center text-label-md text-on-surface-variant mt-lg">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary font-bold hover:underline">
            Create one
          </Link>
        </p>
      </main>
    </div>
  );
}
