"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";

export function NumberGuessGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ guess: number; draw: number; diff: number }>();
  const [betAmount, setBetAmount] = useState(10);
  const [guess, setGuess] = useState(50);
  const [showResult, setShowResult] = useState(false);

  async function play() {
    setShowResult(false);
    const outcome = await request("/api/games/play/number-guess", { betAmount, payload: { guess } });
    if (outcome) setShowResult(true);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={game.minBet} max={game.maxBet} disabled={isLoading} onPlay={play}>
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-peak-gray">
            <span>Your Guess</span>
            <span className="font-semibold text-peak-gold">{guess}</span>
          </div>
          <input type="range" min={1} max={100} value={guess} onChange={(e) => setGuess(Number(e.target.value))} className="w-full accent-peak-gold" />
        </div>
        <div className="space-y-1 rounded-xl border border-peak-border bg-peak-surface px-3 py-2 text-xs text-peak-gray">
          <p>Exact match: 48x</p>
          <p>Within 2: 5x · Within 5: 2x · Within 10: 1.2x</p>
        </div>
      </BetPanel>

      <div className="flex min-h-[300px] flex-col items-center justify-center gap-6">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-peak-gold bg-peak-surface-2 font-display text-4xl font-bold text-white glow-gold">
          {lastResult ? lastResult.result.draw : "?"}
        </div>
        {lastResult && (
          <p className="text-sm text-peak-gray">
            You guessed <span className="font-semibold text-white">{lastResult.result.guess}</span> — off by {lastResult.result.diff}
          </p>
        )}
        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
