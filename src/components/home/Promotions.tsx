import Link from "next/link";
import { Gift, Calendar, Users, Ticket } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "./Section";

const PROMOS = [
  { icon: Gift, title: "Welcome Bonus", desc: "10,000 free demo coins the moment you sign up.", href: "/signup" },
  { icon: Calendar, title: "Daily / Weekly / Monthly Rewards", desc: "Log in and claim streak bonuses on every cadence.", href: "/profile/rewards" },
  { icon: Users, title: "Referral Program", desc: "Invite friends and both of you get bonus coins.", href: "/profile/rewards" },
  { icon: Ticket, title: "Promo Codes", desc: "Redeem codes like WELCOME500 for instant coins.", href: "/promotions" },
];

export function Promotions() {
  return (
    <Section title="Promotions" subtitle="More ways to stack up demo coins">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PROMOS.map((p) => (
          <Link key={p.title} href={p.href}>
            <GlassCard className="h-full p-5 transition-colors hover:border-peak-gold/40">
              <p.icon className="mb-3 h-6 w-6 text-peak-gold" />
              <p className="text-sm font-semibold text-white">{p.title}</p>
              <p className="mt-1 text-xs text-peak-gray">{p.desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </Section>
  );
}
