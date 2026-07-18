"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/profile/RequireAuth";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { formatCoins, cn } from "@/lib/utils";

interface Achievement {
  id: string;
  type: "ACHIEVEMENT" | "BADGE";
  name: string;
  description: string;
  icon: string;
  tier: string;
  goal: number;
  xpReward: number;
  coinReward: number;
  progress: number;
  unlockedAt: string | null;
}

function AchievementsContent() {
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);

  useEffect(() => {
    fetch("/api/profile/achievements")
      .then((r) => r.json())
      .then((d) => setAchievements(d.achievements ?? []));
  }, []);

  const unlockedCount = achievements?.filter((a) => a.unlockedAt).length ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">My Profile</h1>
      <ProfileNav />

      <div className="mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Achievements &amp; Badges</h2>
        {achievements && (
          <span className="text-sm text-peak-gray">
            {unlockedCount}/{achievements.length} unlocked
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(achievements ?? Array.from({ length: 6 })).map((a, i) =>
          a ? (
            <GlassCard key={(a as Achievement).id} className={cn("p-4", !(a as Achievement).unlockedAt && "opacity-60")}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl">{(a as Achievement).icon}</span>
                <div className="flex gap-1">
                  <Badge variant={(a as Achievement).type === "BADGE" ? "purple" : "gold"}>{(a as Achievement).type}</Badge>
                  {(a as Achievement).unlockedAt && <Badge variant="neon">Unlocked</Badge>}
                </div>
              </div>
              <p className="text-sm font-semibold text-white">{(a as Achievement).name}</p>
              <p className="mb-2 text-xs text-peak-gray">{(a as Achievement).description}</p>
              {!(a as Achievement).unlockedAt && (
                <ProgressBar
                  value={(a as Achievement).progress / (a as Achievement).goal}
                  label={`${(a as Achievement).progress}/${(a as Achievement).goal}`}
                />
              )}
              <p className="mt-2 text-xs font-semibold text-peak-gold">
                +{formatCoins((a as Achievement).coinReward)} · +{(a as Achievement).xpReward} XP
              </p>
            </GlassCard>
          ) : (
            <GlassCard key={i} className="h-36 animate-pulse" />
          )
        )}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <RequireAuth>
      <AchievementsContent />
    </RequireAuth>
  );
}
