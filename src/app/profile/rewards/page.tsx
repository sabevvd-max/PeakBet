"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/profile/RequireAuth";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { formatCoins } from "@/lib/utils";

interface RewardStatus {
  claimed: boolean;
  streak: number;
  nextAmount: number;
}

interface Mission {
  id: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
  title: string;
  description: string;
  icon: string;
  goal: number;
  progress: number;
  coinReward: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
}

function RewardsContent() {
  const { setBalance } = useAuth();
  const [rewards, setRewards] = useState<Record<string, RewardStatus> | null>(null);
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [referral, setReferral] = useState<{ referralCode: string; totalEarned: number; referrals: { username: string }[] } | null>(null);
  const [promoCode, setPromoCode] = useState("");

  function refresh() {
    fetch("/api/rewards/status").then((r) => r.json()).then((d) => setRewards(d.rewards));
    fetch("/api/missions").then((r) => r.json()).then((d) => setMissions(d.missions));
    fetch("/api/referral").then((r) => r.json()).then(setReferral);
  }

  useEffect(refresh, []);

  async function claimReward(period: string) {
    const res = await fetch("/api/rewards/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ period }) });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Could not claim");
    setBalance(data.balance);
    toast.success(`+${formatCoins(data.amount)} claimed!`);
    refresh();
  }

  async function claimMission(missionId: string) {
    const res = await fetch("/api/missions/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ missionId }) });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Could not claim");
    setBalance(data.balance);
    toast.success("Mission reward claimed!");
    refresh();
  }

  async function redeemPromo() {
    if (!promoCode.trim()) return;
    const res = await fetch("/api/promo/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: promoCode }) });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Invalid code");
    setBalance(data.balance);
    toast.success(`+${formatCoins(data.amount)} redeemed!`);
    setPromoCode("");
  }

  function copyReferralLink() {
    if (!referral) return;
    const link = `${window.location.origin}/signup?ref=${referral.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">My Profile</h1>
      <ProfileNav />

      <h2 className="mt-6 mb-4 text-lg font-semibold text-white">Login Rewards</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((period) => {
          const status = rewards?.[period];
          return (
            <GlassCard key={period} className="p-5">
              <p className="text-sm font-semibold capitalize text-white">{period.toLowerCase()} Reward</p>
              <p className="text-xs text-peak-gray">Streak: {status?.streak ?? 0}</p>
              <p className="my-3 text-2xl font-bold text-peak-gold">{status ? formatCoins(status.nextAmount) : "—"}</p>
              <Button className="w-full" onClick={() => claimReward(period)} disabled={!status || status.claimed}>
                {status?.claimed ? "Claimed" : "Claim"}
              </Button>
            </GlassCard>
          );
        })}
      </div>

      <h2 className="mt-8 mb-4 text-lg font-semibold text-white">Missions</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(missions ?? []).map((m) => (
          <GlassCard key={m.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xl">{m.icon}</span>
              <Badge variant="gray">{m.period}</Badge>
            </div>
            <p className="text-sm font-semibold text-white">{m.title}</p>
            <p className="mb-2 text-xs text-peak-gray">{m.description}</p>
            <ProgressBar value={m.progress / m.goal} label={`${Math.min(m.progress, m.goal)}/${m.goal}`} />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-peak-gold">
                +{formatCoins(m.coinReward)} · +{m.xpReward} XP
              </p>
              {m.completed && !m.claimed && (
                <Button size="sm" onClick={() => claimMission(m.id)}>
                  Claim
                </Button>
              )}
              {m.claimed && <Badge variant="neon">Claimed</Badge>}
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Referral Program</h2>
          <GlassCard className="p-5">
            <p className="text-sm text-peak-gray">Share your link — you and your friend both get 500 coins.</p>
            <div className="mt-3 flex gap-2">
              <Input readOnly value={referral ? `${referral.referralCode}` : "Loading..."} />
              <Button onClick={copyReferralLink} disabled={!referral}>
                Copy Link
              </Button>
            </div>
            <p className="mt-3 text-xs text-peak-gray">
              {referral?.referrals.length ?? 0} friends referred · {formatCoins(referral?.totalEarned ?? 0)} earned
            </p>
          </GlassCard>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Promo Codes</h2>
          <GlassCard className="p-5">
            <p className="text-sm text-peak-gray">Have a code? Redeem it for instant demo coins.</p>
            <div className="mt-3 flex gap-2">
              <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="PROMOCODE" />
              <Button onClick={redeemPromo}>Redeem</Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <RequireAuth>
      <RewardsContent />
    </RequireAuth>
  );
}
