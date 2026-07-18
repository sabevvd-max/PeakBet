"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/profile/RequireAuth";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCoins, cn } from "@/lib/utils";

interface Tx {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  SIGNUP_BONUS: "Signup Bonus",
  BET: "Bet",
  PAYOUT: "Payout",
  DAILY_REWARD: "Daily Reward",
  WEEKLY_REWARD: "Weekly Reward",
  MONTHLY_REWARD: "Monthly Reward",
  MISSION_REWARD: "Mission Reward",
  ACHIEVEMENT_REWARD: "Achievement Reward",
  LEVEL_UP_BONUS: "Level Up Bonus",
  PROMO_CODE: "Promo Code",
  REFERRAL_BONUS: "Referral Bonus",
  ADMIN_ADJUSTMENT: "Admin Adjustment",
};

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Tx[] | null>(null);

  useEffect(() => {
    fetch("/api/profile/transactions?limit=50")
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">My Profile</h1>
      <ProfileNav />

      <h2 className="mt-6 mb-4 text-lg font-semibold text-white">Transaction History</h2>

      <GlassCard className="divide-y divide-peak-border/50">
        {transactions === null ? (
          <p className="p-8 text-center text-sm text-peak-gray">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="p-8 text-center text-sm text-peak-gray">No transactions yet.</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{TYPE_LABEL[t.type] ?? t.type}</p>
                <p className="text-xs text-peak-gray">{t.description}</p>
                <p className="text-[11px] text-peak-gray-dim">{new Date(t.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-semibold", t.amount >= 0 ? "text-peak-neon" : "text-peak-red")}>
                  {t.amount >= 0 ? "+" : ""}
                  {formatCoins(t.amount)}
                </p>
                <p className="text-xs text-peak-gray-dim">Balance: {formatCoins(t.balanceAfter)}</p>
              </div>
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <RequireAuth>
      <TransactionsContent />
    </RequireAuth>
  );
}
