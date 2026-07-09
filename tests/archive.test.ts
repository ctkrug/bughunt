import { describe, expect, it } from "vitest";
import {
  ARCHIVE_LOOKBACK_DAYS,
  buildArchive,
  filterArchiveByCategory,
  isPracticeDateInRange,
  parseISODate,
} from "../src/archive";
import type { Puzzle } from "../src/types";

function makePuzzle(overrides: Partial<Puzzle> = {}): Puzzle {
  return {
    id: "sample",
    language: "javascript",
    category: "off-by-one",
    title: "sample",
    code: "function f() {}",
    buggyLine: 1,
    explanation: "sample",
    ...overrides,
  };
}

describe("buildArchive", () => {
  it("returns an empty archive for an empty bank", () => {
    expect(buildArchive([], new Date(Date.UTC(2026, 0, 10)))).toEqual([]);
  });

  it("returns lookbackDays entries, newest first", () => {
    const bank = [makePuzzle()];
    const today = new Date(Date.UTC(2026, 0, 10));
    const entries = buildArchive(bank, today, 5);
    expect(entries).toHaveLength(5);
    expect(entries[0]!.date).toBe("2026-01-10");
    expect(entries[4]!.date).toBe("2026-01-06");
  });

  it("defaults to ARCHIVE_LOOKBACK_DAYS when lookbackDays is omitted", () => {
    const bank = [makePuzzle()];
    const entries = buildArchive(bank, new Date(Date.UTC(2026, 0, 31)));
    expect(entries).toHaveLength(ARCHIVE_LOOKBACK_DAYS);
  });

  it("never includes a date after today", () => {
    const bank = [makePuzzle()];
    const today = new Date(Date.UTC(2026, 0, 10));
    const entries = buildArchive(bank, today, 3);
    for (const entry of entries) {
      expect(entry.date <= "2026-01-10").toBe(true);
    }
  });

  it("is stable across different times on the same UTC day", () => {
    const bank = [makePuzzle()];
    const morning = buildArchive(bank, new Date(Date.UTC(2026, 0, 10, 1)), 1);
    const night = buildArchive(bank, new Date(Date.UTC(2026, 0, 10, 23)), 1);
    expect(morning).toEqual(night);
  });

  it("returns an empty archive for a zero or negative lookbackDays", () => {
    const bank = [makePuzzle()];
    const today = new Date(Date.UTC(2026, 0, 10));
    expect(buildArchive(bank, today, 0)).toEqual([]);
    expect(buildArchive(bank, today, -5)).toEqual([]);
  });
});

describe("filterArchiveByCategory", () => {
  const entries = [
    {
      date: "2026-01-03",
      puzzleNumber: 3,
      puzzle: makePuzzle({ category: "async" }),
    },
    {
      date: "2026-01-02",
      puzzleNumber: 2,
      puzzle: makePuzzle({ category: "boundary" }),
    },
    {
      date: "2026-01-01",
      puzzleNumber: 1,
      puzzle: makePuzzle({ category: "async" }),
    },
  ];

  it("returns every entry when category is null", () => {
    expect(filterArchiveByCategory(entries, null)).toHaveLength(3);
  });

  it("returns only matching entries for a given category", () => {
    const filtered = filterArchiveByCategory(entries, "async");
    expect(filtered).toHaveLength(2);
    expect(filtered.every((e) => e.puzzle.category === "async")).toBe(true);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterArchiveByCategory(entries, "scoping")).toEqual([]);
  });
});

describe("isPracticeDateInRange", () => {
  const today = new Date(Date.UTC(2026, 0, 31));

  it("accepts today itself", () => {
    expect(isPracticeDateInRange(today, today)).toBe(true);
  });

  it("accepts the oldest day still inside the lookback window", () => {
    const oldest = new Date(
      Date.UTC(2026, 0, 31 - (ARCHIVE_LOOKBACK_DAYS - 1)),
    );
    expect(isPracticeDateInRange(oldest, today)).toBe(true);
  });

  it("rejects the day just outside the lookback window", () => {
    const tooOld = new Date(Date.UTC(2026, 0, 31 - ARCHIVE_LOOKBACK_DAYS));
    expect(isPracticeDateInRange(tooOld, today)).toBe(false);
  });

  it("rejects a date in the future", () => {
    const tomorrow = new Date(Date.UTC(2026, 1, 1));
    expect(isPracticeDateInRange(tomorrow, today)).toBe(false);
  });

  it("rejects a date decades before the puzzle epoch", () => {
    expect(isPracticeDateInRange(new Date(Date.UTC(1990, 0, 1)), today)).toBe(
      false,
    );
  });

  it("correctly counts across a leap-day boundary", () => {
    // Feb 29 2024 is a real leap day; a naive month/day diff (ignoring how
    // many days are actually in February) could miscount this as 1 day
    // instead of 2.
    const marchFirst = new Date(Date.UTC(2024, 2, 1));
    const leapDay = new Date(Date.UTC(2024, 1, 29));
    expect(isPracticeDateInRange(leapDay, marchFirst, 2)).toBe(true);
    expect(isPracticeDateInRange(leapDay, marchFirst, 1)).toBe(false);
  });

  it("respects a custom lookbackDays", () => {
    const threeDaysAgo = new Date(Date.UTC(2026, 0, 28));
    expect(isPracticeDateInRange(threeDaysAgo, today, 4)).toBe(true);
    expect(isPracticeDateInRange(threeDaysAgo, today, 3)).toBe(false);
  });
});

describe("parseISODate", () => {
  it("parses a valid date", () => {
    const date = parseISODate("2026-07-01");
    expect(date).not.toBeNull();
    expect(date!.getUTCFullYear()).toBe(2026);
    expect(date!.getUTCMonth()).toBe(6);
    expect(date!.getUTCDate()).toBe(1);
  });

  it("rejects a malformed string", () => {
    expect(parseISODate("not-a-date")).toBeNull();
  });

  it("rejects a calendar-invalid date instead of silently rolling over", () => {
    expect(parseISODate("2026-02-30")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(parseISODate("")).toBeNull();
  });
});
