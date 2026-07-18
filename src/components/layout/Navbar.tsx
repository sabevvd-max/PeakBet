"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Volume2, VolumeX, LogOut, User, Settings, ShieldCheck, Search as SearchIcon } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CoinBalance } from "@/components/ui/CoinBalance";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";
import { cn } from "@/lib/utils";

export function Navbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleSound = useUIStore((s) => s.toggleSound);
  const { user, profile, isLoading, signOut } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-peak-border bg-peak-black/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button onClick={toggleSidebar} className="text-peak-gray hover:text-white lg:hidden cursor-pointer" aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-2xl">♛</span>
          <span className="font-display text-xl font-bold text-gradient-gold hidden sm:inline">PeakBet</span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <button
          className="ml-auto text-peak-gray hover:text-white md:hidden cursor-pointer"
          onClick={() => setMobileSearchOpen((v) => !v)}
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </button>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <button
            onClick={toggleSound}
            className="rounded-lg p-2 text-peak-gray hover:bg-white/5 hover:text-white cursor-pointer"
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          </button>

          {user && <NotificationBell />}
        </div>

        {!isLoading && user && profile ? (
          <>
            <CoinBalance balance={Number(profile.balance)} className="ml-1" />
            <div ref={menuRef} className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center cursor-pointer">
                <Avatar username={profile.username} avatarUrl={profile.avatarUrl} size="sm" />
              </button>

              {menuOpen && (
                <div className="glass-strong absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-peak-border p-1.5 shadow-2xl">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-white">{profile.username}</p>
                    <p className="truncate text-xs text-peak-gray">Level {profile.level}</p>
                  </div>
                  <div className="my-1 h-px bg-peak-border" />
                  <MenuLink href="/profile" icon={User} label="Profile" onClick={() => setMenuOpen(false)} />
                  <MenuLink href="/profile/settings" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} />
                  {profile.role === "ADMIN" && (
                    <MenuLink href="/admin" icon={ShieldCheck} label="Admin Panel" onClick={() => setMenuOpen(false)} />
                  )}
                  <div className="my-1 h-px bg-peak-border" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-peak-red hover:bg-peak-red/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : !isLoading ? (
          <div className="ml-1 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
              Log In
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/signup")}>
              Sign Up
            </Button>
          </div>
        ) : (
          <div className="ml-1 h-9 w-24 animate-pulse rounded-xl bg-peak-surface-2" />
        )}
      </div>

      <div className={cn("overflow-hidden px-4 pb-3 md:hidden", mobileSearchOpen ? "block" : "hidden")}>
        <SearchBar autoFocus />
      </div>
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-peak-gray hover:bg-white/5 hover:text-white">
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
