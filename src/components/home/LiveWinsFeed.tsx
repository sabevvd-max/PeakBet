"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "./Section";
import { formatCoins, formatMultiplier } from "@/lib/utils";

interface FeedItem {
  id: string;
  username: string;
  avatarUrl: string | null;
  game: string;
  gameSlug: string;
  payout: number;
  multiplier: number;
}

export function LiveWinsFeed() {
  const [feed, setFeed] = useState<FeedItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/live-feed?limit=12");
        const data = await res.json();
        if (!cancelled) setFeed(data.feed ?? []);
      } catch {
        if (!cancelled) setFeed([]);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Section title="Live Wins Feed" subtitle="Real wins happening across PeakBet right now">
      {feed === null ? (
        <GlassCard className="p-6 text-center text-sm text-peak-gray">Loading live wins…</GlassCard>
      ) : feed.length === 0 ? (
        <GlassCard className="p-6 text-center text-sm text-peak-gray">No wins yet — spin something and be first on the board!</GlassCard>
      ) : (
        <GlassCard className="max-h-80 overflow-y-auto p-2">
          <AnimatePresence initial={false}>
            {feed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5"
              >
                <Avatar username={item.username} avatarUrl={item.avatarUrl} size="sm" />
                <p className="min-w-0 flex-1 truncate text-sm text-white">
                  <span className="font-semibold">{item.username}</span> won on{" "}
                  <Link href={`/casino/${item.gameSlug}`} className="text-peak-gold hover:underline">
                    {item.game}
                  </Link>
                </p>
                <p className="shrink-0 text-sm font-semibold text-peak-neon">
                  +{formatCoins(item.payout)} · {formatMultiplier(item.multiplier)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </GlassCard>
      )}
    </Section>
  );
}
