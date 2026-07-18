"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Tabs } from "@/components/ui/Tabs";
import { Section } from "./Section";
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

export function LeaderboardWidget() {
  const [period, setPeriod] = useState("WEEKLY");
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    setEntries(null);
    fetch(`/api/leaderboard?period=${period}&limit=10`)
      .then((r) => r.json())
      .then((d) => setEntries(d.leaderboard ?? []))
      .catch(() => setEntries([]));
  }, [period]);

  return (
    <Section title="Leaderboard" subtitle="Top wagered players — resets every period" viewAllHref="/leaderboard">
      <Tabs
        tabs={[
          { key: "DAILY", label: "Daily" },
          { key: "WEEKLY", label: "Weekly" },
          { key: "MONTHLY", label: "Monthly" },
          { key: "ALL_TIME", label: "All Time" },
        ]}
        defaultTab="WEEKLY"
        onChange={setPeriod}
        className="mb-4"
      />

      <GlassCard className="divide-y divide-peak-border">
        {entries === null ? (
          <div className="p-6 text-center text-sm text-peak-gray">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="p-6 text-center text-sm text-peak-gray">No activity yet for this period — start playing to top the board!</div>
        ) : (
          entries.map((e) => (
            <div key={e.rank} className="flex items-center gap-3 px-4 py-3">
              <span className={cn("w-6 text-center font-bold", RANK_COLORS[e.rank - 1] ?? "text-peak-gray-dim")}>
                {e.rank <= 3 ? <Trophy className="mx-auto h-4 w-4" /> : e.rank}
              </span>
              <Avatar username={e.username} avatarUrl={e.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{e.username}</p>
                <p className="text-xs text-peak-gray">Level {e.level}</p>
              </div>
              <p className="text-sm font-semibold text-peak-gold">{formatCoins(e.wagered, { compact: true })}</p>
            </div>
          ))
        )}
      </GlassCard>
    </Section>
  );
}
