"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { BetPanel } from "@/components/games/BetPanel";
import { Button } from "@/components/ui/Button";
import { GameMeta } from "@/lib/games/types";
import { GRID_SIZE, minesMultiplier } from "@/lib/games/resolvers/mines";
import { cn, formatCoins, formatMultiplier } from "@/lib/utils";

export function MinesGame({ game }: { game: GameMeta }) {
  const { profile, setBalance } = useAuth();
  const { play } = useSound();
  const { fireWin, fireBigWin } = useConfetti();

  const [betAmount, setBetAmount] = useState(10);
  const [minesCount, setMinesCount] = useState(5);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [mines, setMines] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [multiplier, setMultiplier] = useState(1);

  async function start() {
    setLoading(true);
    const res = await fetch("/api/games/mines/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ betAmount, minesCount }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Could not start");

    setSessionId(data.sessionId);
    setRevealed([]);
    setMines([]);
    setMultiplier(1);
    setStatus("playing");
    setBalance(data.balance);
    play("bet");
  }

  async function reveal(cellIndex: number) {
    if (!sessionId || loading) return;
    setLoading(true);
    const res = await fetch("/api/games/mines/reveal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, cellIndex }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Something went wrong");

    if (data.hitMine) {
      setMines(data.minePositions);
      setRevealed((r) => [...r, cellIndex]);
      setStatus("lost");
      setBalance(data.balance);
      play("lose");
      setSessionId(null);
    } else {
      setRevealed(data.revealed);
      setMultiplier(data.multiplier);
      play("cardFlip");
    }
  }

  async function cashout() {
    if (!sessionId) return;
    setLoading(true);
    const res = await fetch("/api/games/mines/cashout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Something went wrong");

    setStatus("won");
    setBalance(data.settlement.balance);
    setSessionId(null);
    play("bigWin");
    if (data.settlement.balance) fireWin();
    if (multiplier >= 5) fireBigWin();
  }

  const potentialPayout = betAmount * multiplier;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel
        betAmount={betAmount}
        onChange={setBetAmount}
        balance={profile?.balance ?? 0}
        min={game.minBet}
        max={game.maxBet}
        disabled={loading || status === "playing"}
        onPlay={start}
        playLabel="Start Round"
        playDisabled={status === "playing"}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-peak-gray">Mines: {minesCount}</label>
          <input
            type="range"
            min={1}
            max={24}
            value={minesCount}
            disabled={status === "playing"}
            onChange={(e) => setMinesCount(Number(e.target.value))}
            className="w-full accent-peak-gold"
          />
        </div>
        {status === "playing" && (
          <div className="flex items-center justify-between rounded-xl border border-peak-border bg-peak-surface px-3 py-2 text-sm">
            <span className="text-peak-gray">Cash Out</span>
            <span className="font-semibold text-peak-gold">
              {formatCoins(potentialPayout)} ({formatMultiplier(multiplier)})
            </span>
          </div>
        )}
        {status === "playing" && (
          <Button variant="neon" size="lg" onClick={cashout} disabled={loading || revealed.length === 0}>
            Cash Out
          </Button>
        )}
      </BetPanel>

      <div className="flex min-h-[380px] flex-col items-center justify-center">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: GRID_SIZE }, (_, i) => {
            const isRevealed = revealed.includes(i);
            const isMine = mines.includes(i);
            const showMine = status === "lost" && isMine;
            return (
              <motion.button
                key={i}
                disabled={status !== "playing" || isRevealed}
                onClick={() => reveal(i)}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl border text-xl font-bold transition-colors cursor-pointer disabled:cursor-default sm:h-16 sm:w-16",
                  showMine
                    ? "border-peak-red bg-peak-red/20"
                    : isRevealed
                      ? "border-peak-neon bg-peak-neon/10"
                      : "border-peak-border bg-peak-surface-2 hover:border-peak-gold/40"
                )}
              >
                {showMine ? "💣" : isRevealed ? "💎" : ""}
              </motion.button>
            );
          })}
        </div>

        {status === "lost" && <p className="mt-6 text-sm font-semibold text-peak-red">Boom! Better luck next round.</p>}
        {status === "won" && <p className="mt-6 text-sm font-semibold text-peak-neon">Cashed out {formatCoins(potentialPayout)}!</p>}
      </div>
    </div>
  );
}
