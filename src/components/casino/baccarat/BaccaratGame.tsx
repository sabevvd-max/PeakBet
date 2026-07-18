"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { cn } from "@/lib/utils";

type Bet = "player" | "banker" | "tie";

export function BaccaratGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ player: string[]; banker: string[]; playerTotal: number; bankerTotal: number; winner: Bet }>();
  const [betAmount, setBetAmount] = useState(10);
  const [bet, setBet] = useState<Bet>("player");
  const [showResult, setShowResult] = useState(false);

  async function play() {
    setShowResult(false);
    const outcome = await request("/api/games/play/baccarat", { betAmount, payload: { bet } });
    if (outcome) setShowResult(true);
  }

  const r = lastResult?.result;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={game.minBet} max={game.maxBet} disabled={isLoading} onPlay={play}>
        <div className="grid grid-cols-3 gap-1.5">
          {(["player", "banker", "tie"] as Bet[]).map((b) => (
            <button
              key={b}
              onClick={() => setBet(b)}
              className={cn(
                "rounded-lg border py-2 text-xs font-semibold capitalize cursor-pointer",
                bet === b ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray"
              )}
            >
              {b} {b === "tie" ? "9x" : b === "banker" ? "1.95x" : "2x"}
            </button>
          ))}
        </div>
      </BetPanel>

      <div className="flex min-h-[300px] flex-col items-center justify-center gap-8">
        <Hand title="Player" cards={r?.player} total={r?.playerTotal} highlight={r?.winner === "player"} />
        <Hand title="Banker" cards={r?.banker} total={r?.bankerTotal} highlight={r?.winner === "banker"} />
        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}

function Hand({ title, cards, total, highlight }: { title: string; cards?: string[]; total?: number; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("w-16 text-sm font-semibold", highlight ? "text-peak-gold" : "text-peak-gray")}>{title}</span>
      <div className="flex gap-2">
        {(cards ?? ["?", "?"]).map((c, i) => (
          <div key={i} className="flex h-16 w-12 items-center justify-center rounded-lg border border-peak-border bg-peak-surface-2 text-sm font-bold text-white">
            {c}
          </div>
        ))}
      </div>
      {total !== undefined && <span className="text-lg font-bold text-white">{total}</span>}
    </div>
  );
}
