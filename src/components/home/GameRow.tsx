import { GameMeta } from "@/lib/games/types";
import { GameCard } from "@/components/games/GameCard";

export function GameRow({ games }: { games: GameMeta[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible md:grid-cols-4 lg:grid-cols-6">
      {games.map((game) => (
        <GameCard key={game.slug} game={game} className="w-32 sm:w-auto" />
      ))}
    </div>
  );
}
