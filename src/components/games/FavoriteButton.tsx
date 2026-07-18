"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function FavoriteButton({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setIsFavorite((d.favorites ?? []).includes(slug)));
  }, [user, slug]);

  async function toggle() {
    if (!user) {
      toast.info("Log in to save favorites");
      return;
    }
    setLoading(true);
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      if (next) {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
      } else {
        await fetch(`/api/favorites?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      }
    } catch {
      setIsFavorite(!next);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition-colors cursor-pointer",
        isFavorite ? "border-peak-gold bg-peak-gold/10 text-peak-gold" : "border-peak-border text-peak-gray hover:text-white"
      )}
      aria-label="Toggle favorite"
    >
      <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
    </button>
  );
}
