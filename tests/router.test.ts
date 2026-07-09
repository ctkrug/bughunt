import { describe, expect, it } from "vitest";
import {
  archiveHash,
  DAILY_HASH,
  parseHash,
  practiceHash,
} from "../src/router";

describe("parseHash", () => {
  it("treats an empty hash as the daily view", () => {
    expect(parseHash("")).toEqual({ view: "daily" });
  });

  it("treats an unrecognized path as the daily view", () => {
    expect(parseHash("#/nonsense")).toEqual({ view: "daily" });
  });

  it("parses the archive view with no category", () => {
    expect(parseHash("#/archive")).toEqual({
      view: "archive",
      category: null,
    });
  });

  it("parses the archive view with a valid category", () => {
    expect(parseHash("#/archive?category=async")).toEqual({
      view: "archive",
      category: "async",
    });
  });

  it("ignores an invalid category and falls back to null", () => {
    expect(parseHash("#/archive?category=not-a-real-category")).toEqual({
      view: "archive",
      category: null,
    });
  });

  it("parses a practice route with a valid date", () => {
    expect(parseHash("#/practice/2026-07-01")).toEqual({
      view: "practice",
      date: "2026-07-01",
    });
  });

  it("falls back to daily for a malformed practice date", () => {
    expect(parseHash("#/practice/not-a-date")).toEqual({ view: "daily" });
  });

  it("works without a leading #", () => {
    expect(parseHash("/archive?category=mutation")).toEqual({
      view: "archive",
      category: "mutation",
    });
  });
});

describe("hash builders", () => {
  it("round-trips the daily hash", () => {
    expect(parseHash(DAILY_HASH)).toEqual({ view: "daily" });
  });

  it("round-trips an archive hash with no category", () => {
    expect(parseHash(archiveHash(null))).toEqual({
      view: "archive",
      category: null,
    });
  });

  it("round-trips an archive hash with a category", () => {
    expect(parseHash(archiveHash("boundary"))).toEqual({
      view: "archive",
      category: "boundary",
    });
  });

  it("round-trips a practice hash", () => {
    expect(parseHash(practiceHash("2026-01-15"))).toEqual({
      view: "practice",
      date: "2026-01-15",
    });
  });
});
