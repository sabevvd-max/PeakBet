import { GameMeta } from "@/lib/games/types";
import { DrawPokerGame } from "@/components/casino/draw-poker/DrawPokerGame";

const PAYTABLE: [string, number][] = [
  ["Royal Flush", 250],
  ["Straight Flush", 50],
  ["Four of a Kind", 25],
  ["Full House", 9],
  ["Flush", 6],
  ["Straight", 4],
  ["Three of a Kind", 3],
  ["Two Pair", 2],
  ["Jacks or Better", 1],
];

export function VideoPokerGame({ game }: { game: GameMeta }) {
  return <DrawPokerGame game={game} dealUrl="/api/games/video-poker/deal" drawUrl="/api/games/video-poker/draw" paytable={PAYTABLE} />;
}
