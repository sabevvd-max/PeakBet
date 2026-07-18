"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { Button } from "@/components/ui/Button";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { Input } from "@/components/ui/Input";
import { formatMultiplier } from "@/lib/utils";

function curveMultiplier(elapsedMs: number): number {
  return Math.round((1 + Math.pow(elapsedMs / 1000, 1.55) * 0.14) * 100) / 100;
}

type Phase = "idle" | "running" | "won" | "busted";

export function CrashGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ crashPoint: number; cashoutMultiplier: number }>();
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(2);
  const [display, setDisplay] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [showResult, setShowResult] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const settledRef = useRef(false);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  async function settle(cashoutMultiplier: number) {
    if (settledRef.current) return;
    settledRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    setShowResult(false);
    const outcome = await request("/api/games/play/crash", { betAmount, payload: { cashoutMultiplier } });
    if (outcome) {
      const won = outcome.isWin;
      setPhase(won ? "won" : "busted");
      setDisplay(won ? cashoutMultiplier : outcome.result.crashPoint);
      setShowResult(true);
    } else {
      setPhase("idle");
    }
  }

  function start() {
    setShowResult(false);
    settledRef.current = false;
    setPhase("running");
    setDisplay(1);
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const mult = curveMultiplier(elapsed);
      setDisplay(mult);

      if (mult >= autoCashout) {
        settle(autoCashout);
        return;
      }
      if (elapsed > 25000) {
        settle(mult);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function cashOutNow() {
    settle(display);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel
        betAmount={betAmount}
        onChange={setBetAmount}
        balance={profile?.balance ?? 0}
        min={game.minBet}
        max={game.maxBet}
        disabled={isLoading || phase === "running"}
        onPlay={start}
        playLabel={phase === "running" ? "Round in progress..." : "Place Bet"}
        playDisabled={phase === "running"}
      >
        <Input
          label="Auto Cash Out At"
          type="number"
          min={1.01}
          step={0.1}
          value={autoCashout}
          onChange={(e) => setAutoCashout(Number(e.target.value))}
          disabled={phase === "running"}
        />
      </BetPanel>

      <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden">
        <motion.p
          animate={phase === "running" ? { scale: [1, 1.03, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className={`font-display text-6xl font-bold ${
            phase === "busted" ? "text-peak-red" : phase === "won" ? "text-gradient-neon" : "text-white"
          }`}
        >
          {formatMultiplier(display)}
        </motion.p>

        {phase === "busted" && <p className="mt-2 text-sm text-peak-red">Busted before your cashout</p>}
        {phase === "won" && <p className="mt-2 text-sm text-peak-neon">Cashed out!</p>}

        {phase === "running" && (
          <Button variant="neon" size="lg" className="mt-8" onClick={cashOutNow}>
            Cash Out at {formatMultiplier(display)}
          </Button>
        )}

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
