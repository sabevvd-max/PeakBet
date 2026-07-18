import { Section } from "./Section";
import { GameRow } from "./GameRow";
import { POPULAR_GAMES } from "@/lib/games";

export function PopularGames() {
  return (
    <Section title="Popular Games" subtitle="What everyone's playing right now" viewAllHref="/games">
      <GameRow games={POPULAR_GAMES} />
    </Section>
  );
}
