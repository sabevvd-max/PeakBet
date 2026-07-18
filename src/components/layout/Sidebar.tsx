"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Dices,
  Spade,
  Zap,
  Trophy,
  Gift,
  Star,
  History,
  ShieldCheck,
  X,
  Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/games", label: "All Games", icon: LayoutGrid },
  { href: "/games?category=slots", label: "Slots", icon: Gem },
  { href: "/games?category=table", label: "Table Games", icon: Spade },
  { href: "/games?category=instant", label: "Instant Games", icon: Zap },
  { href: "/games?category=jackpot", label: "Jackpots", icon: Trophy },
  { href: "/promotions", label: "Promotions", icon: Gift },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile/favorites", label: "Favorites", icon: Star },
  { href: "/profile/history", label: "History", icon: History },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const { profile } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-peak-border bg-peak-black-soft transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 lg:hidden">
          <span className="font-display text-lg font-bold text-gradient-gold">PeakBet</span>
          <button onClick={() => setSidebarOpen(false)} className="text-peak-gray hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href.split("?")[0] && !item.href.includes("?");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-peak-gold/10 text-peak-gold" : "text-peak-gray hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}

          {profile?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-peak-neon hover:bg-peak-neon/10"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="border-t border-peak-border p-4">
          <div className="flex items-center gap-2 text-xs text-peak-gray">
            <Dices className="h-4 w-4" />
            <p>Demo play only — no real money, ever.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
