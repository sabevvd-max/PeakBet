"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden border-b border-peak-border">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-peak-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-peak-neon/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-peak-gold/30 bg-peak-gold/5 px-4 py-1.5 text-xs font-medium text-peak-gold"
        >
          ✦ 55 Games · 10,000 Free Demo Coins
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          The <span className="shimmer-text">Peak</span> of Entertainment
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-5 max-w-xl text-base text-peak-gray sm:text-lg"
        >
          Slots, table games, and instant classics — all free to play with virtual demo coins. No deposits, no withdrawals, no real money. Ever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {user ? (
            <Link href="/games">
              <Button size="lg">
                <Play className="h-4 w-4 fill-current" /> Play Now
              </Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button size="lg">Sign Up — Get 10,000 Coins</Button>
            </Link>
          )}
          <Link href="/games">
            <Button size="lg" variant="secondary">
              Browse Games
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
