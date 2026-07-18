"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "rock", icon: "✊" },
  { key: "paper", icon: "✋" },
  { key: "scissors", icon: "✌️" },
] as const;

export function RockPaperScissorsGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ playerChoice: string; botChoice: string; outcome: "win" | "lose" | "tie" }>();
  const [betAmount, setBetAmount] = useState(10);
  const [showResult, setShowResult] = useState(false);

  async function play(choice: (typeof OPTIONS)[number]["key"]) {
    setShowResult(false);
    const outcome = await request("/api/games/play/rock-paper-scissors", { betAmount, payload: { choice } });
    if (outcome) setShowResult(true);
  }

  const iconFor = (choice?: string) => OPTIONS.find((o) => o.key === choice)?.icon ?? "❔";

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel
        betAmount={betAmount}
        onChange={setBetAmount}
        balance={profile?.balance ?? 0}
        min={game.minBet}
        max={game.maxBet}
        disabled={isLoading}
        onPlay={() => {}}
        playLabel="Choose your move below"
        playDisabled
      >
        <p className="text-xs text-peak-gray">Payout 1.96x win · push on tie</p>
      </BetPanel>

      <div className="flex min-h-[300px] flex-col items-center justify-center gap-8">
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <motion.div key={lastResult?.result.playerChoice} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-peak-surface-2 text-4xl">
              {iconFor(lastResult?.result.playerChoice)}
            </motion.div>
            <span className="text-xs text-peak-gray">You</span>
          </div>
          <span className="text-2xl text-peak-gray-dim">vs</span>
          <div className="flex flex-col items-center gap-2">
            <motion.div key={lastResult?.result.botChoice} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-peak-surface-2 text-4xl">
              {iconFor(lastResult?.result.botChoice)}
            </motion.div>
            <span className="text-xs text-peak-gray">PeakBet</span>
          </div>
        </div>

        <div className="flex gap-3">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              disabled={isLoading}
              onClick={() => play(o.key)}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl border border-peak-border bg-peak-surface text-3xl transition-all hover:border-peak-gold/50 hover:scale-105 disabled:opacity-40 cursor-pointer"
              )}
            >
              {o.icon}
            </button>
          ))}
        </div>

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
