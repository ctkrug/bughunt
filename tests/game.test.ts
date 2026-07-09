import { describe, expect, it } from "vitest";
import {
  MAX_ATTEMPTS,
  attemptLine,
  attemptsRemaining,
  createGameState,
  hasAttempted,
} from "../src/game";
import type { Puzzle } from "../src/types";

const puzzle: Puzzle = {
  id: "sample",
  language: "javascript",
  category: "off-by-one",
  title: "sample",
  code: "function f() {\n  return 1;\n}",
  buggyLine: 2,
  explanation: "sample",
};

describe("createGameState", () => {
  it("starts with no attempts and status playing", () => {
    const state = createGameState(puzzle);
    expect(state.attemptedLines).toEqual([]);
    expect(state.status).toBe("playing");
  });
});

describe("attemptLine", () => {
  it("wins on the first click of the buggy line", () => {
    const state = createGameState(puzzle);
    const { state: next, result } = attemptLine(state, 2);
    expect(result).toBe("correct");
    expect(next.status).toBe("won");
    expect(next.attemptedLines).toEqual([2]);
  });

  it("stays playing after a wrong click with attempts remaining", () => {
    const state = createGameState(puzzle);
    const { state: next, result } = attemptLine(state, 1);
    expect(result).toBe("incorrect");
    expect(next.status).toBe("playing");
    expect(attemptsRemaining(next)).toBe(MAX_ATTEMPTS - 1);
  });

  it("loses after exhausting MAX_ATTEMPTS without the correct line", () => {
    let state = createGameState(puzzle);
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      // line 3 is never the bug (buggyLine is 2)
      state = attemptLine(state, 3).state;
    }
    expect(state.status).toBe("lost");
    expect(attemptsRemaining(state)).toBe(0);
  });

  it("wins on the very last available attempt", () => {
    let state = createGameState(puzzle);
    state = attemptLine(state, 1).state;
    state = attemptLine(state, 3).state;
    const { state: next, result } = attemptLine(state, 2);
    expect(result).toBe("correct");
    expect(next.status).toBe("won");
  });

  it("throws when attempting after the game is already won", () => {
    let state = createGameState(puzzle);
    state = attemptLine(state, 2).state;
    expect(() => attemptLine(state, 1)).toThrow();
  });

  it("throws when attempting after the game is already lost", () => {
    let state = createGameState(puzzle);
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      state = attemptLine(state, 3).state;
    }
    expect(() => attemptLine(state, 2)).toThrow();
  });

  it("does not mutate the previous state object", () => {
    const state = createGameState(puzzle);
    attemptLine(state, 1);
    expect(state.attemptedLines).toEqual([]);
    expect(state.status).toBe("playing");
  });
});

describe("hasAttempted", () => {
  it("reflects lines already clicked", () => {
    const state = createGameState(puzzle);
    const { state: next } = attemptLine(state, 1);
    expect(hasAttempted(next, 1)).toBe(true);
    expect(hasAttempted(next, 3)).toBe(false);
  });
});
