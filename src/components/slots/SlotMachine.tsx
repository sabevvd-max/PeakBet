"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { BetPanel } from "@/components/games/BetPanel";
import { SlotConfig, SpinGrid, SpinResult } from "@/lib/games/slots";
import { PAYLINES, ROWS } from "@/lib/games/slots/paylines";
import { cn, formatCoins } from "@/lib/utils";

const WIN_TIER_LABEL: Record<string, string> = {
  win: "Nice Win!",
  big: "Big Win!",
  mega: "Mega Win!!",
  ultra: "ULTRA WIN!!!",
};

export function SlotMachine({ config }: { config: SlotConfig }) {
  const { profile, setBalance } = useAuth();
  const { play } = useSound();
  const { fireWin, fireBigWin, fireUltraWin } = useConfetti();

  const [betAmount, setBetAmount] = useState(2);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [activeLines, setActiveLines] = useState<SpinGrid["winningLines"]>([]);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [inFreeSpins, setInFreeSpins] = useState(false);
  const [totalWin, setTotalWin] = useState(0);
  const [winTier, setWinTier] = useState<string | null>(null);

  const symbolIcon = (id: string) => {
    if (id === config.wild.id) return config.wild.icon;
    if (id === config.scatter.id) return config.scatter.icon;
    return config.symbols.find((s) => s.id === id)?.icon ?? "❔";
  };

  async function playAllGrids(grids: SpinGrid[], freeSpinsAwarded: number) {
    let accumulated = 0;

    for (let i = 0; i < grids.length; i++) {
      const g = grids[i];
      setInFreeSpins(true);
      setFreeSpinsLeft(freeSpinsAwarded - i - 1);
      setGrid(g.cells);
      setActiveLines([]);
      play("spin");
      await sleep(500);
      setActiveLines(g.winningLines);
      accumulated += g.spinPayout;
      setTotalWin(accumulated);
      if (g.spinPayout > 0) play("coin");
      await sleep(900);
    }
    setInFreeSpins(false);
  }

  async function spin() {
    setSpinning(true);
    setActiveLines([]);
    setWinTier(null);
    setTotalWin(0);
    play("spin");

    try {
      const res = await fetch(`/api/games/slots/${config.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        setSpinning(false);
        return;
      }

      const outcome = data.outcome as { balance: number; result: SpinResult };
      const spin = outcome.result;

      await sleep(600);
      setGrid(spin.mainGrid.cells);
      setActiveLines(spin.mainGrid.winningLines);
      setTotalWin(spin.mainGrid.spinPayout);

      if (spin.mainGrid.spinPayout > 0) play("coin");

      if (spin.freeSpinGrids.length > 0) {
        await sleep(900);
        toast.success(`${spin.freeSpinsAwarded} Free Spins!`, { icon: "🎁" });
        await playAllGrids(spin.freeSpinGrids, spin.freeSpinsAwarded);
      }

      setTotalWin(spin.totalPayout);
      setBalance(outcome.balance);

      if (spin.winTier !== "none") {
        setWinTier(spin.winTier);
        play(spin.winTier === "win" ? "win" : "bigWin");
        if (spin.winTier === "win" || spin.winTier === "big") fireWin();
        if (spin.winTier === "mega") fireBigWin();
        if (spin.winTier === "ultra") fireUltraWin();
      } else {
        play("lose");
      }
    } finally {
      setSpinning(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={config.minBet} max={config.maxBet} disabled={spinning} onPlay={spin} playLabel={spinning ? "Spinning..." : "Spin"} playDisabled={spinning}>
        <div className="rounded-xl border border-peak-border bg-peak-surface px-3 py-2 text-xs text-peak-gray">
          <p>20 fixed paylines · RTP {config.rtp}%</p>
          <p className="mt-1">
            Wild {config.wild.icon} substitutes all · Scatter {config.scatter.icon} triggers {config.freeSpinsAwarded} free spins
          </p>
        </div>
      </BetPanel>

      <div className="relative flex min-h-[420px] flex-col items-center justify-center gap-4">
        {inFreeSpins && (
          <div className="absolute top-0 rounded-full border border-peak-gold/40 bg-peak-gold/10 px-4 py-1 text-xs font-semibold text-peak-gold">
            Free Spins Remaining: {freeSpinsLeft}
          </div>
        )}

        <div
          className="relative grid grid-cols-5 gap-1.5 rounded-2xl border p-3"
          style={{ borderColor: `${config.gradient[0]}55`, background: `linear-gradient(160deg, ${config.gradient[0]}12, ${config.gradient[1]}12)` }}
        >
          {Array.from({ length: 5 }, (_, reel) => (
            <div key={reel} className="flex flex-col gap-1.5">
              {Array.from({ length: ROWS }, (_, row) => {
                const symbolId = grid?.[reel]?.[row];
                const isWinning = activeLines.some((line) => PAYLINES[line.line][reel] === row && line.length > reel);
                return (
                  <motion.div
                    key={row}
                    animate={spinning ? { y: [0, -6, 0] } : {}}
                    transition={{ repeat: spinning ? Infinity : 0, duration: 0.15, delay: reel * 0.05 }}
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-xl border text-3xl sm:h-20 sm:w-20",
                      isWinning ? "border-peak-gold bg-peak-gold/15 glow-gold" : "border-peak-border bg-peak-black-soft"
                    )}
                  >
                    {symbolId ? symbolIcon(symbolId) : ""}
                  </motion.div>
                );
              })}
            </div>
          ))}

          <AnimatePresence>
            {winTier && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-peak-black/85 backdrop-blur-sm"
              >
                <p className="font-display text-3xl font-bold text-gradient-gold">{WIN_TIER_LABEL[winTier]}</p>
                <p className="mt-2 text-2xl font-bold text-white">{formatCoins(totalWin)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {totalWin > 0 && !winTier && (
          <p className="text-sm text-peak-gray">
            Win: <span className="font-semibold text-peak-gold">{formatCoins(totalWin)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
