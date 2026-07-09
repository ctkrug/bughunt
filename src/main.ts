import "./style.css";
import { bugBank } from "./puzzles/bank";
import { puzzleForDate, puzzleNumberForDate } from "./dailySeed";
import { attemptLine, createGameState, MAX_ATTEMPTS, type GameState } from "./game";
import { buildLineViewModels } from "./lineView";
import { escapeHtml } from "./highlight";

const app = document.querySelector<HTMLDivElement>("#app")!;
const today = new Date();
const puzzle = puzzleForDate(bugBank, today);
const puzzleNumber = puzzleNumberForDate(today);

let gameState: GameState = createGameState(puzzle);

app.innerHTML = `
  <header class="site-header">
    <div class="wordmark"><span class="wordmark-glyph" aria-hidden="true">//</span>bughunt</div>
  </header>
  <main class="board">
    <section class="puzzle-card" aria-labelledby="puzzle-title">
      <div class="puzzle-meta">
        <span class="puzzle-number">#${puzzleNumber}</span>
        <span class="puzzle-lang">${puzzle.language}</span>
        <span class="puzzle-category">${puzzle.category}</span>
      </div>
      <h1 id="puzzle-title" class="puzzle-title">${escapeHtml(puzzle.title)}</h1>
      <p class="puzzle-instructions">One of these lines has a bug. Click it to find out.</p>
      <div class="code-panel" role="list" aria-label="Puzzle code — click the buggy line"></div>
      <p class="attempts-indicator" role="status" aria-live="polite"></p>
      <div class="explanation-panel" aria-live="polite" hidden></div>
    </section>
  </main>
`;

const codePanel = app.querySelector<HTMLDivElement>(".code-panel")!;
const attemptsEl = app.querySelector<HTMLParagraphElement>(".attempts-indicator")!;
const explanationEl = app.querySelector<HTMLDivElement>(".explanation-panel")!;

function renderCodePanel(state: GameState): void {
  const lines = buildLineViewModels(state);
  codePanel.innerHTML = lines
    .map(
      (line) => `
        <button
          type="button"
          class="code-line code-line--${line.state}"
          role="listitem"
          data-line="${line.lineNumber}"
          aria-label="Line ${line.lineNumber}"
          ${line.disabled ? "disabled" : ""}
        ><span class="line-number">${line.lineNumber}</span><span class="line-code">${line.html}</span></button>
      `,
    )
    .join("");
}

function renderAttempts(state: GameState): void {
  const used = state.attemptedLines.length;
  const remaining = Math.max(0, MAX_ATTEMPTS - used);
  const pips = Array.from(
    { length: MAX_ATTEMPTS },
    (_, i) =>
      `<span class="attempt-pip${i < used ? " attempt-pip--used" : ""}" aria-hidden="true"></span>`,
  ).join("");
  attemptsEl.innerHTML = `<span class="attempt-pips">${pips}</span><span class="attempts-label">${remaining} ${remaining === 1 ? "attempt" : "attempts"} left</span>`;
}

function renderExplanation(state: GameState): void {
  if (state.status === "playing") {
    explanationEl.hidden = true;
    explanationEl.innerHTML = "";
    return;
  }
  const won = state.status === "won";
  explanationEl.hidden = false;
  explanationEl.className = `explanation-panel explanation-panel--${won ? "success" : "danger"}`;
  explanationEl.innerHTML = `
    <p class="explanation-verdict">${won ? "Found it." : "Out of attempts."}</p>
    <p class="explanation-text">${escapeHtml(puzzle.explanation)}</p>
  `;
}

function handleAttempt(line: number): void {
  if (gameState.status !== "playing") return;
  gameState = attemptLine(gameState, line).state;
  renderCodePanel(gameState);
  renderAttempts(gameState);
  renderExplanation(gameState);
}

codePanel.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    ".code-line",
  );
  if (!target || target.disabled) return;
  handleAttempt(Number(target.dataset.line));
});

renderCodePanel(gameState);
renderAttempts(gameState);
renderExplanation(gameState);
