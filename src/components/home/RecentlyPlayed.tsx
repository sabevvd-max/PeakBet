"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getGameBySlug } from "@/lib/games";
import { Section } from "./Section";
import { GameRow } from "./GameRow";
import { GameMeta } from "@/lib/games/types";

export function RecentlyPlayed() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameMeta[] | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/profile/recently-played")
      .then((r) => r.json())
      .then((d) => {
        const resolved = (d.games ?? []).map((g: { slug: string }) => getGameBySlug(g.slug)).filter(Boolean) as GameMeta[];
        setGames(resolved);
      })
      .catch(() => setGames([]));
  }, [user]);

  if (!user || !games || games.length === 0) return null;

  return (
    <Section title="Recently Played" subtitle="Jump back into your last sessions">
      <GameRow games={games} />
    </Section>
  );
}
