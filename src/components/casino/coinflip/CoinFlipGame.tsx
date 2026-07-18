"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";

export function CoinFlipGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ outcome: "heads" | "tails"; choice: string }>();
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [flipping, setFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);

  async function play() {
    setShowResult(false);
    setFlipping(true);
    const outcome = await request("/api/games/play/coinflip", { betAmount, payload: { choice } });
    setTimeout(() => {
      setFlipping(false);
      if (outcome) setShowResult(true);
    }, 700);
  }

  const result = lastResult?.result.outcome;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={game.minBet} max={game.maxBet} disabled={isLoading} onPlay={play}>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setChoice("heads")}
            className={`rounded-xl border py-2.5 text-sm font-semibold cursor-pointer ${choice === "heads" ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray"}`}
          >
            Heads
          </button>
          <button
            onClick={() => setChoice("tails")}
            className={`rounded-xl border py-2.5 text-sm font-semibold cursor-pointer ${choice === "tails" ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray"}`}
          >
            Tails
          </button>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-peak-border bg-peak-surface px-3 py-2 text-sm">
          <span className="text-peak-gray">Payout</span>
          <span className="font-semibold text-peak-gold">1.96x</span>
        </div>
      </BetPanel>

      <div className="relative flex min-h-[300px] flex-col items-center justify-center">
        <motion.div
          animate={flipping ? { rotateY: [0, 1080] } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-peak-gold bg-gradient-to-br from-peak-gold-soft to-peak-gold-dim text-4xl font-bold text-peak-black shadow-2xl glow-gold"
        >
          {!flipping && result ? (result === "heads" ? "H" : "T") : "🪙"}
        </motion.div>
        {result && !flipping && <p className="mt-4 text-sm capitalize text-peak-gray">Landed on {result}</p>}
        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
