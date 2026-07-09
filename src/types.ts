export type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "c";

export type BugCategory =
  | "off-by-one"
  | "null-check"
  | "type-coercion"
  | "scoping"
  | "mutation"
  | "async"
  | "comparison"
  | "boundary";

/**
 * One hand-crafted puzzle: a short function with exactly one planted bug.
 * `buggyLine` is the 1-indexed line number within `code` that contains it.
 */
export interface Puzzle {
  id: string;
  language: Language;
  category: BugCategory;
  title: string;
  code: string;
  buggyLine: number;
  explanation: string;
}
