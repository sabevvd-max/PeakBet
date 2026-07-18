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
import { LEVELS, DIFFICULTY_CONFIG, DragonDifficulty } from "@/lib/games/resolvers/dragon-tower";
import { cn, formatCoins, formatMultiplier } from "@/lib/utils";

export function DragonTowerGame({ game }: { game: GameMeta }) {
  const { profile, setBalance } = useAuth();
  const { play } = useSound();
  const { fireWin, fireBigWin } = useConfetti();

  const [betAmount, setBetAmount] = useState(10);
  const [difficulty, setDifficulty] = useState<DragonDifficulty>("medium");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [failedTile, setFailedTile] = useState<{ level: number; tile: number } | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");

  const tiles = DIFFICULTY_CONFIG[difficulty].tiles;

  async function start() {
    setLoading(true);
    const res = await fetch("/api/games/dragon-tower/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ betAmount, difficulty }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Could not start");

    setSessionId(data.sessionId);
    setCurrentLevel(0);
    setPicks([]);
    setFailedTile(null);
    setMultiplier(1);
    setStatus("playing");
    setBalance(data.balance);
    play("bet");
  }

  async function pick(tileIndex: number) {
    if (!sessionId || loading) return;
    setLoading(true);
    const res = await fetch("/api/games/dragon-tower/pick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, tileIndex }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Something went wrong");

    if (data.hitBad) {
      setFailedTile({ level: currentLevel, tile: tileIndex });
      setStatus("lost");
      setBalance(data.settlement.balance);
      setSessionId(null);
      play("lose");
      return;
    }

    setPicks((p) => [...p, tileIndex]);
    play("cardFlip");

    if (data.towerComplete) {
      setStatus("won");
      setMultiplier(data.multiplier);
      setBalance(data.settlement.balance);
      setSessionId(null);
      play("bigWin");
      fireBigWin();
      return;
    }

    setCurrentLevel(data.currentLevel);
    setMultiplier(data.multiplier);
  }

  async function cashout() {
    if (!sessionId) return;
    setLoading(true);
    const res = await fetch("/api/games/dragon-tower/cashout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Something went wrong");

    setStatus("won");
    setBalance(data.settlement.balance);
    setSessionId(null);
    play("bigWin");
    fireWin();
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
        playLabel="Start Climb"
        playDisabled={status === "playing"}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-peak-gray">Difficulty</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(DIFFICULTY_CONFIG) as DragonDifficulty[]).map((d) => (
              <button
                key={d}
                disabled={status === "playing"}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-lg border py-2 text-xs font-semibold capitalize cursor-pointer disabled:opacity-40",
                  difficulty === d ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray"
                )}
              >
                {d}
              </button>
            ))}
          </div>
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
          <Button variant="neon" size="lg" onClick={cashout} disabled={loading || currentLevel === 0}>
            Cash Out
          </Button>
        )}
      </BetPanel>

      <div className="flex min-h-[500px] flex-col-reverse items-center justify-center gap-2">
        {Array.from({ length: LEVELS }, (_, level) => {
          const isCurrent = status === "playing" && level === currentLevel;
          const isCleared = level < currentLevel;
          const isFailed = failedTile?.level === level;
          const isLocked = level > currentLevel;

          return (
            <div key={level} className="flex items-center gap-2">
              <span className="w-6 text-right text-[10px] text-peak-gray-dim">{level + 1}</span>
              {Array.from({ length: tiles }, (_, tileIndex) => {
                const wasPicked = isCleared && picks[level] === tileIndex;
                const failedHere = isFailed && failedTile?.tile === tileIndex;
                return (
                  <motion.button
                    key={tileIndex}
                    disabled={!isCurrent || loading}
                    onClick={() => pick(tileIndex)}
                    whileTap={isCurrent ? { scale: 0.9 } : undefined}
                    className={cn(
                      "flex h-10 w-14 items-center justify-center rounded-lg border text-sm font-bold cursor-pointer disabled:cursor-default",
                      failedHere
                        ? "border-peak-red bg-peak-red/20"
                        : wasPicked
                          ? "border-peak-neon bg-peak-neon/10"
                          : isCurrent
                            ? "border-peak-gold/50 bg-peak-surface-2 hover:border-peak-gold"
                            : isLocked
                              ? "border-peak-border bg-peak-surface opacity-40"
                              : "border-peak-border bg-peak-surface-2"
                    )}
                  >
                    {failedHere ? "🐉" : wasPicked ? "💎" : isCurrent ? "?" : ""}
                  </motion.button>
                );
              })}
            </div>
          );
        })}

        {status === "lost" && <p className="mt-4 text-sm font-semibold text-peak-red">The dragon got you!</p>}
        {status === "won" && <p className="mt-4 text-sm font-semibold text-peak-neon">Cashed out {formatCoins(potentialPayout)}!</p>}
      </div>
    </div>
  );
}
