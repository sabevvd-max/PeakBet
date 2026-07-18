"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BarChart3, Trophy, ScrollText, Megaphone, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Balances", icon: Users },
  { href: "/admin/game-stats", label: "Game Statistics", icon: BarChart3 },
  { href: "/admin/leaderboard", label: "Top Players", icon: Trophy },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/rewards", label: "Reward Management", icon: Gift },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-peak-neon/10 text-peak-neon" : "text-peak-gray hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
