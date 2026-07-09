import { MAX_ATTEMPTS } from "./game";

export interface ShareCardInput {
  puzzleNumber: number;
  won: boolean;
  attemptsUsed: number;
  streak: number;
}

/** ✕/✓ Wordle-style attempt grid without revealing which line was the bug. */
function attemptGrid(input: ShareCardInput): string {
  const total = input.won ? input.attemptsUsed : MAX_ATTEMPTS;
  const squares: string[] = [];
  for (let i = 1; i <= total; i++) {
    const isLast = i === total;
    squares.push(isLast && input.won ? "🟩" : "🟥");
  }
  return squares.join("");
}

/**
 * Builds the spoiler-free share text: score line, attempt grid, streak.
 * Pure and deterministic so it's copy-paste identical for every player who
 * had the same outcome.
 */
export function buildShareText(input: ShareCardInput): string {
  const score = input.won ? `${input.attemptsUsed}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;
  const lines = [
    `Bughunt #${input.puzzleNumber} — ${score}`,
    attemptGrid(input),
    `🔥 streak: ${input.streak}`,
  ];
  return lines.join("\n");
}

export interface ClipboardLike {
  writeText(text: string): Promise<void>;
}

/** Copies text to the clipboard, returning whether it succeeded (never throws). */
export async function copyToClipboard(
  text: string,
  clipboard: ClipboardLike,
): Promise<boolean> {
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
