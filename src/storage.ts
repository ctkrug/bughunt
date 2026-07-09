/**
 * Minimal key/value store shape (matches window.localStorage). Modules take
 * this as a parameter instead of reading `localStorage` globally so their
 * persistence logic is testable without a DOM.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** In-memory store for environments without `localStorage` (or for tests). */
export function createMemoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

/** Returns `window.localStorage` when available, else an in-memory fallback. */
export function browserStore(): KeyValueStore {
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return createMemoryStore();
}
