"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/profile/RequireAuth";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { formatCoins, formatMultiplier } from "@/lib/utils";
import type { LevelProgress, RANK_TIERS } from "@/lib/progression";

interface StatsResponse {
  level: LevelProgress;
  rank: (typeof RANK_TIERS)[number];
  stats: {
    totalWagered: number;
    totalPayout: number;
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    biggestWin: number;
    biggestMultiplier: number;
    currentWinStreak: number;
    bestWinStreak: number;
  };
  achievementCount: number;
  favoriteCount: number;
  memberSince: string;
}

function ProfileOverview() {
  const { profile } = useAuth();
  const [data, setData] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetch("/api/profile/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">My Profile</h1>
      <ProfileNav />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar username={profile?.username} avatarUrl={profile?.avatarUrl} size="xl" />
            <h2 className="mt-3 text-xl font-bold text-white">{profile?.username}</h2>
            {data && (
              <Badge className="mt-2" style={{ color: data.rank.color, borderColor: `${data.rank.color}55` }}>
                {data.rank.name}
              </Badge>
            )}
            {profile?.bio && <p className="mt-2 text-sm text-peak-gray">{profile.bio}</p>}

            {data && (
              <div className="mt-5 w-full">
                <div className="mb-1.5 flex justify-between text-xs text-peak-gray">
                  <span>Level {data.level.level}</span>
                  <span>
                    {data.level.xpIntoLevel}/{data.level.xpForNextLevel} XP
                  </span>
                </div>
                <ProgressBar value={data.level.progress} />
              </div>
            )}

            {data && <p className="mt-4 text-xs text-peak-gray-dim">Member since {new Date(data.memberSince).toLocaleDateString()}</p>}
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-3">
          <StatCard label="Total Wagered" value={data ? formatCoins(data.stats.totalWagered, { compact: true }) : "—"} />
          <StatCard label="Total Payout" value={data ? formatCoins(data.stats.totalPayout, { compact: true }) : "—"} />
          <StatCard label="Games Played" value={data ? data.stats.gamesPlayed.toLocaleString() : "—"} />
          <StatCard label="Win Rate" value={data ? `${data.stats.winRate}%` : "—"} />
          <StatCard label="Biggest Win" value={data ? formatCoins(data.stats.biggestWin, { compact: true }) : "—"} />
          <StatCard label="Best Multiplier" value={data ? formatMultiplier(data.stats.biggestMultiplier) : "—"} />
          <StatCard label="Current Streak" value={data ? `${data.stats.currentWinStreak}` : "—"} />
          <StatCard label="Best Streak" value={data ? `${data.stats.bestWinStreak}` : "—"} />
          <StatCard label="Achievements" value={data ? `${data.achievementCount}` : "—"} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-peak-gray">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </GlassCard>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileOverview />
    </RequireAuth>
  );
}
