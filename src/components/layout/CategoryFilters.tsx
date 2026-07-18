"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/games";
import { GameCategory } from "@/lib/games/types";

interface CategoryFiltersProps {
  active: GameCategory | "all";
  onChange: (category: GameCategory | "all") => void;
  className?: string;
}

const ORDER: (GameCategory | "all")[] = ["all", "slots", "table", "cards", "instant", "jackpot"];

export function CategoryFilters({ active, onChange, className }: CategoryFiltersProps) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-1", className)}>
      {ORDER.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all cursor-pointer",
            active === category
              ? "border-peak-gold bg-peak-gold text-peak-black"
              : "border-peak-border bg-peak-surface text-peak-gray hover:border-peak-gold/40 hover:text-white"
          )}
        >
          {CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  );
}
