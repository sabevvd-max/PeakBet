"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/profile", label: "Overview" },
  { href: "/profile/achievements", label: "Achievements" },
  { href: "/profile/history", label: "Game History" },
  { href: "/profile/transactions", label: "Transactions" },
  { href: "/profile/rewards", label: "Rewards" },
  { href: "/profile/favorites", label: "Favorites" },
  { href: "/profile/settings", label: "Settings" },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-peak-border pb-px">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "border-peak-gold text-peak-gold" : "border-transparent text-peak-gray hover:text-white"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
