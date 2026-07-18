"use client";

import { useCallback } from "react";
import { soundEngine } from "@/lib/sound";
import { useUIStore } from "@/store/uiStore";

export function useSound() {
  const soundEnabled = useUIStore((s) => s.soundEnabled);

  const play = useCallback(
    (effect: Parameters<typeof soundEngine.play>[0]) => {
      if (!soundEnabled) return;
      soundEngine.play(effect);
    },
    [soundEnabled]
  );

  return { play, soundEnabled };
}
