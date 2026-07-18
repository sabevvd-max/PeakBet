import { handleDraw } from "@/lib/games/poker-route-handlers";
import { resolveFiveCardPoker } from "@/lib/games/resolvers/five-card-poker";

export async function POST(request: Request) {
  return handleDraw("five-card-poker", resolveFiveCardPoker, request);
}
