import "./style.css";
import { bugBank } from "./puzzles/bank";
import { puzzleForDate, puzzleNumberForDate } from "./dailySeed";
import { attemptLine, createGameState, MAX_ATTEMPTS, type GameState } from "./game";
import { buildLineViewModels } from "./lineView";
import { escapeHtml } from "./highlight";
import { browserStore } from "./storage";
import { currentStreak, recordResult } from "./streak";
import { buildShareText, copyToClipboard } from "./shareCard";
import { SoundEngine, loadMuted, saveMuted } from "./sound";

const store = browserStore();
const sound = new SoundEngine(loadMuted(store));

const app = document.querySelector<HTMLDivElement>("#app")!;
const today = new Date();
const puzzle = puzzleForDate(bugBank, today);
const puzzleNumber = puzzleNumberForDate(today);

let gameState: GameState = createGameState(puzzle);

app.innerHTML = `
  <header class="site-header">
    <div class="wordmark"><span class="wordmark-glyph" aria-hidden="true">//</span>bughunt</div>
    <div class="header-controls">
      <div class="streak-badge" role="status" aria-live="polite">
        <span class="streak-flame" aria-hidden="true">🔥</span>
        <span class="streak-count">0</span>
      </div>
      <button type="button" class="icon-button mute-toggle" aria-pressed="false">🔊</button>
    </div>
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
      <div class="share-panel" hidden>
        <p class="share-label">Share your result — no spoilers:</p>
        <pre class="share-text"></pre>
        <button type="button" class="copy-button">Copy result</button>
      </div>
    </section>
  </main>
`;

const codePanel = app.querySelector<HTMLDivElement>(".code-panel")!;
const attemptsEl = app.querySelector<HTMLParagraphElement>(".attempts-indicator")!;
const explanationEl = app.querySelector<HTMLDivElement>(".explanation-panel")!;
const streakCountEl = app.querySelector<HTMLSpanElement>(".streak-count")!;
const sharePanel = app.querySelector<HTMLDivElement>(".share-panel")!;
const shareTextEl = app.querySelector<HTMLPreElement>(".share-text")!;
const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
const muteButton = app.querySelector<HTMLButtonElement>(".mute-toggle")!;

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
  if (won) spawnConfetti();
}

/** A brief win celebration — CSS handles the actual fall/fade animation. */
function spawnConfetti(): void {
  const colors = ["var(--accent)", "var(--accent-support)", "var(--success)"];
  const burst = document.createElement("div");
  burst.className = "confetti";
  burst.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 16; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--confetti-delay", `${(Math.random() * 0.3).toFixed(2)}s`);
    piece.style.setProperty(
      "--confetti-drift",
      `${Math.round((Math.random() - 0.5) * 60)}px`,
    );
    piece.style.background = colors[i % colors.length]!;
    burst.appendChild(piece);
  }
  explanationEl.appendChild(burst);
}

function renderStreak(streak: number): void {
  streakCountEl.textContent = String(streak);
}

function renderShare(state: GameState, streak: number): void {
  if (state.status === "playing") {
    sharePanel.hidden = true;
    return;
  }
  const text = buildShareText({
    puzzleNumber,
    won: state.status === "won",
    attemptsUsed: state.attemptedLines.length,
    streak,
  });
  shareTextEl.textContent = text;
  sharePanel.hidden = false;
}

function renderMuteButton(): void {
  const muted = sound.isMuted();
  muteButton.textContent = muted ? "🔇" : "🔊";
  muteButton.setAttribute("aria-pressed", String(muted));
  muteButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
}

function handleAttempt(line: number): void {
  if (gameState.status !== "playing") return;
  const { state: nextState, result } = attemptLine(gameState, line);
  gameState = nextState;
  renderCodePanel(gameState);
  renderAttempts(gameState);
  renderExplanation(gameState);

  sound.play(result === "correct" ? "correct" : "incorrect");

  if (gameState.status !== "playing") {
    const won = gameState.status === "won";
    if (won) sound.play("win");
    const streak = recordResult(store, puzzleNumber, won);
    renderStreak(streak);
    renderShare(gameState, streak);
  }
}

copyButton.addEventListener("click", () => {
  void copyToClipboard(shareTextEl.textContent ?? "", navigator.clipboard).then(
    (ok) => {
      copyButton.classList.remove("copy-button--success", "copy-button--error");
      copyButton.classList.add(ok ? "copy-button--success" : "copy-button--error");
      copyButton.textContent = ok ? "Copied!" : "Copy failed";
      window.setTimeout(() => {
        copyButton.textContent = "Copy result";
        copyButton.classList.remove("copy-button--success", "copy-button--error");
      }, 2000);
    },
  );
});

codePanel.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    ".code-line",
  );
  if (!target || target.disabled) return;
  handleAttempt(Number(target.dataset.line));
});

let lastHoveredLine: number | null = null;
function handleLineHover(event: Event): void {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    ".code-line",
  );
  if (!target || target.disabled) return;
  const line = Number(target.dataset.line);
  if (line === lastHoveredLine) return;
  lastHoveredLine = line;
  sound.play("select");
}
codePanel.addEventListener("mouseover", handleLineHover);
codePanel.addEventListener("focusin", handleLineHover);

muteButton.addEventListener("click", () => {
  const muted = !sound.isMuted();
  sound.setMuted(muted);
  saveMuted(store, muted);
  renderMuteButton();
});

renderCodePanel(gameState);
renderAttempts(gameState);
renderExplanation(gameState);
renderStreak(currentStreak(store, puzzleNumber));
renderMuteButton();
