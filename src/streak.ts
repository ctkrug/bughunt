import type { KeyValueStore } from "./storage";

const STORAGE_KEY = "bughunt:streak:v1";

interface StreakData {
  streak: number;
  lastResultPuzzleNumber: number | null;
}

const EMPTY_STREAK: StreakData = { streak: 0, lastResultPuzzleNumber: null };

function load(store: KeyValueStore): StreakData {
  const raw = store.getItem(STORAGE_KEY);
  if (!raw) return { ...EMPTY_STREAK };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as StreakData).streak === "number" &&
      ((parsed as StreakData).lastResultPuzzleNumber === null ||
        typeof (parsed as StreakData).lastResultPuzzleNumber === "number")
    ) {
      return parsed as StreakData;
    }
  } catch {
    // Malformed/corrupt localStorage value: fall back to a fresh streak
    // instead of crashing the app on load.
  }
  return { ...EMPTY_STREAK };
}

function save(store: KeyValueStore, data: StreakData): void {
  store.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Records the outcome of today's puzzle and returns the resulting streak.
 * A win extends the streak only if yesterday's puzzle was also a recorded
 * result; a loss (or a gap) resets it to 0. Replaying the same puzzle
 * number is a no-op so reloading the page after solving can't double-count.
 */
export function recordResult(
  store: KeyValueStore,
  puzzleNumber: number,
  won: boolean,
): number {
  const data = load(store);

  if (data.lastResultPuzzleNumber === puzzleNumber) {
    return data.streak;
  }

  const isConsecutiveDay = data.lastResultPuzzleNumber === puzzleNumber - 1;
  const nextStreak = won ? (isConsecutiveDay ? data.streak + 1 : 1) : 0;

  save(store, { streak: nextStreak, lastResultPuzzleNumber: puzzleNumber });
  return nextStreak;
}

/**
 * The streak to display for today, without recording anything. Returns 0
 * if the player never solved, or if there's a gap since their last result
 * (a missed day breaks the streak even before they play again).
 */
export function currentStreak(
  store: KeyValueStore,
  todaysPuzzleNumber: number,
): number {
  const data = load(store);
  if (data.lastResultPuzzleNumber === null) return 0;
  if (todaysPuzzleNumber - data.lastResultPuzzleNumber > 1) return 0;
  return data.streak;
}

/**
 * Whether this player has ever recorded a result, regardless of whether
 * their streak is currently 0. Used to distinguish a brand-new visitor
 * (show onboarding) from a returning player who just lost their streak.
 */
export function hasStreakRecord(store: KeyValueStore): boolean {
  return store.getItem(STORAGE_KEY) !== null;
}
