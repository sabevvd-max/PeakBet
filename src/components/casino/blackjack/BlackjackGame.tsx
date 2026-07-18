"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { BetPanel } from "@/components/games/BetPanel";
import { Button } from "@/components/ui/Button";
import { GameMeta } from "@/lib/games/types";
import { cn } from "@/lib/utils";

const OUTCOME_LABEL: Record<string, string> = {
  "player-blackjack": "Blackjack! You win 3:2",
  "dealer-blackjack": "Dealer has Blackjack",
  push: "Push — bet returned",
  "player-bust": "Bust! You lose",
  "dealer-bust": "Dealer busts — you win!",
  "player-win": "You win!",
  "dealer-win": "Dealer wins",
};

export function BlackjackGame({ game }: { game: GameMeta }) {
  const { profile, setBalance } = useAuth();
  const { play } = useSound();
  const { fireWin } = useConfetti();

  const [betAmount, setBetAmount] = useState(10);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [player, setPlayer] = useState<string[]>([]);
  const [dealer, setDealer] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canDouble, setCanDouble] = useState(false);

  async function call(url: string, body: object) {
    setLoading(true);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return null;
    }
    return data;
  }

  async function deal() {
    const data = await call("/api/games/blackjack/start", { betAmount });
    if (!data) return;
    play("cardFlip");
    setSessionId(data.sessionId ?? null);
    setPlayer(data.player);
    setFinished(!!data.finished);
    setCanDouble(!data.finished);

    if (data.finished) {
      setDealer(data.dealer);
      setOutcome(data.outcome);
      setBalance(data.settlement.balance);
      if (data.settlement.isWin) {
        play("bigWin");
        fireWin();
      } else {
        play("lose");
      }
    } else {
      setDealer([data.dealerUpCard, "❓"]);
      setOutcome(null);
      setBalance(data.balance);
    }
  }

  function applyFinish(data: { player: string[]; dealer: string[]; outcome: string; settlement: { balance: number; isWin: boolean } }) {
    setPlayer(data.player);
    setDealer(data.dealer);
    setOutcome(data.outcome);
    setFinished(true);
    setBalance(data.settlement.balance);
    if (data.settlement.isWin) {
      play("bigWin");
      fireWin();
    } else {
      play("lose");
    }
  }

  async function hit() {
    if (!sessionId) return;
    const data = await call("/api/games/blackjack/hit", { sessionId });
    if (!data) return;
    play("cardFlip");
    setCanDouble(false);
    if (data.finished) applyFinish(data);
    else setPlayer(data.player);
  }

  async function stand() {
    if (!sessionId) return;
    const data = await call("/api/games/blackjack/stand", { sessionId });
    if (!data) return;
    applyFinish(data);
  }

  async function double() {
    if (!sessionId) return;
    const data = await call("/api/games/blackjack/double", { sessionId });
    if (!data) return;
    applyFinish(data);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel
        betAmount={betAmount}
        onChange={setBetAmount}
        balance={profile?.balance ?? 0}
        min={game.minBet}
        max={game.maxBet}
        disabled={loading || (!!sessionId && !finished)}
        onPlay={deal}
        playLabel="Deal"
        playDisabled={!!sessionId && !finished}
      >
        <p className="text-xs text-peak-gray">Blackjack pays 3:2 · dealer stands on 17</p>
        {sessionId && !finished && (
          <div className="flex gap-2">
            <Button variant="neon" className="flex-1" onClick={hit} disabled={loading}>
              Hit
            </Button>
            <Button variant="secondary" className="flex-1" onClick={stand} disabled={loading}>
              Stand
            </Button>
          </div>
        )}
        {sessionId && !finished && canDouble && (
          <Button variant="outline" onClick={double} disabled={loading || (profile?.balance ?? 0) < betAmount}>
            Double Down
          </Button>
        )}
      </BetPanel>

      <div className="flex min-h-[380px] flex-col items-center justify-center gap-8">
        <HandRow title="Dealer" cards={dealer} />
        <HandRow title="You" cards={player} />

        {outcome && (
          <p className={cn("text-lg font-semibold", outcome.includes("player") || outcome === "dealer-bust" ? "text-peak-neon" : outcome === "push" ? "text-peak-gray" : "text-peak-red")}>
            {OUTCOME_LABEL[outcome] ?? outcome}
          </p>
        )}
      </div>
    </div>
  );
}

function HandRow({ title, cards }: { title: string; cards: string[] }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm font-semibold text-peak-gray">{title}</span>
      <div className="flex gap-2">
        {cards.length === 0
          ? Array.from({ length: 2 }, (_, i) => <CardBox key={i} label="?" />)
          : cards.map((c, i) => <CardBox key={i} label={c} />)}
      </div>
    </div>
  );
}

function CardBox({ label }: { label: string }) {
  return (
    <div className="flex h-20 w-14 items-center justify-center rounded-xl border border-peak-border bg-peak-surface-2 text-base font-bold text-white">
      {label}
    </div>
  );
}
