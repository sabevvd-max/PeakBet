"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { usePlayGame } from "@/hooks/usePlayGame";
import { BetPanel } from "@/components/games/BetPanel";
import { WinBanner } from "@/components/games/WinBanner";
import { GameMeta } from "@/lib/games/types";
import { plinkoMultipliers, PlinkoRisk } from "@/lib/games/resolvers/plinko";
import { cn } from "@/lib/utils";

export function PlinkoGame({ game }: { game: GameMeta }) {
  const { profile } = useAuth();
  const { request, isLoading, lastResult } = usePlayGame<{ path: number[]; bucket: number; multiplier: number }>();
  const [betAmount, setBetAmount] = useState(10);
  const [rows, setRows] = useState(12);
  const [risk, setRisk] = useState<PlinkoRisk>("medium");
  const [showResult, setShowResult] = useState(false);
  const [dropping, setDropping] = useState(false);

  const multipliers = plinkoMultipliers(rows, risk);

  async function play() {
    setShowResult(false);
    setDropping(true);
    const outcome = await request("/api/games/play/plinko", { betAmount, payload: { rows, risk } });
    setTimeout(() => {
      setDropping(false);
      if (outcome) setShowResult(true);
    }, rows * 90 + 200);
  }

  const bucket = lastResult?.result.bucket;

  return (
    <div className="grid grid-cols-1 gap-6 lg:contents">
      <BetPanel betAmount={betAmount} onChange={setBetAmount} balance={profile?.balance ?? 0} min={game.minBet} max={game.maxBet} disabled={isLoading || dropping} onPlay={play}>
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-peak-gray">Rows: {rows}</label>
          <input type="range" min={8} max={16} value={rows} onChange={(e) => setRows(Number(e.target.value))} className="w-full accent-peak-gold" />
        </div>
      </BetPanel>

      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="relative w-full max-w-lg" style={{ aspectRatio: "1/1" }}>
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="absolute left-0 right-0 flex justify-center gap-3" style={{ top: `${(row / rows) * 85}%` }}>
              {Array.from({ length: row + 2 }, (_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-peak-gray-dim" />
              ))}
            </div>
          ))}
          {dropping && (
            <motion.div
              initial={{ top: "0%", left: "50%" }}
              animate={{ top: "85%" }}
              transition={{ duration: (rows * 90) / 1000, ease: "easeIn" }}
              className="absolute h-3 w-3 -translate-x-1/2 rounded-full bg-peak-gold glow-gold"
            />
          )}
        </div>
        <div className="flex w-full max-w-lg gap-1">
          {multipliers.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-md py-1.5 text-center text-[10px] font-bold",
                bucket === i && !dropping ? "bg-peak-gold text-peak-black" : "bg-peak-surface-2 text-peak-gray",
                m >= 5 && "text-peak-gold"
              )}
            >
              {m}x
            </div>
          ))}
        </div>
        <WinBanner show={showResult && !!lastResult} payout={lastResult?.payout ?? 0} multiplier={lastResult?.multiplier ?? 0} isWin={!!lastResult?.isWin} />
      </div>
    </div>
  );
}
