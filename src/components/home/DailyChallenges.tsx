"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Section } from "./Section";
import { formatCoins } from "@/lib/utils";

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  goal: number;
  progress: number;
  coinReward: number;
  xpReward: number;
  completed: boolean;
}

export function DailyChallenges() {
  const [missions, setMissions] = useState<Mission[] | null>(null);

  useEffect(() => {
    fetch("/api/missions")
      .then((r) => r.json())
      .then((d) => setMissions((d.missions ?? []).filter((m: { period: string }) => m.period === "DAILY")))
      .catch(() => setMissions([]));
  }, []);

  return (
    <Section title="Daily Challenges" subtitle="Complete missions for bonus coins and XP" viewAllHref="/profile/rewards">
      {missions === null ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassCard key={i} className="h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {missions.map((m) => (
            <GlassCard key={m.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xl">{m.icon}</span>
                {m.completed && <Badge variant="neon">Complete</Badge>}
              </div>
              <p className="text-sm font-semibold text-white">{m.title}</p>
              <p className="mb-2 text-xs text-peak-gray">{m.description}</p>
              <ProgressBar value={m.progress / m.goal} label={`${Math.min(m.progress, m.goal)}/${m.goal}`} />
              <p className="mt-2 text-xs font-semibold text-peak-gold">
                +{formatCoins(m.coinReward)} · +{m.xpReward} XP
              </p>
            </GlassCard>
          ))}
        </div>
      )}
    </Section>
  );
}
