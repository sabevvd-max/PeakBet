"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCoins, clamp } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BetPanelProps {
  betAmount: number;
  onChange: (amount: number) => void;
  balance: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  onPlay: () => void;
  playLabel?: string;
  playDisabled?: boolean;
}

export function BetPanel({
  betAmount,
  onChange,
  balance,
  min = 1,
  max = 5000,
  disabled,
  children,
  onPlay,
  playLabel = "Place Bet",
  playDisabled,
}: BetPanelProps) {
  function set(amount: number) {
    onChange(Math.round(clamp(amount, min, max) * 100) / 100);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-peak-gray">Bet Amount</label>
          <span className="text-xs text-peak-gray-dim">Balance: {formatCoins(balance)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            disabled={disabled}
            onClick={() => set(betAmount / 2)}
            className="h-11 shrink-0 rounded-xl border border-peak-border bg-peak-surface px-3 text-xs font-semibold text-peak-gray hover:text-white disabled:opacity-40 cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            disabled={disabled}
            value={betAmount}
            onChange={(e) => onChange(Number(e.target.value))}
            onBlur={(e) => set(Number(e.target.value))}
            className={cn(
              "h-11 w-full rounded-xl border border-peak-border bg-peak-surface px-3 text-center text-sm font-semibold text-white focus:border-peak-gold/50 focus:outline-none",
              disabled && "opacity-60"
            )}
          />
          <button
            disabled={disabled}
            onClick={() => set(betAmount * 2)}
            className="h-11 shrink-0 rounded-xl border border-peak-border bg-peak-surface px-3 text-xs font-semibold text-peak-gray hover:text-white disabled:opacity-40 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-1.5 flex gap-1.5">
          {[10, 25, 50, 100].map((pct) => (
            <button
              key={pct}
              disabled={disabled}
              onClick={() => set((balance * pct) / 100)}
              className="flex-1 rounded-lg border border-peak-border bg-peak-surface py-1 text-[11px] font-medium text-peak-gray hover:border-peak-gold/40 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              {pct}%
            </button>
          ))}
          <button
            disabled={disabled}
            onClick={() => set(max)}
            className="flex-1 rounded-lg border border-peak-border bg-peak-surface py-1 text-[11px] font-medium text-peak-gray hover:border-peak-gold/40 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            Max
          </button>
        </div>
      </div>

      {children}

      <Button size="lg" className="w-full" onClick={onPlay} disabled={disabled || playDisabled || betAmount > balance || betAmount < min}>
        {betAmount > balance ? "Insufficient Balance" : playLabel}
      </Button>
    </div>
  );
}
