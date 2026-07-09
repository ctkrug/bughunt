import { describe, expect, it } from "vitest";
import {
  ARCHIVE_LOOKBACK_DAYS,
  buildArchive,
  filterArchiveByCategory,
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
