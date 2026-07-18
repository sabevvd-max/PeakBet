# PeakBet — The Peak of Entertainment

A free demo online casino platform for **entertainment and educational purposes only**. Every balance, bet, and payout is denominated in virtual demo coins. There is no real-money gambling anywhere in this codebase — no deposits, no withdrawals, no payment processors, no crypto. New accounts start with 10,000 free demo coins.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for the design system (black / gold / neon-green, glassmorphism)
- **Framer Motion** for animation, **canvas-confetti** for win celebrations
- **Supabase Auth** for signup / login / password reset
- **Prisma** + **PostgreSQL** for everything else (profiles, wallets, game rounds, missions, achievements, leaderboards, admin data)
- **Zustand** for local UI state, **React Hook Form + Zod** for forms

## What's here

- **55 games**: 19 table/instant/card games (Blackjack, European & American Roulette, Baccarat, Video Poker, 5-Card Draw Poker, Texas Hold'em Demo, Crash, Dice, Coin Flip, Mines, Plinko, Keno, Wheel, Hi-Lo, Dragon Tower, Limbo, Rock Paper Scissors, Number Guess) + a single config-driven **slot engine** powering 36 uniquely themed slots (wilds, scatters, free spins, multipliers, jackpots, big/mega/ultra win tiers).
- **Provably-fair RNG**: every round is resolved from a hashed server seed + client seed + nonce (`src/lib/game-engine/rng.ts`), so outcomes are deterministic and can't be altered after a bet is placed.
- **Full progression system**: XP/levels, ranks, daily/weekly/monthly missions, achievements & badges, login-streak rewards, a referral program, and redeemable promo codes.
- **Profile**: overview/stats, achievements, game history, transaction ledger, rewards, favorites, settings.
- **Admin panel** (`/admin`, requires `role = ADMIN`): dashboard + DAU chart, user & balance management, per-game RTP statistics, top players, admin action logs, announcements (shown as a site-wide banner), and promo code management.
- **Home page**: hero, featured/popular games, jackpot winners, daily challenges, live leaderboard, live wins feed, recently played, promotions, FAQ.

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Database

Point `DATABASE_URL` / `DIRECT_URL` in `.env` at a PostgreSQL instance (a local Postgres works fine for development; use your Supabase project's Postgres connection string in production — Settings → Database in the Supabase dashboard).

```bash
cp .env.example .env   # then fill in real values
npx prisma migrate deploy   # applies prisma/migrations
npm run db:seed             # seeds the 55-game catalog, achievements, missions, promo codes
```

### 3. Supabase Auth

Create a free project at [supabase.com](https://supabase.com), then set:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Email/password auth is enabled by default. No other configuration is required — the app bootstraps a `Profile` row (with the starting 10,000-coin balance) automatically the first time a Supabase-authenticated user hits the app.

To make a user an admin, flip their role directly in the database once they've signed up:

```sql
update "Profile" set role = 'ADMIN' where username = 'your-username';
```

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` then production build |
| `npm run db:migrate` | Create/apply a new migration in development |
| `npm run db:deploy` | Apply existing migrations (use this in CI/production) |
| `npm run db:seed` | Seed the game catalog, achievements, missions, promo codes |
| `npm run lint` | ESLint |

## Deploying

The app is set up for Vercel:

1. Push to GitHub, import into Vercel.
2. Set the env vars from `.env.example` in the Vercel project settings, pointing `DATABASE_URL`/`DIRECT_URL` at your Supabase Postgres connection strings.
3. Add `npx prisma migrate deploy` as a build step (or run it once manually) before the first deploy so the schema exists.
4. Deploy. `npm run build` already runs `prisma generate` for you.

## Project layout

```
prisma/                   schema.prisma, migrations, seed script
src/
  app/                     Next.js routes (pages + API route handlers)
    (auth)/                login, signup, forgot/reset password
    admin/                 admin panel pages
    api/                   all API route handlers, grouped by feature
    casino/[slug]/         single dynamic route for every game
    profile/               profile sub-pages
  components/
    admin/ auth/ casino/ games/ home/ layout/ profile/ slots/ ui/
  context/                 AuthContext (Supabase session + profile)
  hooks/                   usePlayGame, useSound, useConfetti, ...
  lib/
    game-engine/           RNG, bet/session settlement, missions/achievements, leaderboard
    games/                 game registry, per-game resolvers, slot theme packs + engine
    supabase/               browser/server/middleware Supabase clients
  store/                   zustand UI store (sidebar, sound)
```

## A note on scope

This is a large demo project. A few deliberate simplifications:

- **Poker/Texas Hold'em** is a single-request heads-up showdown against a bot rather than a full incremental-betting-round implementation.
- **"Wheel"** covers the spec's "Wheel" and "Lucky Wheel" as one game — they're the same mechanic.
- **Season Pass** is folded into the existing Level/XP/Rank system rather than built as a separate parallel progression track.
- Slot **thumbnails/reel symbols** are emoji-based (no external art assets), keeping the whole platform dependency-free and original — no ties to any real casino's IP.
