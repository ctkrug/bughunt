import { describe, expect, it } from "vitest";
import { highlightLine, tokenizeLine, tokensToHtml } from "../src/highlight";

describe("tokenizeLine", () => {
  it("returns an empty array for an empty line", () => {
    expect(tokenizeLine("", "javascript")).toEqual([]);
  });

  it("classifies a known keyword", () => {
    const tokens = tokenizeLine("return items;", "javascript");
    expect(tokens[0]).toEqual({ type: "keyword", text: "return" });
  });

  it("classifies string and number literals", () => {
    const tokens = tokenizeLine('x = "hi" + 42', "javascript");
    expect(tokens.some((t) => t.type === "string" && t.text === '"hi"')).toBe(
      true,
    );
    expect(tokens.some((t) => t.type === "number" && t.text === "42")).toBe(
      true,
    );
  });

  it("treats a trailing line comment as a single comment token", () => {
    const tokens = tokenizeLine("x = 1 // note", "javascript");
    const last = tokens[tokens.length - 1]!;
    expect(last.type).toBe("comment");
    expect(last.text).toBe("// note");
  });

  it("uses python's # comment marker", () => {
    const tokens = tokenizeLine("x = 1  # note", "python");
    const last = tokens[tokens.length - 1]!;
    expect(last.type).toBe("comment");
    expect(last.text).toBe("# note");
  });

  it("does not classify identifiers outside the keyword list", () => {
    const tokens = tokenizeLine("items.length", "javascript");
    expect(tokens.every((t) => t.type !== "keyword")).toBe(true);
  });

  it("does not treat a quote inside a python comment as starting a string", () => {
    const tokens = tokenizeLine("# it's fine", "python");
    expect(tokens).toEqual([{ type: "comment", text: "# it's fine" }]);
  });
});

describe("tokensToHtml / highlightLine", () => {
  it("escapes HTML-significant characters", () => {
    const html = highlightLine("if (a < b && b > c) {}", "javascript");
    expect(html).not.toContain("<b");
    expect(html).toContain("&lt;");
    expect(html).toContain("&gt;");
  });

  it("wraps classified tokens in a token-<type> span", () => {
    const html = highlightLine("return 1;", "javascript");
    expect(html).toContain('<span class="token-keyword">return</span>');
    expect(html).toContain('<span class="token-number">1</span>');
  });

  it("round-trips an empty token list to an empty string", () => {
    expect(tokensToHtml([])).toBe("");
  });
});
