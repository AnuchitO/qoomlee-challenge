"use client";

import { useAccountSettings } from "./useAccountSettings";
import { AccountSettingsView } from "./AccountSettingsView";

export default function AccountSettingsPage() {
  const props = useAccountSettings();
  return <AccountSettingsView {...props} />;
}
