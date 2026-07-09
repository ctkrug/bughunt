import type { Puzzle } from "../types";

/**
 * Curated bug bank. Epic 3 (docs/BACKLOG.md) grows this to 30+ entries; this
 * batch covers all eight BugCategory values across seven languages.
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
  {
    id: "ts-null-check-01",
    language: "typescript",
    category: "null-check",
    title: "Greeting length",
    code: [
      "function greetingLength(name: string | null): number {",
      "  return name.length;",
      "}",
    ].join("\n"),
    buggyLine: 2,
    explanation:
      "The parameter's type says name can be null, but the body reads " +
      "name.length without checking. Calling greetingLength(null) throws " +
      "instead of returning a sensible length.",
  },
];
