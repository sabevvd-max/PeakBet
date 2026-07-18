import { Hero } from "@/components/home/Hero";
import { FeaturedGames } from "@/components/home/FeaturedGames";
import { PopularGames } from "@/components/home/PopularGames";
import { JackpotWinners } from "@/components/home/JackpotWinners";
import { DailyChallenges } from "@/components/home/DailyChallenges";
import { LeaderboardWidget } from "@/components/home/LeaderboardWidget";
import { LiveWinsFeed } from "@/components/home/LiveWinsFeed";
import { RecentlyPlayed } from "@/components/home/RecentlyPlayed";
import { Promotions } from "@/components/home/Promotions";
import { FAQ } from "@/components/home/FAQ";

export default function Home() {
  return (
    <div>
      <Hero />
      <RecentlyPlayed />
      <FeaturedGames />
      <PopularGames />
      <JackpotWinners />
      <DailyChallenges />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 lg:grid-cols-2">
        <LeaderboardWidget />
        <LiveWinsFeed />
      </div>
      <Promotions />
      <FAQ />
    </div>
  );
}
