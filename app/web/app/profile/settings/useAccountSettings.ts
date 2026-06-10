import { useState } from "react";

export interface AccountSettings {
  pushBookingUpdates: boolean;
  pushCheckIn: boolean;
  pushFlightStatus: boolean;
  emailOffers: boolean;
  emailReceipts: boolean;
  smsAlerts: boolean;
  biometric: boolean;
  twoFactor: boolean;
  dataSaving: boolean;
}

export const NOTIFICATION_ITEMS: {
  key: keyof AccountSettings;
  label: string;
  sub: string;
  icon: string;
}[] = [
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
];

export const SECURITY_ITEMS: {
  key: keyof AccountSettings;
  label: string;
  sub: string;
  icon: string;
}[] = [
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
];

export const PREFERENCE_LINKS = [
  { icon: "language", label: "Language", value: "English (EN)", href: "#" },
  { icon: "currency_exchange", label: "Currency", value: "THB (฿)", href: "#" },
];

export const ACCOUNT_ACTIONS = [
  { icon: "download", label: "Download my data", danger: false },
  { icon: "logout", label: "Sign out", danger: false },
  { icon: "delete_forever", label: "Delete account", danger: true },
];

export function useAccountSettings() {
  const [settings, setSettings] = useState<AccountSettings>({
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

  const toggle = (key: keyof AccountSettings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return { settings, toggle };
}
