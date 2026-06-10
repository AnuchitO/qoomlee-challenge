"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/flights", label: "Search" },
  { href: "/bookings", label: "Bookings" },
  { href: "/checkin", label: "Check-in" },
  { href: "/passes", label: "Passes" },
];

export default function TopAppBar() {
  const pathname = usePathname();

  return (
    <header className="bg-surface-bright border-b border-outline-variant shadow-sm w-full sticky top-0 z-[60]">
      <div className="max-w-6xl mx-auto px-container-margin-mobile md:px-container-margin-desktop flex justify-between items-center h-16">
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-md">
          <Link
            href="/support"
            className="md:hidden hover:bg-surface-container-high transition-colors p-2 rounded-full active:opacity-80"
          >
            <span className="material-symbols-outlined text-primary">menu</span>
          </Link>
          <Link href="/flights" className="text-headline-lg-mobile tracking-tight text-primary">
            Qoomlee
          </Link>
        </div>

        {/* Centre: desktop nav */}
        <nav className="hidden md:flex items-center gap-xs">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-md py-2 rounded-full text-label-md transition-colors ${
                  active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: profile avatar */}
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <div className="w-full h-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-label-md font-bold">
            JD
          </div>
        </Link>
      </div>
    </header>
  );
}
