import type { Puzzle } from "./types";

/** A puzzle allows at most this many line-click attempts before it's lost. */
export const MAX_ATTEMPTS = 3;

export type AttemptResult = "correct" | "incorrect";
export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  readonly puzzle: Puzzle;
  readonly attemptedLines: readonly number[];
  readonly status: GameStatus;
}

export function createGameState(puzzle: Puzzle): GameState {
  return { puzzle, attemptedLines: [], status: "playing" };
}

/**
 * Applies a line-click attempt. Throws if the puzzle is already over so
 * callers can't silently keep scoring a finished game.
 */
export function attemptLine(
  state: GameState,
  line: number,
): { state: GameState; result: AttemptResult } {
  if (state.status !== "playing") {
    throw new Error("attemptLine: puzzle is already over");
  }

  const attemptedLines = [...state.attemptedLines, line];
  const result: AttemptResult =
    line === state.puzzle.buggyLine ? "correct" : "incorrect";

  const status: GameStatus =
    result === "correct"
      ? "won"
      : attemptedLines.length >= MAX_ATTEMPTS
        ? "lost"
        : "playing";

  return { state: { puzzle: state.puzzle, attemptedLines, status }, result };
}

export function attemptsRemaining(state: GameState): number {
  return Math.max(0, MAX_ATTEMPTS - state.attemptedLines.length);
}

export function hasAttempted(state: GameState, line: number): boolean {
  return state.attemptedLines.includes(line);
}
