"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { cn } from "@/lib/utils";

export function KenoGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ picks: number[]; draw: number[]; matches: number[] }>();
  const [betAmount, setBetAmount] = useState(10);
  const [picks, setPicks] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  function toggle(n: number) {
    if (picks.includes(n)) setPicks(picks.filter((p) => p !== n));
    else if (picks.length < 10) setPicks([...picks, n]);
  }

  async function play() {
    setShowResult(false);
    const outcome = await request("/api/games/play/keno", { betAmount, payload: { picks } });
    if (outcome) setShowResult(true);
  }

  const draw = lastResult?.result.draw ?? [];
  const matches = lastResult?.result.matches ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel
        betAmount={betAmount}
        onChange={setBetAmount}
        balance={profile?.balance ?? 0}
        min={game.minBet}
        max={game.maxBet}
        disabled={isLoading}
        onPlay={play}
        playDisabled={picks.length === 0}
      >
        <p className="text-xs text-peak-gray">Pick 1-10 numbers ({picks.length}/10 selected)</p>
        <button
          onClick={() => setPicks([])}
          className="rounded-lg border border-peak-border py-1.5 text-xs text-peak-gray hover:text-white cursor-pointer"
        >
          Clear Selection
        </button>
      </BetPanel>

      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => {
            const picked = picks.includes(n);
            const drawn = draw.includes(n);
            const matched = matches.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                  matched
                    ? "border-peak-neon bg-peak-neon/20 text-peak-neon glow-neon"
                    : drawn
                      ? "border-peak-gold bg-peak-gold/10 text-peak-gold"
                      : picked
                        ? "border-peak-gold/60 bg-peak-gold/5 text-white"
                        : "border-peak-border text-peak-gray hover:border-peak-gold/30"
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
        {lastResult && (
          <p className="mt-4 text-sm text-peak-gray">
            {matches.length} match{matches.length === 1 ? "" : "es"}
          </p>
        )}
        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
