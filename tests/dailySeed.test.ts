import { describe, expect, it } from "vitest";
import { puzzleForDate, puzzleNumberForDate } from "../src/dailySeed";
import type { Puzzle } from "../src/types";

const samplePuzzle: Puzzle = {
  id: "sample",
  language: "javascript",
  category: "off-by-one",
  title: "sample",
  code: "function f() {}",
  buggyLine: 1,
  explanation: "sample",
};

describe("puzzleNumberForDate", () => {
  it("returns 1 for the epoch date", () => {
    expect(puzzleNumberForDate(new Date(Date.UTC(2024, 0, 1)))).toBe(1);
  });

  it("advances by exactly one per UTC day", () => {
    const day1 = puzzleNumberForDate(new Date(Date.UTC(2024, 0, 1)));
    const day2 = puzzleNumberForDate(new Date(Date.UTC(2024, 0, 2)));
    expect(day2).toBe(day1 + 1);
  });

  it("is stable across different times on the same UTC day", () => {
    const morning = puzzleNumberForDate(new Date(Date.UTC(2024, 5, 15, 1, 0)));
    const night = puzzleNumberForDate(new Date(Date.UTC(2024, 5, 15, 23, 0)));
    expect(morning).toBe(night);
  });
});

describe("puzzleForDate", () => {
  it("throws on an empty bank instead of returning undefined", () => {
    expect(() => puzzleForDate([], new Date())).toThrow();
  });

  it("wraps the bank index for dates beyond the bank length", () => {
    const bank = [samplePuzzle, { ...samplePuzzle, id: "sample-2" }];
    const farFuture = new Date(Date.UTC(2099, 0, 1));
    // Should not throw, and should return one of the two puzzles.
    const picked = puzzleForDate(bank, farFuture);
    expect(bank).toContain(picked);
  });
});
