import type { Puzzle } from "./types";

/** Puzzle #1 is 2024-01-01 UTC; every day since then advances the count by one. */
const EPOCH = Date.UTC(2024, 0, 1);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 1-indexed puzzle number for the given UTC date. */
export function puzzleNumberForDate(date: Date): number {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const daysSinceEpoch = Math.floor((utcMidnight - EPOCH) / MS_PER_DAY);
  return daysSinceEpoch + 1;
}

/**
 * Picks today's puzzle from the bank. The puzzle number wraps around the
 * bank length so an empty-looking future date never throws.
 */
export function puzzleForDate(bank: Puzzle[], date: Date): Puzzle {
  if (bank.length === 0) {
    throw new Error("puzzleForDate: bank is empty");
  }
  const puzzleNumber = puzzleNumberForDate(date);
  const index = ((puzzleNumber - 1) % bank.length + bank.length) % bank.length;
  return bank[index]!;
}
