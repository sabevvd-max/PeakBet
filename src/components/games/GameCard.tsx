"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GameMeta } from "@/lib/games/types";
import { cn } from "@/lib/utils";

export function GameCard({ game, className }: { game: GameMeta; className?: string }) {
  return (
    <Link href={`/casino/${game.slug}`} className={cn("group block shrink-0", className)}>
      <motion.div
        whileHover={{ y: -4 }}
        className="relative aspect-[3/4] overflow-hidden rounded-xl border border-peak-border bg-peak-surface transition-colors group-hover:border-peak-gold/50"
        style={{ background: `linear-gradient(160deg, ${game.gradient[0]}22, ${game.gradient[1]}22)` }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-5xl">{game.icon}</div>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {game.isNew && <Badge variant="neon">New</Badge>}
          {game.hasJackpot && <Badge variant="gold">Jackpot</Badge>}
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-peak-gold text-peak-black">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5 pt-6">
          <p className="truncate text-sm font-semibold text-white">{game.name}</p>
          <p className="truncate text-[11px] capitalize text-peak-gray">{game.category}</p>
        </div>
      </motion.div>
    </Link>
  );
}
