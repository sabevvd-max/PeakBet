"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatCoins, formatMultiplier, cn } from "@/lib/utils";

interface WinBannerProps {
  show: boolean;
  payout: number;
  multiplier: number;
  isWin: boolean;
}

export function WinBanner({ show, payout, multiplier, isWin }: WinBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 18, stiffness: 260 }}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-8 py-5 text-center backdrop-blur-md",
            isWin ? "border-peak-neon/50 bg-peak-black/80 glow-neon" : "border-peak-red/40 bg-peak-black/80"
          )}
        >
          <p className={cn("font-display text-3xl font-bold", isWin ? "text-gradient-neon" : "text-peak-red")}>
            {isWin ? `+${formatCoins(payout)}` : "No Win"}
          </p>
          {isWin && <p className="mt-1 text-sm text-peak-gray">{formatMultiplier(multiplier)}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
