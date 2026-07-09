import type { Puzzle } from "../types";

/**
 * Seed bank for the scaffold. The full curated bank (30+ puzzles across
 * languages) is built out in docs/BACKLOG.md epic 3.
 */
export const bugBank: Puzzle[] = [
  {
    id: "js-off-by-one-01",
    language: "javascript",
    category: "off-by-one",
    title: "Last item of an array",
    code: [
      "function lastItem(items) {",
      "  return items[items.length];",
      "}",
    ].join("\n"),
    buggyLine: 2,
    explanation:
      "Array indices run from 0 to length - 1, so items[items.length] is " +
      "always undefined. It should be items[items.length - 1].",
  },
];
