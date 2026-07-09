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
});
