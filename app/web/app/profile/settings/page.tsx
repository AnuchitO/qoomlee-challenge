"use client";

import { useState } from "react";
import Link from "next/link";
import TopAppBar from "../../components/TopAppBar";
import BottomNav from "../../components/BottomNav";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-outline-variant"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function AccountSettingsPage() {
  const [settings, setSettings] = useState({
    pushBookingUpdates: true,
    pushCheckIn: true,
    pushFlightStatus: false,
    emailOffers: true,
    emailReceipts: true,
    smsAlerts: false,
    biometric: true,
    twoFactor: false,
    dataSaving: false,
  });

  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <>
      <TopAppBar />
      <main className="pb-28 pt-4 max-w-2xl mx-auto px-container-margin-mobile space-y-xl">
        {/* Profile card */}
        <section className="bg-secondary text-on-secondary rounded-xl p-lg flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-headline-lg-mobile shadow-inner">
              JD
            </div>
            <div>
              <p className="text-label-md font-bold">Jonathan Doe</p>
              <p className="text-label-sm text-on-secondary/70">jonathan.doe@email.com</p>
              <span className="inline-flex items-center gap-xs mt-xs px-2 py-0.5 bg-white/20 rounded-full text-label-sm">
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
                Gold Elite
              </span>
            </div>
          </div>
          <Link href="/profile/edit">
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-on-secondary">edit</span>
            </button>
          </Link>
        </section>

        {/* Notification settings */}
        <section className="space-y-sm">
          <h2 className="text-label-md text-on-surface-variant uppercase tracking-wider px-xs">
            Notifications
          </h2>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            {[
              {
                key: "pushBookingUpdates",
                label: "Booking updates",
                sub: "Status changes, reminders",
                icon: "confirmation_number",
              },
              {
                key: "pushCheckIn",
                label: "Check-in alerts",
                sub: "When check-in opens",
                icon: "how_to_reg",
              },
              {
                key: "pushFlightStatus",
                label: "Flight status",
                sub: "Delays and gate changes",
                icon: "flight",
              },
              {
                key: "emailOffers",
                label: "Email offers",
                sub: "Deals and promotions",
                icon: "local_offer",
              },
              {
                key: "emailReceipts",
                label: "Email receipts",
                sub: "Booking confirmations",
                icon: "receipt_long",
              },
              {
                key: "smsAlerts",
                label: "SMS alerts",
                sub: "Critical updates by SMS",
                icon: "sms",
              },
            ].map(({ key, label, sub, icon }, i) => (
              <div key={key}>
                {i > 0 && <div className="h-px bg-outline-variant/30 mx-md" />}
                <div className="flex items-center justify-between p-md">
                  <div className="flex items-center gap-md">
                    <div className="bg-primary-container/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                    </div>
                    <div>
                      <p className="text-label-md text-on-surface">{label}</p>
                      <p className="text-label-sm text-on-surface-variant">{sub}</p>
                    </div>
                  </div>
                  <Toggle
                    checked={settings[key as keyof typeof settings]}
                    onChange={() => toggle(key as keyof typeof settings)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="space-y-sm">
          <h2 className="text-label-md text-on-surface-variant uppercase tracking-wider px-xs">
            Security
          </h2>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            {[
              {
                key: "biometric",
                label: "Biometric login",
                sub: "Face ID / Fingerprint",
                icon: "fingerprint",
              },
              {
                key: "twoFactor",
                label: "Two-factor auth",
                sub: "Extra security via SMS",
                icon: "security",
              },
            ].map(({ key, label, sub, icon }, i) => (
              <div key={key}>
                {i > 0 && <div className="h-px bg-outline-variant/30 mx-md" />}
                <div className="flex items-center justify-between p-md">
                  <div className="flex items-center gap-md">
                    <div className="bg-primary-container/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                    </div>
                    <div>
                      <p className="text-label-md text-on-surface">{label}</p>
                      <p className="text-label-sm text-on-surface-variant">{sub}</p>
                    </div>
                  </div>
                  <Toggle
                    checked={settings[key as keyof typeof settings]}
                    onChange={() => toggle(key as keyof typeof settings)}
                  />
                </div>
              </div>
            ))}
            <div className="h-px bg-outline-variant/30 mx-md" />
            <button className="w-full flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group">
              <div className="flex items-center gap-md">
                <div className="bg-primary-container/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary">lock_reset</span>
                </div>
                <div className="text-left">
                  <p className="text-label-md text-on-surface">Change password</p>
                  <p className="text-label-sm text-on-surface-variant">Last changed 3 months ago</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>
          </div>
        </section>

        {/* App preferences */}
        <section className="space-y-sm">
          <h2 className="text-label-md text-on-surface-variant uppercase tracking-wider px-xs">
            Preferences
          </h2>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="flex items-center justify-between p-md">
              <div className="flex items-center gap-md">
                <div className="bg-primary-container/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary">data_saver_on</span>
                </div>
                <div>
                  <p className="text-label-md text-on-surface">Data saving mode</p>
                  <p className="text-label-sm text-on-surface-variant">
                    Reduce media quality on mobile
                  </p>
                </div>
              </div>
              <Toggle checked={settings.dataSaving} onChange={() => toggle("dataSaving")} />
            </div>
            {[
              { icon: "language", label: "Language", value: "English (EN)", href: "#" },
              { icon: "currency_exchange", label: "Currency", value: "THB (฿)", href: "#" },
            ].map(({ icon, label, value }) => (
              <div key={label}>
                <div className="h-px bg-outline-variant/30 mx-md" />
                <button className="w-full flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-center gap-md">
                    <div className="bg-primary-container/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                    </div>
                    <p className="text-label-md text-on-surface">{label}</p>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="text-label-sm text-on-surface-variant">{value}</span>
                    <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Account actions */}
        <section className="space-y-sm">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            {[
              { icon: "download", label: "Download my data", danger: false },
              { icon: "logout", label: "Sign out", danger: false },
              { icon: "delete_forever", label: "Delete account", danger: true },
            ].map(({ icon, label, danger }, i) => (
              <div key={label}>
                {i > 0 && <div className="h-px bg-outline-variant/30 mx-md" />}
                <button
                  className={`w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors ${
                    danger ? "text-error" : "text-on-surface"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${danger ? "text-error" : "text-outline"}`}
                  >
                    {icon}
                  </span>
                  <span className="text-label-md">{label}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
