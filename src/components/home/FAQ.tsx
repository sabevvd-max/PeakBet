"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "./Section";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "Is PeakBet real-money gambling?", a: "No. PeakBet is a free demo platform for entertainment and educational purposes only. All coins are virtual, have no real-world value, and can never be deposited, withdrawn, purchased, or exchanged for anything of value." },
  { q: "How do I get more demo coins?", a: "Every new account starts with 10,000 free demo coins. You can earn more through daily/weekly/monthly rewards, missions, achievements, leveling up, and promo codes." },
  { q: "Are the games fair?", a: "Yes. Every round uses a provably-fair system: a hashed server seed is combined with a client seed and nonce to produce the outcome, so results can't be manipulated after a bet is placed." },
  { q: "Can I lose real money?", a: "Never. There is no way to deposit real money into PeakBet, and demo coins cannot be cashed out. It's purely for fun and learning how these games work." },
  { q: "What happens if I run out of coins?", a: "Come back for your daily reward, complete missions, or redeem a promo code — your balance will never stay at zero for long." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" title="Frequently Asked Questions">
      <div className="space-y-2">
        {FAQS.map((item, i) => (
          <GlassCard key={item.q} className="overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left cursor-pointer"
            >
              <span className="text-sm font-semibold text-white">{item.q}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-peak-gray transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-peak-gray">{item.a}</p>}
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
