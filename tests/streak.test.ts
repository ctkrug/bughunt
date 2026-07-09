import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createMemoryStore } from "../src/storage";
import { currentStreak, hasStreakRecord, recordResult } from "../src/streak";

describe("recordResult", () => {
  it("starts a streak at 1 on the first ever win", () => {
    const store = createMemoryStore();
    expect(recordResult(store, 10, true)).toBe(1);
  });

  it("extends the streak on a consecutive-day win", () => {
    const store = createMemoryStore();
    recordResult(store, 10, true);
    expect(recordResult(store, 11, true)).toBe(2);
    expect(recordResult(store, 12, true)).toBe(3);
  });

  it("resets to 1 on a win after a gap", () => {
    const store = createMemoryStore();
    recordResult(store, 10, true);
    expect(recordResult(store, 15, true)).toBe(1);
  });

  it("resets to 0 on a loss", () => {
    const store = createMemoryStore();
    recordResult(store, 10, true);
    recordResult(store, 11, true);
    expect(recordResult(store, 12, false)).toBe(0);
  });

  it("is idempotent for a replayed puzzle number", () => {
    const store = createMemoryStore();
    recordResult(store, 10, true);
    recordResult(store, 11, true);
    expect(recordResult(store, 11, true)).toBe(2);
    expect(recordResult(store, 11, false)).toBe(2);
  });

  it("stays 0 across consecutive losses", () => {
    const store = createMemoryStore();
    recordResult(store, 10, false);
    expect(recordResult(store, 11, false)).toBe(0);
  });
});

describe("recordResult (property-based)", () => {
  it("equals the trailing run of wins across any sequence of contiguous daily results", () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 30 }),
        (results) => {
          const store = createMemoryStore();
          let actual = 0;
          results.forEach((won, i) => {
            actual = recordResult(store, i + 1, won);
          });

          let expected = 0;
          for (const won of results) {
            expected = won ? expected + 1 : 0;
          }
          expect(actual).toBe(expected);
        },
      ),
    );
  });
});

describe("currentStreak", () => {
  it("is 0 when nothing has ever been recorded", () => {
    const store = createMemoryStore();
    expect(currentStreak(store, 5)).toBe(0);
  });

  it("reflects the stored streak the same day it was recorded", () => {
    const store = createMemoryStore();
    recordResult(store, 10, true);
    expect(currentStreak(store, 10)).toBe(1);
  });

  it("carries over to the next day before playing", () => {
    const store = createMemoryStore();
    recordResult(store, 10, true);
    recordResult(store, 11, true);
    expect(currentStreak(store, 12)).toBe(2);
  });

  it("drops to 0 once a day has been missed, even without a new result", () => {
    const store = createMemoryStore();
    recordResult(store, 10, true);
    recordResult(store, 11, true);
    expect(currentStreak(store, 13)).toBe(0);
  });

  it("survives corrupted storage by treating it as empty", () => {
    const store = createMemoryStore();
    store.setItem("bughunt:streak:v1", "not json");
    expect(currentStreak(store, 5)).toBe(0);
  });
});

describe("hasStreakRecord", () => {
  it("is false for a brand-new visitor", () => {
    const store = createMemoryStore();
    expect(hasStreakRecord(store)).toBe(false);
  });

  it("is true after any result is recorded, even a loss", () => {
    const store = createMemoryStore();
    recordResult(store, 10, false);
    expect(hasStreakRecord(store)).toBe(true);
  });

  it("stays true even once the streak drops back to 0", () => {
    const store = createMemoryStore();
    recordResult(store, 10, true);
    recordResult(store, 11, false);
    expect(currentStreak(store, 11)).toBe(0);
    expect(hasStreakRecord(store)).toBe(true);
  });
});
