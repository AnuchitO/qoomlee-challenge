import type { Metadata } from "next";
import Link from "next/link";
import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";

export const metadata: Metadata = {
  title: "My Profile · Qoomlee",
};

const MENU_ITEMS = [
  {
    section: "Account",
    items: [
      { icon: "person", label: "Edit Profile", href: "/profile/edit" },
      { icon: "credit_card", label: "Payment Methods", href: "/profile/payment" },
      { icon: "settings", label: "Account Settings", href: "/profile/settings" },
    ],
  },
  {
    section: "My Trips",
    items: [
      { icon: "confirmation_number", label: "My Bookings", href: "/bookings" },
      { icon: "qr_code_2", label: "Boarding Passes", href: "/passes" },
      { icon: "how_to_reg", label: "Check-in", href: "/checkin" },
    ],
  },
  {
    section: "Support",
    items: [
      { icon: "help", label: "Help & Support", href: "/support" },
      { icon: "policy", label: "Privacy Policy", href: "#" },
      { icon: "description", label: "Terms of Service", href: "#" },
    ],
  },
];

export default function ProfilePage() {
  return (
    <>
      <TopAppBar />
      <main className="pb-28 md:pb-8 max-w-[28rem] mx-auto px-container-margin-mobile md:px-container-margin-desktop py-lg space-y-xl">
        {/* Profile card */}
        <section className="bg-secondary text-on-secondary rounded-xl p-lg flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-headline-lg-mobile shadow-inner shrink-0">
              JD
            </div>
            <div>
              <p className="text-headline-md text-on-secondary">Jonathan Doe</p>
              <p className="text-label-sm text-on-secondary/70">jonathan.doe@email.com</p>
              <div className="flex items-center gap-xs mt-xs">
                <span
                  className="material-symbols-outlined text-[14px] text-on-secondary/80"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
                <span className="text-label-sm text-on-secondary/80">Gold Elite</span>
              </div>
            </div>
          </div>
          <Link href="/profile/edit">
            <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-on-secondary">edit</span>
            </button>
          </Link>
        </section>

        {/* Loyalty points */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-label-sm text-on-surface-variant">Qoomlee Miles</p>
              <p className="text-headline-lg-mobile text-primary font-bold">12,450</p>
            </div>
            <button className="px-md py-sm bg-primary-container text-on-primary-container text-label-md rounded-xl active:scale-95 transition-all">
              Redeem
            </button>
          </div>
          <div className="mt-md h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "62%" }} />
          </div>
          <p className="text-label-sm text-on-surface-variant mt-xs">
            7,550 miles to Platinum Elite
          </p>
        </section>

        {/* Menu */}
        {MENU_ITEMS.map((group) => (
          <section key={group.section} className="space-y-sm">
            <h2 className="text-label-md text-on-surface-variant uppercase tracking-wider px-xs">
              {group.section}
            </h2>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              {group.items.map(({ icon, label, href }, i) => (
                <div key={label}>
                  {i > 0 && <div className="h-px bg-outline-variant/30 mx-md" />}
                  <Link
                    href={href}
                    className="flex items-center justify-between p-md hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex items-center gap-md">
                      <div className="w-9 h-9 bg-primary-container/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          {icon}
                        </span>
                      </div>
                      <span className="text-label-md text-on-surface">{label}</span>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}

        <button className="w-full flex items-center gap-md p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors text-error">
          <span className="material-symbols-outlined text-error">logout</span>
          <span className="text-label-md">Sign out</span>
        </button>
      </main>
      <BottomNav />
    </>
  );
}
