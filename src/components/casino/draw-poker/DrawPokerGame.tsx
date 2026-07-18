"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { Button } from "@/components/ui/Button";
import { GameMeta } from "@/lib/games/types";
import { cn } from "@/lib/utils";

interface DrawResult {
  finalHand: string[];
  handLabel: string;
  multiplier: number;
}

export function DrawPokerGame({ game, dealUrl, drawUrl, paytable }: { game: GameMeta; dealUrl: string; drawUrl: string; paytable: [string, number][] }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<DrawResult>();
  const [betAmount, setBetAmount] = useState(10);
  const [dealing, setDealing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [hand, setHand] = useState<string[] | null>(null);
  const [holds, setHolds] = useState<boolean[]>([false, false, false, false, false]);
  const [showResult, setShowResult] = useState(false);

  async function deal() {
    setDealing(true);
    setShowResult(false);
    const res = await fetch(dealUrl, { method: "POST" });
    const data = await res.json();
    setDealing(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not deal");
      return;
    }
    setToken(data.token);
    setHand(data.hand);
    setHolds([false, false, false, false, false]);
  }

  function toggleHold(i: number) {
    setHolds((h) => h.map((v, idx) => (idx === i ? !v : v)));
  }

  async function draw() {
    if (!token) return;
    const outcome = await request(drawUrl, { betAmount, token, holds });
    if (outcome) setShowResult(true);
    setToken(null);
  }

  const displayHand = showResult ? lastResult?.result.finalHand : hand;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel
        betAmount={betAmount}
        onChange={setBetAmount}
        balance={profile?.balance ?? 0}
        min={game.minBet}
        max={game.maxBet}
        disabled={isLoading || dealing || !!token}
        onPlay={deal}
        playLabel={token ? "Choose cards to hold" : "Deal"}
        playDisabled={!!token}
      >
        <div className="space-y-0.5 rounded-xl border border-peak-border bg-peak-surface px-3 py-2 text-[11px] text-peak-gray">
          {paytable.map(([label, mult]) => (
            <div key={label} className="flex justify-between">
              <span>{label}</span>
              <span className="font-semibold text-peak-gold">{mult}x</span>
            </div>
          ))}
        </div>
      </BetPanel>

      <div className="flex min-h-[340px] flex-col items-center justify-center gap-6">
        <div className="flex gap-2">
          {(displayHand ?? ["?", "?", "?", "?", "?"]).map((c, i) => (
            <motion.button
              key={i}
              disabled={!token}
              onClick={() => toggleHold(i)}
              animate={{ y: token && holds[i] ? -10 : 0 }}
              className={cn(
                "flex h-24 w-16 items-center justify-center rounded-xl border-2 text-lg font-bold cursor-pointer disabled:cursor-default",
                token && holds[i] ? "border-peak-gold bg-peak-gold/10 text-peak-gold glow-gold" : "border-peak-border bg-peak-surface-2 text-white"
              )}
            >
              {c}
            </motion.button>
          ))}
        </div>

        {token && (
          <>
            <p className="text-xs text-peak-gray">Tap cards to hold, then draw the rest</p>
            <Button size="lg" onClick={draw} disabled={isLoading}>
              Draw
            </Button>
          </>
        )}

        {lastResult && showResult && <p className="text-sm font-semibold text-white">{lastResult.result.handLabel}</p>}

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
