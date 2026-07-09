import type { BugCategory } from "./types";

export type Route =
  | { view: "daily" }
  | { view: "archive"; category: BugCategory | null }
  | { view: "practice"; date: string };

const BUG_CATEGORIES: readonly BugCategory[] = [
  "off-by-one",
  "null-check",
  "type-coercion",
  "scoping",
  "mutation",
  "async",
  "comparison",
  "boundary",
];

function isBugCategory(value: string): value is BugCategory {
  return (BUG_CATEGORIES as readonly string[]).includes(value);
}

const PRACTICE_PATH = /^\/practice\/(\d{4}-\d{2}-\d{2})$/;

/**
 * Parses `location.hash` into a Route. Unrecognized paths fall back to the
 * daily view instead of throwing, so a malformed or stale bookmarked hash
 * never breaks the app.
 */
export function parseHash(hash: string): Route {
  const withoutHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const [path = "", query = ""] = withoutHash.split("?");

  if (path === "/archive") {
    const categoryParam = new URLSearchParams(query).get("category");
    const category =
      categoryParam && isBugCategory(categoryParam) ? categoryParam : null;
    return { view: "archive", category };
  }

  const practiceMatch = PRACTICE_PATH.exec(path);
  if (practiceMatch) {
    return { view: "practice", date: practiceMatch[1]! };
  }

  return { view: "daily" };
}

export const DAILY_HASH = "#/";

export function archiveHash(category: BugCategory | null): string {
  return category ? `#/archive?category=${category}` : "#/archive";
}

export function practiceHash(date: string): string {
  return `#/practice/${date}`;
}
