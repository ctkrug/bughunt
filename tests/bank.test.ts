import { describe, expect, it } from "vitest";
import { bugBank } from "../src/puzzles/bank";

describe("bugBank", () => {
  it("is not empty", () => {
    expect(bugBank.length).toBeGreaterThan(0);
  });

  it("represents at least 5 distinct languages", () => {
    const languages = new Set(bugBank.map((p) => p.language));
    expect(languages.size).toBeGreaterThanOrEqual(5);
  });

  it("has unique ids", () => {
    const ids = bugBank.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry's buggyLine falls within its code", () => {
    for (const puzzle of bugBank) {
      const lineCount = puzzle.code.split("\n").length;
      expect(puzzle.buggyLine).toBeGreaterThanOrEqual(1);
      expect(puzzle.buggyLine).toBeLessThanOrEqual(lineCount);
    }
  });

  it("every entry has a non-empty title and explanation", () => {
    for (const puzzle of bugBank) {
      expect(puzzle.title.length).toBeGreaterThan(0);
      expect(puzzle.explanation.length).toBeGreaterThan(0);
    }
  });

  it("has at least 30 entries", () => {
    expect(bugBank.length).toBeGreaterThanOrEqual(30);
  });

  it("every entry has a category tag", () => {
    for (const puzzle of bugBank) {
      expect(puzzle.category.length).toBeGreaterThan(0);
    }
  });

  it("represents all 8 bug categories", () => {
    const categories = new Set(bugBank.map((p) => p.category));
    expect(categories.size).toBe(8);
  });

  it("has no duplicate buggy line within the same language", () => {
    const seenByLanguage = new Map<string, Set<string>>();
    for (const puzzle of bugBank) {
      const buggyLineText = puzzle.code.split("\n")[puzzle.buggyLine - 1];
      const seen = seenByLanguage.get(puzzle.language) ?? new Set<string>();
      expect(seen.has(buggyLineText!)).toBe(false);
      seen.add(buggyLineText!);
      seenByLanguage.set(puzzle.language, seen);
    }
  });
});
