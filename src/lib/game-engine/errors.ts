export class GameEngineError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "GameEngineError";
  }
}

export class InsufficientBalanceError extends GameEngineError {
  constructor() {
    super("Insufficient balance", 400);
  }
}

export class InvalidBetError extends GameEngineError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class GameNotFoundError extends GameEngineError {
  constructor() {
    super("Game not found", 404);
  }
}

export class BannedUserError extends GameEngineError {
  constructor() {
    super("Account suspended", 403);
  }
}
