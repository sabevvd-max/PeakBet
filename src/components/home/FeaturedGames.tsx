import { Section } from "./Section";
import { GameRow } from "./GameRow";
import { FEATURED_GAMES } from "@/lib/games";

export function FeaturedGames() {
  return (
    <Section title="Featured Games" subtitle="Hand-picked highlights from the PeakBet catalog" viewAllHref="/games">
      <GameRow games={FEATURED_GAMES} />
    </Section>
  );
}
