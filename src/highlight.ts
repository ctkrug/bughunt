import type { Language } from "./types";

export type TokenType = "keyword" | "string" | "comment" | "number" | "plain";

export interface Token {
  type: TokenType;
  text: string;
}

interface LanguageSpec {
  keywords: readonly string[];
  lineComment: string;
}

const LANGUAGE_SPECS: Record<Language, LanguageSpec> = {
  javascript: {
    keywords: [
      "const", "let", "var", "function", "return", "if", "else", "for",
      "while", "of", "in", "new", "class", "extends", "typeof", "instanceof",
      "true", "false", "null", "undefined", "async", "await", "throw", "try",
      "catch", "break", "continue", "switch", "case", "default", "this",
    ],
    lineComment: "//",
  },
  typescript: {
    keywords: [
      "const", "let", "var", "function", "return", "if", "else", "for",
      "while", "of", "in", "new", "class", "extends", "implements", "typeof",
      "instanceof", "true", "false", "null", "undefined", "async", "await",
      "throw", "try", "catch", "break", "continue", "switch", "case",
      "default", "this", "interface", "type", "enum", "public", "private",
      "readonly", "as",
    ],
    lineComment: "//",
  },
  python: {
    keywords: [
      "def", "return", "if", "elif", "else", "for", "while", "in", "not",
      "and", "or", "is", "None", "True", "False", "class", "import", "from",
      "as", "try", "except", "finally", "raise", "with", "lambda", "yield",
      "pass", "break", "continue", "self",
    ],
    lineComment: "#",
  },
  go: {
    keywords: [
      "func", "return", "if", "else", "for", "range", "var", "const", "type",
      "struct", "interface", "package", "import", "go", "chan", "defer",
      "map", "nil", "true", "false", "switch", "case", "default", "break",
      "continue", "err",
    ],
    lineComment: "//",
  },
  rust: {
    keywords: [
      "fn", "return", "if", "else", "for", "in", "while", "loop", "let",
      "mut", "const", "struct", "enum", "impl", "trait", "pub", "use", "mod",
      "match", "Some", "None", "Ok", "Err", "true", "false", "self", "Self",
      "break", "continue",
    ],
    lineComment: "//",
  },
  java: {
    keywords: [
      "public", "private", "protected", "static", "final", "class",
      "interface", "extends", "implements", "return", "if", "else", "for",
      "while", "new", "this", "super", "true", "false", "null", "void", "int",
      "long", "double", "float", "boolean", "String", "throw", "try",
      "catch", "break", "continue", "switch", "case", "default",
    ],
    lineComment: "//",
  },
  c: {
    keywords: [
      "int", "long", "double", "float", "char", "void", "return", "if",
      "else", "for", "while", "struct", "typedef", "static", "const",
      "sizeof", "NULL", "break", "continue", "switch", "case", "default",
      "unsigned", "signed",
    ],
    lineComment: "//",
  },
};

const STRING_OR_NUMBER_OR_WORD =
  /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|[A-Za-z_][A-Za-z0-9_]*/g;

/** Tokenizes a single line of source for highlighting. Unknown/blank
 * languages fall back to a single plain-text token. */
export function tokenizeLine(line: string, language: Language): Token[] {
  if (line.length === 0) return [];

  const spec = LANGUAGE_SPECS[language];
  const commentIndex = spec.lineComment
    ? line.indexOf(spec.lineComment)
    : -1;
  const codePart = commentIndex === -1 ? line : line.slice(0, commentIndex);
  const commentPart = commentIndex === -1 ? "" : line.slice(commentIndex);

  const tokens: Token[] = [];
  let lastIndex = 0;
  STRING_OR_NUMBER_OR_WORD.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = STRING_OR_NUMBER_OR_WORD.exec(codePart)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", text: codePart.slice(lastIndex, match.index) });
    }
    const text = match[0];
    const type: TokenType =
      text[0] === '"' || text[0] === "'" || text[0] === "`"
        ? "string"
        : /^\d/.test(text)
          ? "number"
          : spec.keywords.includes(text)
            ? "keyword"
            : "plain";
    tokens.push({ type, text });
    lastIndex = match.index + text.length;
  }

  if (lastIndex < codePart.length) {
    tokens.push({ type: "plain", text: codePart.slice(lastIndex) });
  }
  if (commentPart) {
    tokens.push({ type: "comment", text: commentPart });
  }

  return tokens;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Renders tokens as HTML spans (`token-<type>` classes), plain text escaped. */
export function tokensToHtml(tokens: Token[]): string {
  return tokens
    .map((token) =>
      token.type === "plain"
        ? escapeHtml(token.text)
        : `<span class="token-${token.type}">${escapeHtml(token.text)}</span>`,
    )
    .join("");
}

export function highlightLine(line: string, language: Language): string {
  return tokensToHtml(tokenizeLine(line, language));
}
