"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function PasswordStrength({ password }: { password: string }) {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const bars = [
    score >= 1 ? "bg-error" : "bg-outline-variant",
    score >= 2 ? "bg-tertiary" : "bg-outline-variant",
    score >= 3 ? "bg-secondary" : "bg-outline-variant",
    score >= 4 ? "bg-green-500" : "bg-outline-variant",
    score >= 5 ? "bg-green-500" : "bg-outline-variant",
  ];

  const label = ["", "Too weak", "Weak", "Fair", "Strong", "Very strong"][score];

  if (!password) return null;

  return (
    <div className="space-y-sm">
      <div className="flex gap-xs">
        {bars.map((b, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${b}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-xs px-1">
        {[
          { ok: hasLength, label: "8+ chars" },
          { ok: hasUpper, label: "Uppercase" },
          { ok: hasNumber, label: "Number" },
          { ok: hasSpecial, label: "Special char" },
        ].map(({ ok, label: l }) => (
          <span
            key={l}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm border ${
              ok
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-error-container/20 text-error border-error-container/30"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{ok ? "check" : "close"}</span>
            {l}
          </span>
        ))}
      </div>
      <p className="text-label-sm text-on-surface-variant px-1">{label}</p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirm: "",
    terms: false,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/flights");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center justify-between px-container-margin-mobile h-16">
        <div className="flex items-center gap-md">
          <Link
            href="/auth/login"
            className="hover:bg-surface-container-high p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-headline-md text-on-surface">Create Account</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-outline">account_circle</span>
        </div>
      </header>

      <main className="max-w-[500px] mx-auto w-full px-container-margin-mobile space-y-xl pb-32 pt-lg">
        {/* Progress */}
        <div className="flex items-center gap-sm px-xs">
          {["Personal", "Security", "Verify"].map((step, i) => (
            <div key={step} className="flex items-center gap-sm flex-1">
              <div
                className={`flex flex-col items-center gap-1 ${i === 0 ? "opacity-100" : "opacity-40"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? "bg-primary text-on-primary"
                      : "border-2 border-outline text-on-surface"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-label-sm text-on-surface-variant">{step}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-outline-variant mb-4" />}
            </div>
          ))}
        </div>

        {/* Form */}
        <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30 shadow-md">
          <form className="space-y-md" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant px-1">First name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="John"
                  className="w-full h-12 px-md rounded-xl border border-outline focus:border-primary focus:ring-0 focus:outline-none bg-surface-bright transition-all text-body-md"
                />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant px-1">Last name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Doe"
                  className="w-full h-12 px-md rounded-xl border border-outline focus:border-primary focus:ring-0 focus:outline-none bg-surface-bright transition-all text-body-md"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant px-1">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  alternate_email
                </span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  placeholder="example@qoomlee.com"
                  className="w-full h-12 pl-12 pr-md rounded-xl border border-outline focus:border-primary focus:ring-0 focus:outline-none bg-surface-bright transition-all text-body-md"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant px-1">Phone</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  phone
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+66 80 000 0000"
                  className="w-full h-12 pl-12 pr-md rounded-xl border border-outline focus:border-primary focus:ring-0 focus:outline-none bg-surface-bright transition-all text-body-md"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant px-1">Date of birth</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.dob}
                  onChange={set("dob")}
                  className="w-full h-12 px-md rounded-xl border border-outline focus:border-primary focus:ring-0 focus:outline-none bg-surface-bright transition-all text-body-md"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                  calendar_today
                </span>
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant px-1">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Create a strong password"
                  className="w-full h-12 pl-12 pr-12 rounded-xl border border-outline focus:border-primary focus:ring-0 focus:outline-none bg-surface-bright transition-all text-body-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant px-1">Confirm Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Repeat your password"
                  className={`w-full h-12 pl-12 pr-12 rounded-xl border focus:ring-0 focus:outline-none bg-surface-bright transition-all text-body-md ${
                    form.confirm && form.confirm !== form.password
                      ? "border-error focus:border-error"
                      : "border-outline focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirm ? "visibility_off" : "visibility"}
                  </span>
                </button>
                {form.confirm && form.confirm === form.password && (
                  <span
                    className="material-symbols-outlined absolute right-12 top-1/2 -translate-y-1/2 text-green-600 text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
              </div>
            </div>

            <footer className="space-y-lg pt-sm">
              <label className="flex items-start gap-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={set("terms")}
                  className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary focus:ring-offset-0"
                />
                <p className="text-label-md text-on-surface-variant">
                  I agree to the{" "}
                  <Link href="#" className="text-primary font-bold hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary font-bold hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </label>

              <button
                type="submit"
                disabled={!form.terms}
                className="w-full h-14 bg-primary text-on-primary text-label-md rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
              >
                Create Account
              </button>

              <p className="text-center text-label-md text-on-surface-variant">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </footer>
          </form>
        </section>
      </main>
    </div>
  );
}
