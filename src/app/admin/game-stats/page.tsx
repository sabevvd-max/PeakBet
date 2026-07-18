"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCoins, cn } from "@/lib/utils";

interface GameStat {
  slug: string;
  name: string;
  category: string;
  configuredRtp: number;
  playCount: number;
  rounds: number;
  wagered: number;
  payout: number;
  actualRtp: number | null;
}

export default function AdminGameStatsPage() {
  const [stats, setStats] = useState<GameStat[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/game-stats").then((r) => r.json()).then((d) => setStats(d.stats ?? []));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Game Statistics</h1>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-peak-border text-left text-xs text-peak-gray">
              <th className="px-4 py-3 font-medium">Game</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Rounds</th>
              <th className="px-4 py-3 font-medium">Wagered</th>
              <th className="px-4 py-3 font-medium">Payout</th>
              <th className="px-4 py-3 font-medium">Configured RTP</th>
              <th className="px-4 py-3 font-medium">Actual RTP</th>
            </tr>
          </thead>
          <tbody>
            {(stats ?? []).map((g) => (
              <tr key={g.slug} className="border-b border-peak-border/50 last:border-0">
                <td className="px-4 py-3 font-medium text-white">{g.name}</td>
                <td className="px-4 py-3 capitalize text-peak-gray">{g.category.toLowerCase()}</td>
                <td className="px-4 py-3 text-peak-gray">{g.rounds.toLocaleString()}</td>
                <td className="px-4 py-3 text-peak-gray">{formatCoins(g.wagered, { compact: true })}</td>
                <td className="px-4 py-3 text-peak-gray">{formatCoins(g.payout, { compact: true })}</td>
                <td className="px-4 py-3 text-peak-gray">{g.configuredRtp}%</td>
                <td className={cn("px-4 py-3 font-semibold", g.actualRtp === null ? "text-peak-gray-dim" : g.actualRtp > g.configuredRtp ? "text-peak-red" : "text-peak-neon")}>
                  {g.actualRtp === null ? "—" : `${g.actualRtp}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats === null && <p className="p-8 text-center text-sm text-peak-gray">Loading…</p>}
      </GlassCard>
    </div>
  );
}
