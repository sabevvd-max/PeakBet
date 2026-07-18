"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryFilters } from "@/components/layout/CategoryFilters";
import { GameCard } from "@/components/games/GameCard";
import { getGamesByCategory, searchGames } from "@/lib/games";
import { GameCategory } from "@/lib/games/types";

function GamesPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as GameCategory | null) ?? "all";
  const [category, setCategory] = useState<GameCategory | "all">(initialCategory);
  const [query, setQuery] = useState("");

  const games = useMemo(() => {
    const base = query.trim() ? searchGames(query) : getGamesByCategory(category);
    return query.trim() ? base.filter((g) => category === "all" || g.category === category) : base;
  }, [category, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white">All Games</h1>
      <p className="mt-1 text-sm text-peak-gray">{games.length} games available</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilters active={category} onChange={setCategory} />
        <div className="sm:w-72">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games..."
            className="h-10 w-full rounded-xl border border-peak-border bg-peak-surface px-3.5 text-sm text-white placeholder:text-peak-gray-dim focus:border-peak-gold/50 focus:outline-none"
          />
        </div>
      </div>

      {games.length === 0 ? (
        <p className="mt-16 text-center text-sm text-peak-gray">No games match your search.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense>
      <GamesPageContent />
    </Suspense>
  );
}
