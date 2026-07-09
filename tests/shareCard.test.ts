import { describe, expect, it } from "vitest";
import { buildShareText, copyToClipboard } from "../src/shareCard";

describe("buildShareText", () => {
  it("shows the score and a single green square for a first-try win", () => {
    const text = buildShareText({
      puzzleNumber: 42,
      won: true,
      attemptsUsed: 1,
      streak: 5,
    });
    expect(text).toContain("Bughunt #42 — 1/3");
    expect(text).toContain("🟩");
    expect(text).not.toContain("🟥");
    expect(text).toContain("🔥 streak: 5");
  });

  it("shows red squares before the final green on a multi-attempt win", () => {
    const text = buildShareText({
      puzzleNumber: 1,
      won: true,
      attemptsUsed: 3,
      streak: 1,
    });
    const gridLine = text.split("\n")[1]!;
    expect(gridLine).toBe("🟥🟥🟩");
  });

  it("shows X/3 and an all-red grid on a loss", () => {
    const text = buildShareText({
      puzzleNumber: 7,
      won: false,
      attemptsUsed: 3,
      streak: 0,
    });
    expect(text).toContain("Bughunt #7 — X/3");
    const gridLine = text.split("\n")[1]!;
    expect(gridLine).toBe("🟥🟥🟥");
  });

  it("never includes the puzzle's code or explanation", () => {
    const text = buildShareText({
      puzzleNumber: 1,
      won: true,
      attemptsUsed: 1,
      streak: 1,
    });
    expect(text).not.toMatch(/function|return|def /);
  });
});

describe("copyToClipboard", () => {
  it("resolves true when the clipboard write succeeds", async () => {
    const ok = await copyToClipboard("hello", {
      writeText: async () => {},
    });
    expect(ok).toBe(true);
  });

  it("resolves false instead of throwing when the clipboard write fails", async () => {
    const ok = await copyToClipboard("hello", {
      writeText: async () => {
        throw new Error("denied");
      },
    });
    expect(ok).toBe(false);
  });
});
