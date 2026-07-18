import Link from "next/link";
import { AlertTriangle } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Games",
    links: [
      { label: "Slots", href: "/games?category=slots" },
      { label: "Table Games", href: "/games?category=table" },
      { label: "Instant Games", href: "/games?category=instant" },
      { label: "Jackpots", href: "/games?category=jackpot" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Profile", href: "/profile" },
      { label: "Rewards", href: "/profile/rewards" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Promotions", href: "/promotions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About PeakBet", href: "/#faq" },
      { label: "FAQ", href: "/#faq" },
      { label: "Responsible Play", href: "/#responsible-play" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-peak-border bg-peak-black-soft">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div
          id="responsible-play"
          className="mb-10 flex items-start gap-3 rounded-2xl border border-peak-gold/20 bg-peak-gold/5 p-4"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-peak-gold" />
          <p className="text-sm text-peak-gray">
            <span className="font-semibold text-peak-gold">PeakBet is a free demo platform for entertainment and educational purposes only.</span>{" "}
            All coins are virtual, have no real-world value, and cannot be purchased, deposited, withdrawn, or exchanged for money or
            anything of value. No real-money gambling occurs on this site.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="mb-3 flex items-center gap-2">
              <span className="text-2xl">♛</span>
              <span className="font-display text-xl font-bold text-gradient-gold">PeakBet</span>
            </Link>
            <p className="text-sm text-peak-gray">The Peak of Entertainment.</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold text-white">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-peak-gray hover:text-peak-gold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-peak-border pt-6 sm:flex-row">
          <p className="text-xs text-peak-gray-dim">© {new Date().getFullYear()} PeakBet. All rights reserved. 18+ demo only.</p>
          <p className="text-xs text-peak-gray-dim">No purchase necessary. No real-money gambling.</p>
        </div>
      </div>
    </footer>
  );
}
