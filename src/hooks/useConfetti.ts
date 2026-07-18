"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";

const GOLD_PALETTE = ["#ffd700", "#fff3b0", "#f4c430", "#ffffff"];
const NEON_PALETTE = ["#39ff88", "#0dff9c", "#ffd700", "#ffffff"];

export function useConfetti() {
  const fireWin = useCallback(() => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: GOLD_PALETTE });
  }, []);

  const fireBigWin = useCallback(() => {
    const duration = 1500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors: NEON_PALETTE });
      confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors: NEON_PALETTE });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const fireUltraWin = useCallback(() => {
    const duration = 2500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 10,
        startVelocity: 45,
        spread: 100,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors: [...GOLD_PALETTE, ...NEON_PALETTE],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return { fireWin, fireBigWin, fireUltraWin };
}
