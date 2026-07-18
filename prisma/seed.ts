import { PrismaClient } from "@prisma/client";
import { ALL_GAMES } from "../src/lib/games";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { key: "games-10", name: "Getting Started", description: "Play 10 rounds", icon: "🎮", goal: 10, xpReward: 50, coinReward: 100, tier: "bronze" },
  { key: "games-100", name: "Regular", description: "Play 100 rounds", icon: "🕹️", goal: 100, xpReward: 200, coinReward: 500, tier: "silver" },
  { key: "games-1000", name: "PeakBet Veteran", description: "Play 1,000 rounds", icon: "🏅", goal: 1000, xpReward: 1000, coinReward: 5000, tier: "gold" },
  { key: "wager-10000", name: "High Roller", description: "Wager a total of 10,000 coins", icon: "💰", goal: 10000, xpReward: 300, coinReward: 1000, tier: "silver" },
  { key: "wager-100000", name: "Whale Status", description: "Wager a total of 100,000 coins", icon: "🐋", goal: 100000, xpReward: 1500, coinReward: 10000, tier: "gold" },
  { key: "wager-1000000", name: "Peak Legend", description: "Wager a total of 1,000,000 coins", icon: "👑", goal: 1000000, xpReward: 5000, coinReward: 50000, tier: "platinum" },
  { key: "wins-1", name: "First Blood", description: "Win your first round", icon: "🎉", goal: 1, xpReward: 25, coinReward: 50, tier: "bronze" },
  { key: "wins-50", name: "On a Roll", description: "Win 50 rounds", icon: "🔥", goal: 50, xpReward: 250, coinReward: 750, tier: "silver" },
  { key: "wins-500", name: "Unstoppable", description: "Win 500 rounds", icon: "⚡", goal: 500, xpReward: 1200, coinReward: 8000, tier: "gold" },
  { key: "bigwin-1", name: "Big Winner", description: "Land a 10x+ multiplier win", icon: "💎", goal: 1, xpReward: 150, coinReward: 500, tier: "silver" },
  { key: "bigwin-10", name: "Multiplier Master", description: "Land 10 wins of 10x+", icon: "🚀", goal: 10, xpReward: 800, coinReward: 3000, tier: "gold" },
  { key: "badge-early-adopter", name: "Early Adopter", type: "BADGE" as const, description: "Joined PeakBet in its first season", icon: "🌟", goal: 1, xpReward: 100, coinReward: 250, tier: "bronze" },
];

const MISSIONS = [
  { key: "daily-games-5", period: "DAILY" as const, title: "Warm Up", description: "Play 5 rounds today", icon: "🎯", goal: 5, xpReward: 30, coinReward: 100 },
  { key: "daily-wager-500", period: "DAILY" as const, title: "Daily Grinder", description: "Wager 500 coins today", icon: "💵", goal: 500, xpReward: 40, coinReward: 150 },
  { key: "daily-wins-3", period: "DAILY" as const, title: "Winning Streak", description: "Win 3 rounds today", icon: "🏆", goal: 3, xpReward: 50, coinReward: 200 },
  { key: "weekly-games-50", period: "WEEKLY" as const, title: "Weekly Warrior", description: "Play 50 rounds this week", icon: "📅", goal: 50, xpReward: 200, coinReward: 750 },
  { key: "weekly-wager-5000", period: "WEEKLY" as const, title: "Big Spender", description: "Wager 5,000 coins this week", icon: "💸", goal: 5000, xpReward: 250, coinReward: 1000 },
  { key: "weekly-bigwin-3", period: "WEEKLY" as const, title: "Multiplier Hunter", description: "Land 3 wins of 10x+ this week", icon: "🎇", goal: 3, xpReward: 300, coinReward: 1200 },
  { key: "monthly-games-300", period: "MONTHLY" as const, title: "Monthly Marathon", description: "Play 300 rounds this month", icon: "🗓️", goal: 300, xpReward: 800, coinReward: 4000 },
  { key: "monthly-wager-25000", period: "MONTHLY" as const, title: "Monthly High Roller", description: "Wager 25,000 coins this month", icon: "🏦", goal: 25000, xpReward: 1000, coinReward: 6000 },
];

const PROMO_CODES = [
  { code: "PEAKBET2026", coinReward: 1000, maxRedemptions: 100000 },
  { code: "WELCOME500", coinReward: 500, maxRedemptions: 100000 },
  { code: "HIGHROLLER", coinReward: 2500, maxRedemptions: 5000 },
];

async function main() {
  console.log(`Seeding ${ALL_GAMES.length} games...`);
  for (const game of ALL_GAMES) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      create: {
        slug: game.slug,
        name: game.name,
        category: game.category.toUpperCase() as "SLOTS" | "TABLE" | "INSTANT" | "CARDS" | "JACKPOT",
        subcategory: game.subcategory,
        description: game.description,
        rtp: game.rtp,
        volatility: game.volatility,
        minBet: game.minBet,
        maxBet: game.maxBet,
        isFeatured: !!game.isFeatured,
        isNew: !!game.isNew,
        isPopular: !!game.isPopular,
        hasJackpot: !!game.hasJackpot,
      },
      update: {
        name: game.name,
        rtp: game.rtp,
        volatility: game.volatility,
        minBet: game.minBet,
        maxBet: game.maxBet,
        isFeatured: !!game.isFeatured,
        isNew: !!game.isNew,
        isPopular: !!game.isPopular,
        hasJackpot: !!game.hasJackpot,
      },
    });
  }

  console.log(`Seeding ${ACHIEVEMENTS.length} achievements...`);
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      create: { ...a, type: a.type ?? "ACHIEVEMENT" },
      update: { ...a, type: a.type ?? "ACHIEVEMENT" },
    });
  }

  console.log(`Seeding ${MISSIONS.length} missions...`);
  for (const m of MISSIONS) {
    await prisma.mission.upsert({ where: { key: m.key }, create: m, update: m });
  }

  console.log(`Seeding ${PROMO_CODES.length} promo codes...`);
  for (const p of PROMO_CODES) {
    await prisma.promoCode.upsert({ where: { code: p.code }, create: p, update: p });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
