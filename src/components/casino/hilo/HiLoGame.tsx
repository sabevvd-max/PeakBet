"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { Button } from "@/components/ui/Button";

export function HiLoGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ firstCard: string; secondCard: string; guess: string; outcome: string }>();
  const [betAmount, setBetAmount] = useState(10);
  const [dealing, setDealing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [firstCard, setFirstCard] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  async function deal() {
    setDealing(true);
    setShowResult(false);
    const res = await fetch("/api/games/hilo/start", { method: "POST" });
    const data = await res.json();
    setDealing(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not start round");
      return;
    }
    setToken(data.token);
    setFirstCard(data.firstCard);
  }

  async function guess(direction: "higher" | "lower") {
    if (!token) return;
    const outcome = await request("/api/games/hilo/guess", { betAmount, token, guess: direction });
    if (outcome) setShowResult(true);
    setToken(null);
  }

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
        playLabel={token ? "Round in progress..." : "Deal Card"}
        playDisabled={!!token}
      >
        <p className="text-xs text-peak-gray">Payout 1.92x · equal rank pushes</p>
      </BetPanel>

      <div className="flex min-h-[300px] flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-6">
          <Card label={firstCard ?? lastResult?.result.firstCard ?? null} />
          <span className="text-xl text-peak-gray-dim">vs</span>
          <Card label={showResult ? lastResult?.result.secondCard ?? null : null} back={!!token} />
        </div>

        {token && (
          <div className="flex gap-3">
            <Button variant="neon" size="lg" onClick={() => guess("higher")} disabled={isLoading}>
              Higher ▲
            </Button>
            <Button variant="danger" size="lg" onClick={() => guess("lower")} disabled={isLoading}>
              Lower ▼
            </Button>
          </div>
        )}

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}

function Card({ label, back }: { label: string | null; back?: boolean }) {
  return (
    <motion.div
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      className="flex h-32 w-24 items-center justify-center rounded-xl border-2 border-peak-gold bg-peak-surface-2 font-display text-2xl font-bold text-white glow-gold"
    >
      {back ? "❓" : (label ?? "?")}
    </motion.div>
  );
}
