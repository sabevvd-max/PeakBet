"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/profile/RequireAuth";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { GameCard } from "@/components/games/GameCard";
import { getGameBySlug } from "@/lib/games";
import { GameMeta } from "@/lib/games/types";

function FavoritesContent() {
  const [games, setGames] = useState<GameMeta[] | null>(null);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setGames((d.favorites ?? []).map((slug: string) => getGameBySlug(slug)).filter(Boolean)));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">My Profile</h1>
      <ProfileNav />

      <h2 className="mt-6 mb-4 text-lg font-semibold text-white">Favorite Games</h2>

      {games === null ? (
        <p className="text-sm text-peak-gray">Loading…</p>
      ) : games.length === 0 ? (
        <p className="text-sm text-peak-gray">No favorites yet — tap the star on any game page to save it here.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {games.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesContent />
    </RequireAuth>
  );
}
