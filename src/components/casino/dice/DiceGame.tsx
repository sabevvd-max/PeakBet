"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { formatMultiplier } from "@/lib/utils";
import type { DiceResult } from "@/lib/games/resolvers/dice";

export function DiceGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<DiceResult>();
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50);
  const [direction, setDirection] = useState<"over" | "under">("under");
  const [showResult, setShowResult] = useState(false);

  const winChance = direction === "under" ? target : 100 - target;
  const multiplier = Math.round((99 / winChance) * 10000) / 10000;

  async function play() {
    setShowResult(false);
    const outcome = await request("/api/games/play/dice", { betAmount, payload: { target, direction } });
    if (outcome) setShowResult(true);
  }

  const roll = lastResult?.result.roll;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={game.minBet} max={game.maxBet} disabled={isLoading} onPlay={play}>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setDirection("under")}
            className={`rounded-xl border py-2.5 text-sm font-semibold cursor-pointer ${direction === "under" ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray"}`}
          >
            Roll Under
          </button>
          <button
            onClick={() => setDirection("over")}
            className={`rounded-xl border py-2.5 text-sm font-semibold cursor-pointer ${direction === "over" ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray"}`}
          >
            Roll Over
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-peak-gray">
            <span>Target: {target}</span>
            <span>Win Chance: {winChance}%</span>
          </div>
          <input
            type="range"
            min={2}
            max={98}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full accent-peak-gold"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-peak-border bg-peak-surface px-3 py-2 text-sm">
          <span className="text-peak-gray">Payout</span>
          <span className="font-semibold text-peak-gold">{formatMultiplier(multiplier)}</span>
        </div>
      </BetPanel>

      <div className="relative flex min-h-[300px] flex-col items-center justify-center">
        <div className="relative h-20 w-full max-w-lg rounded-xl bg-peak-surface-2">
          <div
            className="absolute inset-y-0 rounded-l-xl bg-peak-red/30"
            style={{ width: direction === "under" ? `${target}%` : "0%", left: 0 }}
          />
          <div
            className="absolute inset-y-0 rounded-r-xl bg-peak-neon/20"
            style={{ width: direction === "over" ? `${100 - target}%` : "0%", right: 0 }}
          />
          <div className="absolute inset-y-0 w-0.5 bg-peak-gold" style={{ left: `${target}%` }} />
          {roll !== undefined && (
            <motion.div
              key={roll}
              initial={{ left: "50%", opacity: 0 }}
              animate={{ left: `${roll}%`, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute -top-3 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[10px] font-bold text-peak-black shadow-lg"
            >
              {roll.toFixed(0)}
            </motion.div>
          )}
        </div>
        <div className="mt-4 flex w-full max-w-lg justify-between text-xs text-peak-gray-dim">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>

        {lastResult && (
          <p className="mt-6 text-sm text-peak-gray">
            Rolled <span className="font-semibold text-white">{roll?.toFixed(2)}</span>
          </p>
        )}

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
