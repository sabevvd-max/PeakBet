"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Section } from "./Section";
import { formatCoins, formatMultiplier } from "@/lib/utils";

interface Winner {
  id: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  game: string;
  gameSlug: string;
  payout: number;
  multiplier: number;
  createdAt: string;
}

export function JackpotWinners() {
  const [winners, setWinners] = useState<Winner[] | null>(null);

  useEffect(() => {
    fetch("/api/jackpot-winners?limit=8")
      .then((r) => r.json())
      .then((d) => setWinners(d.winners ?? []))
      .catch(() => setWinners([]));
  }, []);

  return (
    <Section title="Jackpot Winners" subtitle="Big multiplier wins from across the PeakBet community">
      {winners === null ? (
        <div className="flex gap-3 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-64 shrink-0" />
          ))}
        </div>
      ) : winners.length === 0 ? (
        <GlassCard className="p-6 text-center text-sm text-peak-gray">No jackpot wins yet — be the first to hit one! 🏆</GlassCard>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {winners.map((w) => (
            <Link key={w.id} href={`/casino/${w.gameSlug}`} className="shrink-0">
              <GlassCard className="flex w-72 items-center gap-3 p-4 transition-colors hover:border-peak-gold/40">
                <Avatar username={w.username} avatarUrl={w.avatarUrl} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{w.username}</p>
                  <p className="truncate text-xs text-peak-gray">{w.game}</p>
                  <p className="mt-0.5 text-sm font-bold text-peak-gold">
                    +{formatCoins(w.payout)} <span className="text-peak-neon">({formatMultiplier(w.multiplier)})</span>
                  </p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
