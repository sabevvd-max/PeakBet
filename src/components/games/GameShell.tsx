import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/games/FavoriteButton";
import { GameMeta } from "@/lib/games/types";

export function GameShell({ game, children }: { game: GameMeta; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <Link href="/games" className="mb-4 inline-flex items-center gap-1 text-sm text-peak-gray hover:text-white">
        <ChevronLeft className="h-4 w-4" />
        All Games
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-3xl">{game.icon}</span>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{game.name}</h1>
          <p className="text-sm text-peak-gray">{game.description}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="gold">RTP {game.rtp}%</Badge>
          <Badge variant="gray" className="capitalize">
            {game.volatility} volatility
          </Badge>
          <FavoriteButton slug={game.slug} />
        </div>
      </div>

      <div className="glass rounded-2xl p-5 lg:grid lg:grid-cols-[320px_1fr] lg:gap-8 lg:p-6">{children}</div>
    </div>
  );
}
