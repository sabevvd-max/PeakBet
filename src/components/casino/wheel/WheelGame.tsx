"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { wheelSegments, WheelRisk } from "@/lib/games/resolvers/wheel";
import { cn } from "@/lib/utils";

export function WheelGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ segmentIndex: number; multiplier: number }>();
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState<WheelRisk>("medium");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const segments = wheelSegments(risk);
  const segAngle = 360 / segments.length;

  async function play() {
    setShowResult(false);
    setSpinning(true);
    const outcome = await request("/api/games/play/wheel", { betAmount, payload: { risk } });
    if (outcome) {
      const idx = outcome.result.segmentIndex;
      const targetAngle = 360 * 5 + (360 - idx * segAngle - segAngle / 2);
      setRotation((r) => r - (r % 360) + targetAngle);
      setTimeout(() => {
        setSpinning(false);
        setShowResult(true);
      }, 3200);
    } else {
      setSpinning(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={game.minBet} max={game.maxBet} disabled={isLoading || spinning} onPlay={play}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-peak-gray">Risk</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["low", "medium", "high"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={cn(
                  "rounded-lg border py-2 text-xs font-semibold capitalize cursor-pointer",
                  risk === r ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </BetPanel>

      <div className="relative flex min-h-[400px] flex-col items-center justify-center">
        <div className="relative h-72 w-72">
          <div className="absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1 rotate-180 border-x-8 border-t-[16px] border-x-transparent border-t-peak-gold" />
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3.2, ease: [0.15, 0.6, 0.2, 1] }}
            className="relative h-full w-full overflow-hidden rounded-full border-4 border-peak-gold glow-gold"
            style={{
              background: `conic-gradient(${segments
                .map((s, i) => {
                  const color = s.multiplier === 0 ? "#26262b" : i % 2 === 0 ? "#ffd700" : "#8a7218";
                  return `${color} ${i * segAngle}deg ${(i + 1) * segAngle}deg`;
                })
                .join(",")})`,
            }}
          >
            {segments.map((s, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 text-xs font-bold text-peak-black"
                style={{
                  transform: `rotate(${i * segAngle + segAngle / 2}deg) translate(0, -100px) rotate(90deg)`,
                }}
              >
                {s.multiplier}x
              </span>
            ))}
          </motion.div>
        </div>

        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
