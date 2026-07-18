import { GameMeta } from "@/lib/games/types";
import { DrawPokerGame } from "@/components/casino/draw-poker/DrawPokerGame";

const PAYTABLE: [string, number][] = [
  ["Royal Flush", 300],
  ["Straight Flush", 60],
  ["Four of a Kind", 30],
  ["Full House", 10],
  ["Flush", 7],
  ["Straight", 5],
  ["Three of a Kind", 3],
  ["Two Pair", 2],
  ["Pair", 1],
];

export function FiveCardPokerGame({ game }: { game: GameMeta }) {
  return <DrawPokerGame game={game} dealUrl="/api/games/five-card-poker/deal" drawUrl="/api/games/five-card-poker/draw" paytable={PAYTABLE} />;
}
