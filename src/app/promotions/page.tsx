"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Gift, Calendar, Users, Ticket } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function PromotionsPage() {
  const { user, setBalance } = useAuth();
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  async function redeem() {
    if (!user) {
      toast.info("Log in to redeem a promo code");
      return;
    }
    if (!code.trim()) return;
    setRedeeming(true);
    const res = await fetch("/api/promo/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setRedeeming(false);
    if (!res.ok) return toast.error(data.error ?? "Invalid code");
    setBalance(data.balance);
    toast.success(`+${data.amount} demo coins redeemed!`);
    setCode("");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white">Promotions</h1>
      <p className="mt-1 text-sm text-peak-gray">Every way to stack up more demo coins at PeakBet.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GlassCard className="p-6">
          <Gift className="mb-3 h-7 w-7 text-peak-gold" />
          <h2 className="text-lg font-semibold text-white">Welcome Bonus</h2>
          <p className="mt-1 text-sm text-peak-gray">Every new account starts with 10,000 free demo coins — no strings attached.</p>
          {!user && (
            <Link href="/signup">
              <Button className="mt-4">Sign Up Now</Button>
            </Link>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <Calendar className="mb-3 h-7 w-7 text-peak-gold" />
          <h2 className="text-lg font-semibold text-white">Daily / Weekly / Monthly Rewards</h2>
          <p className="mt-1 text-sm text-peak-gray">Log in regularly to build a streak and claim escalating bonus coins.</p>
          <Link href="/profile/rewards">
            <Button className="mt-4" variant="secondary">
              Claim Rewards
            </Button>
          </Link>
        </GlassCard>

        <GlassCard className="p-6">
          <Users className="mb-3 h-7 w-7 text-peak-gold" />
          <h2 className="text-lg font-semibold text-white">Referral Program</h2>
          <p className="mt-1 text-sm text-peak-gray">Share your link — you and your friend each get 500 demo coins when they join.</p>
          <Link href="/profile/rewards">
            <Button className="mt-4" variant="secondary">
              Get My Link
            </Button>
          </Link>
        </GlassCard>

        <GlassCard className="p-6">
          <Ticket className="mb-3 h-7 w-7 text-peak-gold" />
          <h2 className="text-lg font-semibold text-white">Promo Codes</h2>
          <p className="mt-1 text-sm text-peak-gray">Redeem a code below for an instant coin boost. Try <span className="font-mono text-peak-gold">WELCOME500</span>.</p>
          <div className="mt-4 flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="PROMOCODE" />
            <Button onClick={redeem} disabled={redeeming}>
              Redeem
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
