"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { cn } from "@/lib/utils";

interface HoldemResult {
  playerHole: string[];
  botHole: string[];
  community: string[];
  playerHand: string;
  botHand: string;
  winner: "player" | "bot" | "push";
}

export function TexasHoldemGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<HoldemResult>();
  const [betAmount, setBetAmount] = useState(10);
  const [showResult, setShowResult] = useState(false);

  async function play() {
    setShowResult(false);
    const outcome = await request("/api/games/play/texas-holdem", { betAmount, payload: {} });
    if (outcome) setShowResult(true);
  }

  const r = lastResult?.result;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={game.minBet} max={game.maxBet} disabled={isLoading} onPlay={play} playLabel="Deal & Showdown">
        <p className="text-xs text-peak-gray">Heads-up vs the PeakBet dealer bot. Win pays 2x, push refunds.</p>
      </BetPanel>

      <div className="flex min-h-[380px] flex-col items-center justify-center gap-6">
        <PlayerRow title="PeakBet Dealer" cards={r?.botHole} label={r?.botHand} highlight={r?.winner === "bot"} />

        <div>
          <p className="mb-2 text-center text-xs text-peak-gray">Community Cards</p>
          <div className="flex gap-2">
            {(r?.community ?? Array(5).fill("?")).map((c, i) => (
              <CardBox key={i} label={c} />
            ))}
          </div>
        </div>

        <PlayerRow title="You" cards={r?.playerHole} label={r?.playerHand} highlight={r?.winner === "player"} />

        {r && (
          <p className={cn("text-sm font-semibold", r.winner === "player" ? "text-peak-neon" : r.winner === "push" ? "text-peak-gray" : "text-peak-red")}>
            {r.winner === "player" ? "You win the showdown!" : r.winner === "push" ? "Push — hands tied" : "Dealer wins the showdown"}
          </p>
        )}

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}

function PlayerRow({ title, cards, label, highlight }: { title: string; cards?: string[]; label?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-right">
        <p className={cn("text-sm font-semibold", highlight ? "text-peak-gold" : "text-white")}>{title}</p>
        {label && <p className="text-xs text-peak-gray">{label}</p>}
      </div>
      <div className="flex gap-2">
        {(cards ?? ["?", "?"]).map((c, i) => (
          <CardBox key={i} label={c} />
        ))}
      </div>
    </div>
  );
}

function CardBox({ label }: { label: string }) {
  return (
    <div className="flex h-16 w-11 items-center justify-center rounded-lg border border-peak-border bg-peak-surface-2 text-sm font-bold text-white">
      {label}
    </div>
  );
}
