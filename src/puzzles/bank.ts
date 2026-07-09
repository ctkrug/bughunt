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
  {
    id: "rust-boundary-01",
    language: "rust",
    category: "boundary",
    title: "Palindrome check",
    code: [
      "fn is_palindrome(s: &str) -> bool {",
      "    let chars: Vec<char> = s.chars().collect();",
      "    let n = chars.len();",
      "    for i in 0..n {",
      "        if chars[i] != chars[n - i] {",
      "            return false;",
      "        }",
      "    }",
      "    true",
      "}",
    ].join("\n"),
    buggyLine: 5,
    explanation:
      "The mirrored index should be n - 1 - i. As written, chars[n - i] " +
      "reaches chars[n] when i is 0, which is out of bounds for a " +
      "0-indexed Vec of length n and panics.",
  },
  {
    id: "java-comparison-01",
    language: "java",
    category: "comparison",
    title: "Password check",
    code: [
      "static boolean isPassword(String input, String actual) {",
      "    return input == actual;",
      "}",
    ].join("\n"),
    buggyLine: 2,
    explanation:
      "== compares String references, not their contents. Two strings " +
      "with identical characters can be different objects, so this can " +
      "reject a correct password. It should use input.equals(actual).",
  },
  {
    id: "c-scoping-01",
    language: "c",
    category: "scoping",
    title: "Make a counter",
    code: [
      "int *make_counter(void) {",
      "    int count = 0;",
      "    return &count;",
      "}",
    ].join("\n"),
    buggyLine: 3,
    explanation:
      "count is a local variable on the stack; its storage no longer " +
      "exists once make_counter returns. The returned pointer dangles — " +
      "dereferencing it is undefined behavior.",
  },
  {
    id: "js-async-01",
    language: "javascript",
    category: "async",
    title: "Fetch all users",
    code: [
      "async function fetchAllUsers(ids) {",
      "  const users = [];",
      "  ids.forEach(async (id) => {",
      "    const user = await fetchUser(id);",
      "    users.push(user);",
      "  });",
      "  return users;",
      "}",
    ].join("\n"),
    buggyLine: 3,
    explanation:
      "forEach doesn't wait for its async callbacks, so fetchAllUsers " +
      "returns the still-empty users array before any fetch resolves. " +
      "Use Promise.all(ids.map(...)) to actually await every fetch.",
  },
];
