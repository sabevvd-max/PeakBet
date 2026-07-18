"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCoins } from "@/lib/utils";

interface Stats {
  userCount: number;
  newUsersToday: number;
  bannedCount: number;
  gamesCount: number;
  totalWagered: number;
  totalPayout: number;
  houseProfit: number;
  roundsToday: number;
  activeUsersToday: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [dau, setDau] = useState<{ date: string; activeUsers: number }[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    fetch("/api/admin/dau").then((r) => r.json()).then((d) => setDau(d.series));
  }, []);

  const cards = stats
    ? [
        { label: "Total Users", value: stats.userCount.toLocaleString() },
        { label: "New Users Today", value: stats.newUsersToday.toLocaleString() },
        { label: "Active Today", value: stats.activeUsersToday.toLocaleString() },
        { label: "Rounds Today", value: stats.roundsToday.toLocaleString() },
        { label: "Total Wagered", value: formatCoins(stats.totalWagered, { compact: true }) },
        { label: "Total Payout", value: formatCoins(stats.totalPayout, { compact: true }) },
        { label: "House Profit", value: formatCoins(stats.houseProfit, { compact: true }) },
        { label: "Banned Users", value: stats.bannedCount.toLocaleString() },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(stats ? cards : Array.from<null>({ length: 8 }).fill(null)).map((c, i) => (
          <GlassCard key={i} className="p-4">
            {c ? (
              <>
                <p className="text-xs text-peak-gray">{c.label}</p>
                <p className="mt-1 text-lg font-bold text-white">{c.value}</p>
              </>
            ) : (
              <div className="h-10 animate-pulse" />
            )}
          </GlassCard>
        ))}
      </div>

      <h2 className="mb-4 mt-8 text-lg font-semibold text-white">Daily Active Users (14 days)</h2>
      <GlassCard className="p-4">
        {dau ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dau}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262b" />
              <XAxis dataKey="date" tick={{ fill: "#9a9aa2", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: "#9a9aa2", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #26262b", borderRadius: 8 }} />
              <Line type="monotone" dataKey="activeUsers" stroke="#ffd700" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 animate-pulse" />
        )}
      </GlassCard>
    </div>
  );
}
