"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCoins } from "@/lib/utils";

interface PromoCode {
  id: string;
  code: string;
  coinReward: number;
  maxRedemptions: number;
  redeemedCount: number;
  active: boolean;
  createdAt: string;
}

export default function AdminRewardsPage() {
  const [codes, setCodes] = useState<PromoCode[] | null>(null);
  const [code, setCode] = useState("");
  const [coinReward, setCoinReward] = useState(500);
  const [maxRedemptions, setMaxRedemptions] = useState(1000);
  const [creating, setCreating] = useState(false);

  function load() {
    fetch("/api/admin/promo-codes").then((r) => r.json()).then((d) => setCodes(d.codes ?? []));
  }
  useEffect(load, []);

  async function create() {
    if (!code.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, coinReward, maxRedemptions }),
    });
    setCreating(false);
    if (!res.ok) return toast.error("Failed to create code");
    setCode("");
    toast.success("Promo code created");
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/admin/promo-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Reward Management</h1>

      <GlassCard className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">New Promo Code</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" />
          <Input type="number" value={coinReward} onChange={(e) => setCoinReward(Number(e.target.value))} placeholder="Coin reward" />
          <Input type="number" value={maxRedemptions} onChange={(e) => setMaxRedemptions(Number(e.target.value))} placeholder="Max redemptions" />
          <Button onClick={create} disabled={creating}>
            Create Code
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-peak-border text-left text-xs text-peak-gray">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Reward</th>
              <th className="px-4 py-3 font-medium">Redemptions</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(codes ?? []).map((c) => (
              <tr key={c.id} className="border-b border-peak-border/50 last:border-0">
                <td className="px-4 py-3 font-mono font-semibold text-peak-gold">{c.code}</td>
                <td className="px-4 py-3 text-peak-gray">{formatCoins(c.coinReward)}</td>
                <td className="px-4 py-3 text-peak-gray">
                  {c.redeemedCount}/{c.maxRedemptions}
                </td>
                <td className="px-4 py-3">{c.active ? <Badge variant="neon">Active</Badge> : <Badge variant="gray">Inactive</Badge>}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="secondary" onClick={() => toggleActive(c.id, !c.active)}>
                    {c.active ? "Deactivate" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes === null && <p className="p-8 text-center text-sm text-peak-gray">Loading…</p>}
      </GlassCard>
    </div>
  );
}
