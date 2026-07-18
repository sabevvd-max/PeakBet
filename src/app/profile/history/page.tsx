"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/profile/RequireAuth";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCoins, formatMultiplier, cn } from "@/lib/utils";

interface Round {
  id: string;
  game: string;
  gameSlug: string;
  category: string;
  betAmount: number;
  payout: number;
  multiplier: number;
  isWin: boolean;
  createdAt: string;
}

function HistoryContent() {
  const [rounds, setRounds] = useState<Round[] | null>(null);

  useEffect(() => {
    fetch("/api/profile/history?limit=50")
      .then((r) => r.json())
      .then((d) => setRounds(d.rounds ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">My Profile</h1>
      <ProfileNav />

      <h2 className="mt-6 mb-4 text-lg font-semibold text-white">Game History</h2>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-peak-border text-left text-xs text-peak-gray">
                <th className="px-4 py-3 font-medium">Game</th>
                <th className="px-4 py-3 font-medium">Bet</th>
                <th className="px-4 py-3 font-medium">Multiplier</th>
                <th className="px-4 py-3 font-medium">Payout</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rounds === null ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-peak-gray">
                    Loading…
                  </td>
                </tr>
              ) : rounds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-peak-gray">
                    No rounds played yet. <Link href="/games" className="text-peak-gold hover:underline">Play a game</Link>
                  </td>
                </tr>
              ) : (
                rounds.map((r) => (
                  <tr key={r.id} className="border-b border-peak-border/50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/casino/${r.gameSlug}`} className="font-medium text-white hover:text-peak-gold">
                        {r.game}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-peak-gray">{formatCoins(r.betAmount)}</td>
                    <td className="px-4 py-3 text-peak-gray">{formatMultiplier(r.multiplier)}</td>
                    <td className={cn("px-4 py-3 font-semibold", r.isWin ? "text-peak-neon" : "text-peak-gray")}>{formatCoins(r.payout)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", r.isWin ? "bg-peak-neon/10 text-peak-neon" : "bg-peak-red/10 text-peak-red")}>
                        {r.isWin ? "Win" : "Loss"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-peak-gray-dim">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <RequireAuth>
      <HistoryContent />
    </RequireAuth>
  );
}
