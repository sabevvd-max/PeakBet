import { handleDeal } from "@/lib/games/poker-route-handlers";

export async function POST() {
  return handleDeal();
}
