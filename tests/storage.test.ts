import { afterEach, describe, expect, it } from "vitest";
import { browserStore, createMemoryStore } from "../src/storage";

describe("createMemoryStore", () => {
  it("returns null for a key that was never set", () => {
    expect(createMemoryStore().getItem("missing")).toBeNull();
  });

  it("round-trips a stored value", () => {
    const store = createMemoryStore();
    store.setItem("k", "v");
    expect(store.getItem("k")).toBe("v");
  });

  it("keeps separate instances independent", () => {
    const a = createMemoryStore();
    const b = createMemoryStore();
    a.setItem("k", "a-value");
    expect(b.getItem("k")).toBeNull();
  });
});

describe("browserStore", () => {
  const original = (globalThis as { localStorage?: unknown }).localStorage;

  afterEach(() => {
    if (original === undefined) {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    } else {
      (globalThis as { localStorage?: unknown }).localStorage = original;
    }
  });

  it("falls back to an in-memory store when localStorage is unavailable", () => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
    const store = browserStore();
    store.setItem("k", "v");
    expect(store.getItem("k")).toBe("v");
  });

  it("uses the real localStorage when available", () => {
    const calls: Array<[string, string]> = [];
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (key: string) => (key === "k" ? "stored" : null),
      setItem: (key: string, value: string) => calls.push([key, value]),
    };
    const store = browserStore();
    expect(store.getItem("k")).toBe("stored");
    store.setItem("other", "value");
    expect(calls).toEqual([["other", "value"]]);
  });
});
