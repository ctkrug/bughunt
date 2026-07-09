import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { puzzleForDate, puzzleNumberForDate } from "../src/dailySeed";
import type { Puzzle } from "../src/types";

function makeBank(size: number): Puzzle[] {
  return Array.from({ length: size }, (_, i) => ({
    id: `p${i}`,
    language: "javascript",
    category: "off-by-one",
    title: `t${i}`,
    code: "function f() {}",
    buggyLine: 1,
    explanation: "e",
  }));
}

// Bounded well above year 99 so Date.UTC never triggers the legacy
// "two-digit year means 1900+year" quirk when rebuilding a date from parts.
// noInvalidDate keeps fast-check from generating `new Date(NaN)`, which isn't
// a real input the daily-seed math is meant to accept (see the explicit
// invalid-date test below for that contract).
const DATE_RANGE = {
  min: new Date(Date.UTC(1900, 0, 1)),
  max: new Date(Date.UTC(9999, 11, 31)),
  noInvalidDate: true,
} as const;

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

  it("throws on an invalid date instead of returning undefined", () => {
    expect(() => puzzleForDate([samplePuzzle], new Date(NaN))).toThrow();
  });
});

describe("dailySeed (property-based)", () => {
  it("puzzleForDate always returns a bank member, for any bank size and date", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        fc.date(DATE_RANGE),
        (bankSize, date) => {
          const bank = makeBank(bankSize);
          expect(bank).toContain(puzzleForDate(bank, date));
        },
      ),
    );
  });

  it("puzzleNumberForDate is stable across any time-of-day on the same UTC calendar date", () => {
    fc.assert(
      fc.property(
        fc.date(DATE_RANGE),
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 23 }),
        (date, hourA, hourB) => {
          const y = date.getUTCFullYear();
          const m = date.getUTCMonth();
          const d = date.getUTCDate();
          const a = puzzleNumberForDate(new Date(Date.UTC(y, m, d, hourA)));
          const b = puzzleNumberForDate(new Date(Date.UTC(y, m, d, hourB)));
          expect(a).toBe(b);
        },
      ),
    );
  });
});
