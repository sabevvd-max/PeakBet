"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import type { PlayGameResult } from "@/lib/game-engine/bet-service";

type WinTier = "none" | "win" | "big" | "mega" | "ultra";

function tierFor(multiplier: number): WinTier {
  if (multiplier >= 50) return "ultra";
  if (multiplier >= 25) return "mega";
  if (multiplier >= 10) return "big";
  if (multiplier > 0) return "win";
  return "none";
}

/** Generic client-side driver for any single-request or two-phase game endpoint. */
export function usePlayGame<TResult = unknown>() {
  const { setBalance, refreshProfile } = useAuth();
  const { play } = useSound();
  const { fireWin, fireBigWin, fireUltraWin } = useConfetti();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<PlayGameResult<TResult> | null>(null);

  const request = useCallback(
    async (url: string, body: object): Promise<PlayGameResult<TResult> | null> => {
      setIsLoading(true);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? "Something went wrong");
          if (res.status === 401) toast.info("Log in to play with your demo balance.");
          return null;
        }

        const outcome = data.outcome as PlayGameResult<TResult>;
        setLastResult(outcome);
        setBalance(outcome.balance);

        const tier = tierFor(outcome.multiplier);
        if (tier === "none") {
          play("lose");
        } else {
          play(tier === "win" ? "win" : "bigWin");
          if (tier === "win" || tier === "big") fireWin();
          if (tier === "mega") fireBigWin();
          if (tier === "ultra") fireUltraWin();
        }

        if (outcome.leveledUp) {
          play("levelUp");
          toast.success(`Level up! You're now level ${outcome.newLevel}.`);
        }
        for (const achievement of outcome.unlockedAchievements) {
          toast.success(`Achievement unlocked: ${achievement.name}`, { icon: achievement.icon });
        }

        return outcome;
      } catch {
        toast.error("Network error — please try again.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setBalance, play, fireWin, fireBigWin, fireUltraWin]
  );

  return { request, isLoading, lastResult, refreshProfile };
}
