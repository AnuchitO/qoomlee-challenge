"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "Jonathan Doe",
    email: "jonathan.doe@email.com",
    phone: "+66 81 234 5678",
    nationality: "Thai",
    passportNumber: "AA123456",
    passportExpiry: "2030-12-31",
  });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 800);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[375px] mx-auto">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center justify-between px-container-margin-mobile h-16">
        <Link
          href="/profile"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container active:scale-95 transition-all text-primary"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-headline-md text-primary truncate">Edit Profile</h1>
        <div className="w-10" />
      </header>

      {/* Avatar */}
      <section className="flex flex-col items-center mt-xl">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-md border-4 border-surface overflow-hidden flex items-center justify-center">
            <span className="text-headline-lg-mobile">JD</span>
          </div>
          <button
            aria-label="Change profile photo"
            className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center bg-surface border border-outline-variant text-primary rounded-full shadow-sm hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
        <button className="mt-sm text-label-md text-primary hover:underline transition-all">
          Change Photo
        </button>
      </section>

      {/* Form */}
      <form onSubmit={handleSave} className="mx-md mt-xl space-y-md px-md pb-32">
        {[
          { key: "fullName", label: "Full Name", type: "text", placeholder: "As on passport" },
          { key: "email", label: "Email", type: "email", placeholder: "your@email.com" },
          { key: "phone", label: "Phone", type: "tel", placeholder: "+66 80 000 0000" },
          {
            key: "passportNumber",
            label: "Passport Number",
            type: "text",
            placeholder: "A1234567",
          },
          { key: "passportExpiry", label: "Passport Expiry", type: "date", placeholder: "" },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} className="flex flex-col">
            <label className="text-label-sm text-on-surface-variant mb-1 ml-1">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={set(key as keyof typeof form)}
              placeholder={placeholder}
              className="h-14 px-md rounded-xl border border-outline-variant bg-surface text-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            />
          </div>
        ))}

        <div className="flex flex-col">
          <label className="text-label-sm text-on-surface-variant mb-1 ml-1">Nationality</label>
          <div className="relative">
            <select
              value={form.nationality}
              onChange={set("nationality")}
              className="w-full h-14 px-md appearance-none rounded-xl border border-outline-variant bg-surface text-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            >
              <option>Thai</option>
              <option>Australian</option>
              <option>Singaporean</option>
              <option>Japanese</option>
              <option>British</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Verified notice */}
        <div className="flex items-start gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant">
          <span
            className="material-symbols-outlined text-primary text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <div>
            <p className="text-label-md text-on-surface">Verified Account</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">
              Your identity has been verified. Changes to your full name may require
              re-verification.
            </p>
          </div>
        </div>
      </form>

      {/* Fixed bottom save */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[375px] mx-auto p-md bg-surface/95 backdrop-blur-md border-t border-outline-variant z-40">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 bg-primary text-on-primary rounded-xl text-headline-md shadow-md active:scale-95 transition-all duration-150 disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
