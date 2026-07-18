"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatCoins, cn } from "@/lib/utils";

interface CoinBalanceProps {
  balance: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CoinBalance({ balance, size = "md", className }: CoinBalanceProps) {
  const prevBalance = useRef(balance);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (balance > prevBalance.current) setDirection("up");
    else if (balance < prevBalance.current) setDirection("down");
    prevBalance.current = balance;
    const t = setTimeout(() => setDirection(null), 700);
    return () => clearTimeout(t);
  }, [balance]);

  const sizeClasses = { sm: "text-xs gap-1", md: "text-sm gap-1.5", lg: "text-lg gap-2" };

  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-peak-gold/30 bg-peak-black-soft px-3 py-1.5 font-semibold text-peak-gold transition-shadow",
        direction === "up" && "glow-gold",
        sizeClasses[size],
        className
      )}
    >
      <span className={cn("text-base", size === "lg" && "text-xl", size === "sm" && "text-sm")}>🪙</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={balance}
          initial={{ opacity: 0, y: direction === "up" ? 8 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(direction === "up" && "text-peak-neon", direction === "down" && "text-peak-red")}
        >
          {formatCoins(balance)}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
