import { handleDraw } from "@/lib/games/poker-route-handlers";
import { resolveVideoPoker } from "@/lib/games/resolvers/video-poker";

export async function POST(request: Request) {
  return handleDraw("video-poker", resolveVideoPoker, request);
}
