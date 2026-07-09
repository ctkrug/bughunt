import { describe, expect, it } from "vitest";
import { attemptLine, createGameState } from "../src/game";
import { buildLineViewModels } from "../src/lineView";
import type { Puzzle } from "../src/types";

const puzzle: Puzzle = {
  id: "sample",
  language: "javascript",
  category: "off-by-one",
  title: "sample",
  code: "function f() {\n  return items[items.length];\n}",
  buggyLine: 2,
  explanation: "sample",
};

describe("buildLineViewModels", () => {
  it("marks every line default and enabled on a fresh game", () => {
    const vms = buildLineViewModels(createGameState(puzzle));
    expect(vms).toHaveLength(3);
    expect(vms.every((v) => v.state === "default")).toBe(true);
    expect(vms.every((v) => !v.disabled)).toBe(true);
  });

  it("marks a wrong attempt incorrect and disabled, leaving others untouched", () => {
    const { state } = attemptLine(createGameState(puzzle), 1);
    const vms = buildLineViewModels(state);
    expect(vms[0]).toMatchObject({ state: "incorrect", disabled: true });
    expect(vms[1]).toMatchObject({ state: "default", disabled: false });
  });

  it("marks the buggy line correct and disables everything on a win", () => {
    const { state } = attemptLine(createGameState(puzzle), 2);
    const vms = buildLineViewModels(state);
    expect(vms[1]).toMatchObject({ state: "correct", disabled: true });
    expect(vms[0]!.disabled).toBe(true);
    expect(vms[2]!.disabled).toBe(true);
  });

  it("reveals the buggy line and disables all lines on a loss", () => {
    let state = createGameState(puzzle);
    state = attemptLine(state, 1).state;
    state = attemptLine(state, 3).state;
    state = attemptLine(state, 1).state; // re-attempt an already-wrong line is still a distinct click for the reducer
    const vms = buildLineViewModels(state);
    expect(vms[1]).toMatchObject({ state: "revealed", disabled: true });
    expect(vms.every((v) => v.disabled)).toBe(true);
  });

  it("produces syntax-highlighted, HTML-escaped markup per line", () => {
    const vms = buildLineViewModels(createGameState(puzzle));
    expect(vms[0]!.html).toContain(
      '<span class="token-keyword">function</span>',
    );
  });
});
