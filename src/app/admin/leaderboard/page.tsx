"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCoins } from "@/lib/utils";

interface Player {
  username: string;
  avatarUrl: string | null;
  level: number;
  balance: number;
  totalWagered: number;
  totalPayout: number;
  gamesPlayed: number;
  gamesWon: number;
}

export default function AdminLeaderboardPage() {
  const [players, setPlayers] = useState<Player[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/top-players").then((r) => r.json()).then((d) => setPlayers(d.players ?? []));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Top Players</h1>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-peak-border text-left text-xs text-peak-gray">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Wagered</th>
              <th className="px-4 py-3 font-medium">Payout</th>
              <th className="px-4 py-3 font-medium">Games</th>
              <th className="px-4 py-3 font-medium">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {(players ?? []).map((p, i) => (
              <tr key={p.username} className="border-b border-peak-border/50 last:border-0">
                <td className="px-4 py-3 text-peak-gray">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar username={p.username} avatarUrl={p.avatarUrl} size="sm" />
                    <span className="font-medium text-white">{p.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-peak-gold">{formatCoins(p.balance)}</td>
                <td className="px-4 py-3 text-peak-gray">{formatCoins(p.totalWagered, { compact: true })}</td>
                <td className="px-4 py-3 text-peak-gray">{formatCoins(p.totalPayout, { compact: true })}</td>
                <td className="px-4 py-3 text-peak-gray">{p.gamesPlayed}</td>
                <td className="px-4 py-3 text-peak-gray">{p.gamesPlayed > 0 ? Math.round((p.gamesWon / p.gamesPlayed) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {players === null && <p className="p-8 text-center text-sm text-peak-gray">Loading…</p>}
      </GlassCard>
    </div>
  );
}
