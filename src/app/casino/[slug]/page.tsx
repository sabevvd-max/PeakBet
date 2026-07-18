import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGameBySlug } from "@/lib/games";
import { getSlotConfig } from "@/lib/games/slots";
import { GameShell } from "@/components/games/GameShell";
import { TABLE_GAME_COMPONENTS } from "@/components/casino/registry";
import { SlotMachine } from "@/components/slots/SlotMachine";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  return { title: game ? `${game.name} — PeakBet` : "Game — PeakBet" };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) notFound();

  const slotConfig = getSlotConfig(slug);
  const TableComponent = TABLE_GAME_COMPONENTS[slug];

  if (slotConfig) {
    return (
      <GameShell game={game}>
        <SlotMachine config={slotConfig} />
      </GameShell>
    );
  }

  if (TableComponent) {
    return (
      <GameShell game={game}>
        <TableComponent game={game} />
      </GameShell>
    );
  }

  notFound();
}
