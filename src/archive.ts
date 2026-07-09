import type { BugCategory, Puzzle } from "./types";
import { puzzleForDate, puzzleNumberForDate } from "./dailySeed";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** How many past days practice mode surfaces, newest first. */
export const ARCHIVE_LOOKBACK_DAYS = 30;

export interface ArchiveEntry {
  date: string;
  puzzleNumber: number;
  puzzle: Puzzle;
}

function isoDateUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Builds the practice archive: `lookbackDays` days up to and including
 * `today`, newest first. Never reaches into the future. An empty bank
 * yields an empty archive instead of throwing.
 */
export function buildArchive(
  bank: Puzzle[],
  today: Date,
  lookbackDays: number = ARCHIVE_LOOKBACK_DAYS,
): ArchiveEntry[] {
  if (bank.length === 0) return [];

  const todayMidnight = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  const entries: ArchiveEntry[] = [];
  for (let i = 0; i < lookbackDays; i++) {
    const date = new Date(todayMidnight - i * MS_PER_DAY);
    entries.push({
      date: isoDateUTC(date),
      puzzleNumber: puzzleNumberForDate(date),
      puzzle: puzzleForDate(bank, date),
    });
  }
  return entries;
}

export function filterArchiveByCategory(
  entries: readonly ArchiveEntry[],
  category: BugCategory | null,
): ArchiveEntry[] {
  if (!category) return [...entries];
  return entries.filter((entry) => entry.puzzle.category === category);
}

/**
 * True when `date` falls within the practice window: today or up to
 * `lookbackDays - 1` days in the past. Used to reject hand-typed practice
 * URLs for dates the archive never actually links to (pre-epoch, or in the
 * future), so a manipulated hash can't surface a nonsensical puzzle number.
 */
export function isPracticeDateInRange(
  date: Date,
  today: Date,
  lookbackDays: number = ARCHIVE_LOOKBACK_DAYS,
): boolean {
  const todayMidnight = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const dateMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const daysAgo = (todayMidnight - dateMidnight) / MS_PER_DAY;
  return daysAgo >= 0 && daysAgo < lookbackDays;
}

/**
 * Parses an ISO "YYYY-MM-DD" string into a UTC midnight Date. Returns null
 * for anything malformed instead of producing an Invalid Date, so callers
 * (e.g. the practice route handler) can cleanly fall back.
 */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const date = new Date(Date.UTC(y, m - 1, d));
  const isRealCalendarDate =
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d;
  return isRealCalendarDate ? date : null;
}
