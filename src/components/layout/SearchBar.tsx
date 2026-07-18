"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchGames } from "@/lib/games";
import { cn } from "@/lib/utils";

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => (query.trim() ? searchGames(query).slice(0, 8) : []), [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToGame(slug: string) {
    setQuery("");
    setOpen(false);
    router.push(`/casino/${slug}`);
  }

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <div className="flex items-center gap-2 rounded-xl border border-peak-border bg-peak-surface px-3 py-2 focus-within:border-peak-gold/50 transition-colors">
        <Search className="h-4 w-4 shrink-0 text-peak-gray" />
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search games..."
          className="w-full bg-transparent text-sm text-white placeholder:text-peak-gray-dim focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-peak-gray hover:text-white cursor-pointer" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="glass-strong absolute top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-peak-border p-1.5 shadow-2xl">
          {results.map((game) => (
            <button
              key={game.slug}
              onClick={() => goToGame(game.slug)}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-white/5 cursor-pointer"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg"
                style={{ background: `linear-gradient(135deg, ${game.gradient[0]}33, ${game.gradient[1]}33)` }}
              >
                {game.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{game.name}</span>
                <span className="block text-xs capitalize text-peak-gray">{game.category}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="glass-strong absolute top-full z-40 mt-2 w-full rounded-xl border border-peak-border p-4 text-center text-sm text-peak-gray">
          No games found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
