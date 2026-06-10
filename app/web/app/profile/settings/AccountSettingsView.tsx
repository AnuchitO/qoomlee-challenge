import Link from "next/link";
import TopAppBar from "../../components/TopAppBar";
import BottomNav from "../../components/BottomNav";
import {
  ACCOUNT_ACTIONS,
  NOTIFICATION_ITEMS,
  PREFERENCE_LINKS,
  SECURITY_ITEMS,
  type AccountSettings,
} from "./useAccountSettings";

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

interface AccountSettingsViewProps {
  settings: AccountSettings;
  toggle: (key: keyof AccountSettings) => void;
}

export function AccountSettingsView({ settings, toggle }: AccountSettingsViewProps) {
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
            {NOTIFICATION_ITEMS.map(({ key, label, sub, icon }, i) => (
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
                  <Toggle checked={settings[key]} onChange={() => toggle(key)} />
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
            {SECURITY_ITEMS.map(({ key, label, sub, icon }, i) => (
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
                  <Toggle checked={settings[key]} onChange={() => toggle(key)} />
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
            {PREFERENCE_LINKS.map(({ icon, label, value }) => (
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
            {ACCOUNT_ACTIONS.map(({ icon, label, danger }, i) => (
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
