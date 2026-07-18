"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { WinBanner } from "@/components/games/WinBanner";
import { Button } from "@/components/ui/Button";
import { GameMeta } from "@/lib/games/types";
import { RouletteBet, RouletteBetType } from "@/lib/games/resolvers/roulette";
import { cn, formatCoins } from "@/lib/utils";

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const CHIPS = [5, 25, 100, 500];

export function RouletteGame({ game }: { game: GameMeta }) {
  const american = game.slug === "american-roulette";
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ winningNumber: number; pocketColor: string; results: unknown[] }>();
  const [chip, setChip] = useState(5);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const numbers = useMemo(() => {
    const arr = Array.from({ length: 37 }, (_, i) => i);
    return american ? [...arr, -1] : arr;
  }, [american]);

  const totalStaked = Object.values(bets).reduce((a, b) => a + b, 0);

  function addBet(key: string) {
    setBets((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + chip }));
  }

  function clearBets() {
    setBets({});
  }

  function betsPayload(): RouletteBet[] {
    return Object.entries(bets).map(([key, amount]) => {
      if (key.startsWith("n:")) {
        return { type: "straight" as RouletteBetType, numbers: [Number(key.slice(2))], amount };
      }
      return { type: key as RouletteBetType, amount };
    });
  }

  async function spin() {
    if (totalStaked === 0) return;
    setShowResult(false);
    const outcome = await request(`/api/games/play/${game.slug}`, { betAmount: totalStaked, payload: { bets: betsPayload() } });
    if (outcome) {
      setShowResult(true);
      setBets({});
    }
  }

  const winningNumber = lastResult?.result.winningNumber;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-peak-gray">Chip Value</p>
          <div className="grid grid-cols-4 gap-1.5">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setChip(c)}
                className={cn(
                  "rounded-lg border py-2 text-xs font-bold cursor-pointer",
                  chip === c ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-peak-border bg-peak-surface px-3 py-2 text-sm">
          <div className="flex justify-between text-peak-gray">
            <span>Total Staked</span>
            <span className="font-semibold text-peak-gold">{formatCoins(totalStaked)}</span>
          </div>
          <div className="flex justify-between text-peak-gray">
            <span>Balance</span>
            <span>{formatCoins(profile?.balance ?? 0)}</span>
          </div>
        </div>

        <Button variant="secondary" onClick={clearBets} disabled={isLoading}>
          Clear Bets
        </Button>
        <Button size="lg" onClick={spin} disabled={isLoading || totalStaked === 0 || totalStaked > (profile?.balance ?? 0)}>
          {totalStaked > (profile?.balance ?? 0) ? "Insufficient Balance" : "Spin"}
        </Button>
      </div>

      <div className="flex min-h-[420px] flex-col gap-4">
        {winningNumber !== undefined && showResult && (
          <div className="flex items-center justify-center">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full border-2 font-display text-xl font-bold",
                winningNumber === 0 || winningNumber === -1
                  ? "border-peak-neon text-peak-neon"
                  : RED_NUMBERS.has(winningNumber)
                    ? "border-peak-red text-peak-red"
                    : "border-white text-white"
              )}
            >
              {winningNumber === -1 ? "00" : winningNumber}
            </div>
          </div>
        )}

        <div className="grid grid-cols-9 gap-1">
          {numbers
            .filter((n) => n !== 0 && n !== -1)
            .map((n) => (
              <NumberCell key={n} n={n} bet={bets[`n:${n}`]} onClick={() => addBet(`n:${n}`)} red={RED_NUMBERS.has(n)} />
            ))}
          <NumberCell n={0} label="0" bet={bets["n:0"]} onClick={() => addBet("n:0")} green />
          {american && <NumberCell n={-1} label="00" bet={bets["n:-1"]} onClick={() => addBet("n:-1")} green />}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <OutsideBet label="1st Dozen" k="dozen1" bets={bets} onClick={addBet} />
          <OutsideBet label="2nd Dozen" k="dozen2" bets={bets} onClick={addBet} />
          <OutsideBet label="3rd Dozen" k="dozen3" bets={bets} onClick={addBet} />
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          <OutsideBet label="1-18" k="low" bets={bets} onClick={addBet} />
          <OutsideBet label="Even" k="even" bets={bets} onClick={addBet} />
          <OutsideBet label="Red" k="red" bets={bets} onClick={addBet} red />
          <OutsideBet label="Black" k="black" bets={bets} onClick={addBet} />
          <OutsideBet label="Odd" k="odd" bets={bets} onClick={addBet} />
          <OutsideBet label="19-36" k="high" bets={bets} onClick={addBet} />
        </div>

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}

function NumberCell({ n, label, bet, onClick, red, green }: { n: number; label?: string; bet?: number; onClick: () => void; red?: boolean; green?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex h-9 items-center justify-center rounded-md border text-xs font-semibold cursor-pointer",
        green ? "border-peak-neon/50 bg-peak-neon/10 text-peak-neon" : red ? "border-peak-red/40 bg-peak-red/10 text-peak-red" : "border-peak-border bg-peak-surface-2 text-white",
        bet && "ring-2 ring-peak-gold"
      )}
    >
      {label ?? n}
      {bet && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-peak-gold px-1 text-[9px] font-bold text-peak-black">{bet}</span>}
    </button>
  );
}

function OutsideBet({ label, k, bets, onClick, red }: { label: string; k: string; bets: Record<string, number>; onClick: (k: string) => void; red?: boolean }) {
  const bet = bets[k];
  return (
    <button
      onClick={() => onClick(k)}
      className={cn(
        "relative rounded-lg border py-2 text-xs font-semibold cursor-pointer",
        red ? "border-peak-red/40 bg-peak-red/10 text-peak-red" : "border-peak-border bg-peak-surface-2 text-white",
        bet && "ring-2 ring-peak-gold"
      )}
    >
      {label}
      {bet && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-peak-gold px-1 text-[9px] font-bold text-peak-black">{bet}</span>}
    </button>
  );
}
