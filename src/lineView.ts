import { hasAttempted, type GameState } from "./game";
import { highlightLine } from "./highlight";

export type LineVisualState = "default" | "correct" | "incorrect" | "revealed";

export interface LineViewModel {
  lineNumber: number;
  html: string;
  state: LineVisualState;
  disabled: boolean;
}

/**
 * Derives per-line render state from a GameState, with no DOM involved so
 * the "what should this line look like" logic is unit-testable directly.
 * `disabled` lines shouldn't accept further clicks (already tried, or the
 * puzzle is over).
 */
export function buildLineViewModels(state: GameState): LineViewModel[] {
  const lines = state.puzzle.code.split("\n");
  const gameOver = state.status !== "playing";

  return lines.map((text, index) => {
    const lineNumber = index + 1;
    const attempted = hasAttempted(state, lineNumber);
    const isBuggyLine = lineNumber === state.puzzle.buggyLine;

    let visualState: LineVisualState = "default";
    if (state.status === "won" && isBuggyLine) {
      visualState = "correct";
    } else if (attempted && !isBuggyLine) {
      visualState = "incorrect";
    } else if (state.status === "lost" && isBuggyLine) {
      visualState = "revealed";
    }

    return {
      lineNumber,
      html: highlightLine(text, state.puzzle.language),
      state: visualState,
      disabled: gameOver || attempted,
    };
  });
}
