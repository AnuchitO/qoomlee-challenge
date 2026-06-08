"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/flights", icon: "flight_takeoff", label: "Search" },
  { href: "/bookings", icon: "confirmation_number", label: "Bookings" },
  { href: "/checkin", icon: "how_to_reg", label: "Check-in" },
  { href: "/passes", icon: "qr_code_2", label: "Passes" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden bg-surface-container-lowest border-t border-outline-variant shadow-[0px_-2px_10px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-sm z-50 rounded-t-xl">
      {navItems.map(({ href, icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-full transition-colors duration-150 ${
              active
                ? "text-primary bg-primary-container/20"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                active
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {icon}
            </span>
            <span className="text-label-sm">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
