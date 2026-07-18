"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { Input } from "@/components/ui/Input";
import { formatMultiplier } from "@/lib/utils";

export function LimboGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ crashPoint: number; targetMultiplier: number }>();
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(2);
  const [showResult, setShowResult] = useState(false);

  async function play() {
    setShowResult(false);
    const outcome = await request("/api/games/play/limbo", { betAmount, payload: { targetMultiplier: target } });
    if (outcome) setShowResult(true);
  }

  const crashPoint = lastResult?.result.crashPoint;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={game.minBet} max={game.maxBet} disabled={isLoading} onPlay={play}>
        <Input
          label="Target Multiplier"
          type="number"
          min={1.01}
          step={0.01}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
        />
        <div className="flex items-center justify-between rounded-xl border border-peak-border bg-peak-surface px-3 py-2 text-sm">
          <span className="text-peak-gray">Win Chance</span>
          <span className="font-semibold text-peak-gold">{(99 / target).toFixed(2)}%</span>
        </div>
      </BetPanel>

      <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {crashPoint !== undefined ? (
            <motion.p
              key={crashPoint}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`font-display text-6xl font-bold ${lastResult?.isWin ? "text-gradient-neon" : "text-peak-red"}`}
            >
              {formatMultiplier(crashPoint)}
            </motion.p>
          ) : (
            <p className="font-display text-6xl font-bold text-peak-gray-dim">?.??x</p>
          )}
        </AnimatePresence>
        <p className="mt-3 text-sm text-peak-gray">Target: {formatMultiplier(target)}</p>

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
