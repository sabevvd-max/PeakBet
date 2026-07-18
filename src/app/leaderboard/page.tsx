"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Tabs } from "@/components/ui/Tabs";
import { formatCoins, cn } from "@/lib/utils";

interface Entry {
  rank: number;
  username: string;
  avatarUrl: string | null;
  level: number;
  wagered: number;
  netProfit: number;
}

const RANK_COLORS = ["text-peak-gold", "text-peak-gray", "text-[#cd7f32]"];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("WEEKLY");
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    setEntries(null);
    fetch(`/api/leaderboard?period=${period}&limit=100`)
      .then((r) => r.json())
      .then((d) => setEntries(d.leaderboard ?? []));
  }, [period]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white">Leaderboard</h1>
      <p className="mt-1 text-sm text-peak-gray">Top wagered players across PeakBet — resets every period.</p>

      <Tabs
        className="mt-6"
        tabs={[
          { key: "DAILY", label: "Daily" },
          { key: "WEEKLY", label: "Weekly" },
          { key: "MONTHLY", label: "Monthly" },
          { key: "ALL_TIME", label: "All Time" },
        ]}
        defaultTab="WEEKLY"
        onChange={setPeriod}
      />

      <GlassCard className="mt-6 divide-y divide-peak-border">
        {entries === null ? (
          <div className="p-8 text-center text-sm text-peak-gray">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-sm text-peak-gray">No activity yet for this period.</div>
        ) : (
          entries.map((e) => (
            <div key={e.rank} className="flex items-center gap-4 px-5 py-3.5">
              <span className={cn("w-8 text-center font-bold", RANK_COLORS[e.rank - 1] ?? "text-peak-gray-dim")}>
                {e.rank <= 3 ? <Trophy className="mx-auto h-5 w-5" /> : e.rank}
              </span>
              <Avatar username={e.username} avatarUrl={e.avatarUrl} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{e.username}</p>
                <p className="text-xs text-peak-gray">Level {e.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-peak-gold">{formatCoins(e.wagered)}</p>
                <p className="text-xs text-peak-gray-dim">wagered</p>
              </div>
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}
