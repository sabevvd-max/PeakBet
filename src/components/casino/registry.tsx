import { ComponentType } from "react";
import { GameMeta } from "@/lib/games/types";
import { DiceGame } from "./dice/DiceGame";
import { CoinFlipGame } from "./coinflip/CoinFlipGame";
import { LimboGame } from "./limbo/LimboGame";
import { CrashGame } from "./crash/CrashGame";
import { PlinkoGame } from "./plinko/PlinkoGame";
import { WheelGame } from "./wheel/WheelGame";
import { KenoGame } from "./keno/KenoGame";
import { RockPaperScissorsGame } from "./rock-paper-scissors/RockPaperScissorsGame";
import { NumberGuessGame } from "./number-guess/NumberGuessGame";
import { HiLoGame } from "./hilo/HiLoGame";
import { BaccaratGame } from "./baccarat/BaccaratGame";
import { RouletteGame } from "./roulette/RouletteGame";
import { TexasHoldemGame } from "./texas-holdem/TexasHoldemGame";
import { VideoPokerGame } from "./video-poker/VideoPokerGame";
import { FiveCardPokerGame } from "./five-card-poker/FiveCardPokerGame";
import { MinesGame } from "./mines/MinesGame";
import { DragonTowerGame } from "./dragon-tower/DragonTowerGame";
import { BlackjackGame } from "./blackjack/BlackjackGame";

export const TABLE_GAME_COMPONENTS: Record<string, ComponentType<{ game: GameMeta }>> = {
  dice: DiceGame,
  coinflip: CoinFlipGame,
  limbo: LimboGame,
  crash: CrashGame,
  plinko: PlinkoGame,
  wheel: WheelGame,
  keno: KenoGame,
  "rock-paper-scissors": RockPaperScissorsGame,
  "number-guess": NumberGuessGame,
  hilo: HiLoGame,
  baccarat: BaccaratGame,
  "european-roulette": RouletteGame,
  "american-roulette": RouletteGame,
  "texas-holdem": TexasHoldemGame,
  "video-poker": VideoPokerGame,
  "five-card-poker": FiveCardPokerGame,
  mines: MinesGame,
  "dragon-tower": DragonTowerGame,
  blackjack: BlackjackGame,
};
