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
  {
    id: "py-mutation-01",
    language: "python",
    category: "mutation",
    title: "Append to a list",
    code: [
      "def append_item(item, items=[]):",
      "    items.append(item)",
      "    return items",
    ].join("\n"),
    buggyLine: 1,
    explanation:
      "Default arguments are evaluated once, when the function is defined " +
      "— not once per call. Every caller that omits items shares and " +
      "mutates the same list, so old items leak into unrelated calls.",
  },
  {
    id: "go-type-coercion-01",
    language: "go",
    category: "type-coercion",
    title: "Average of a slice",
    code: [
      "func average(nums []int) float64 {",
      "    sum := 0",
      "    for _, n := range nums {",
      "        sum += n",
      "    }",
      "    return float64(sum / len(nums))",
      "}",
    ].join("\n"),
    buggyLine: 6,
    explanation:
      "sum / len(nums) divides two ints, truncating toward zero before " +
      "the result is ever converted to float64. It should be " +
      "float64(sum) / float64(len(nums)) so the division is done in " +
      "floating point.",
  },
];
