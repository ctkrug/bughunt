import "./style.css";
import { bugBank } from "./puzzles/bank";
import { puzzleForDate, puzzleNumberForDate } from "./dailySeed";
import {
  attemptLine,
  createGameState,
  MAX_ATTEMPTS,
  type GameState,
} from "./game";
import { buildLineViewModels } from "./lineView";
import { escapeHtml } from "./highlight";
import { browserStore } from "./storage";
import { currentStreak, hasStreakRecord, recordResult } from "./streak";
import { buildShareText, copyToClipboard } from "./shareCard";
import { SoundEngine, loadMuted, saveMuted } from "./sound";
import { buildArchive, filterArchiveByCategory, parseISODate } from "./archive";
import {
  archiveHash,
  BUG_CATEGORIES,
  DAILY_HASH,
  parseHash,
  practiceHash,
  type Route,
} from "./router";
import { dismissOnboarding, shouldShowOnboarding } from "./onboarding";
import type { BugCategory, Puzzle } from "./types";

const store = browserStore();
const sound = new SoundEngine(loadMuted(store));
const today = new Date();
const todaysPuzzle = puzzleForDate(bugBank, today);
const todaysPuzzleNumber = puzzleNumberForDate(today);

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="${DAILY_HASH}"><span class="wordmark-glyph" aria-hidden="true">//</span>bughunt</a>
    <nav class="main-nav" aria-label="Primary">
      <a class="nav-link" data-nav="daily" href="${DAILY_HASH}">Today</a>
      <a class="nav-link" data-nav="archive" href="${archiveHash(null)}">Archive</a>
    </nav>
    <div class="header-controls">
      <div class="streak-badge" role="status" aria-live="polite">
        <span class="streak-flame" aria-hidden="true">🔥</span>
        <span class="streak-count">0</span>
      </div>
      <button type="button" class="icon-button mute-toggle" aria-pressed="false">🔊</button>
    </div>
  </header>
  <main class="board" id="view-root"></main>
`;

const viewRoot = app.querySelector<HTMLElement>("#view-root")!;
const streakCountEl = app.querySelector<HTMLSpanElement>(".streak-count")!;
const muteButton = app.querySelector<HTMLButtonElement>(".mute-toggle")!;
const navLinks = app.querySelectorAll<HTMLAnchorElement>(".nav-link");

function renderStreakBadge(): void {
  streakCountEl.textContent = String(currentStreak(store, todaysPuzzleNumber));
}

function renderMuteButton(): void {
  const muted = sound.isMuted();
  muteButton.textContent = muted ? "🔇" : "🔊";
  muteButton.setAttribute("aria-pressed", String(muted));
  muteButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
}

muteButton.addEventListener("click", () => {
  const muted = !sound.isMuted();
  sound.setMuted(muted);
  saveMuted(store, muted);
  renderMuteButton();
});

/** A brief win celebration — CSS handles the actual fall/fade animation. */
function spawnConfetti(explanationEl: HTMLElement): void {
  const colors = ["var(--accent)", "var(--accent-support)", "var(--success)"];
  const burst = document.createElement("div");
  burst.className = "confetti";
  burst.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 16; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty(
      "--confetti-delay",
      `${(Math.random() * 0.3).toFixed(2)}s`,
    );
    piece.style.setProperty(
      "--confetti-drift",
      `${Math.round((Math.random() - 0.5) * 60)}px`,
    );
    piece.style.background = colors[i % colors.length]!;
    burst.appendChild(piece);
  }
  explanationEl.appendChild(burst);
}

interface PuzzleScreenOptions {
  puzzle: Puzzle;
  puzzleNumber: number;
  isPractice: boolean;
  initialState: GameState;
  onStateChange: (state: GameState) => void;
}

/** Renders and wires a single puzzle screen — shared by the daily and
 * practice views so the click-to-reveal loop only lives in one place. */
function renderPuzzleScreen(
  container: HTMLElement,
  options: PuzzleScreenOptions,
): void {
  const { puzzle, puzzleNumber, isPractice } = options;
  let gameState = options.initialState;

  container.innerHTML = `
    <section class="puzzle-card" aria-labelledby="puzzle-title">
      ${
        isPractice
          ? `<p class="practice-badge">Practice mode — doesn't affect your streak</p>`
          : ""
      }
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
      ${
        isPractice
          ? `<a class="back-to-archive" href="${archiveHash(null)}">&larr; Back to archive</a>`
          : `<div class="share-panel" hidden>
        <p class="share-label">Share your result — no spoilers:</p>
        <pre class="share-text"></pre>
        <button type="button" class="copy-button">Copy result</button>
      </div>`
      }
    </section>
  `;

  const codePanel = container.querySelector<HTMLDivElement>(".code-panel")!;
  const attemptsEl = container.querySelector<HTMLParagraphElement>(
    ".attempts-indicator",
  )!;
  const explanationEl =
    container.querySelector<HTMLDivElement>(".explanation-panel")!;
  const sharePanel = container.querySelector<HTMLDivElement>(".share-panel");
  const shareTextEl = container.querySelector<HTMLPreElement>(".share-text");
  const copyButton = container.querySelector<HTMLButtonElement>(".copy-button");

  function renderCodePanel(): void {
    const lines = buildLineViewModels(gameState);
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

  function renderAttempts(): void {
    const used = gameState.attemptedLines.length;
    const remaining = Math.max(0, MAX_ATTEMPTS - used);
    const pips = Array.from(
      { length: MAX_ATTEMPTS },
      (_, i) =>
        `<span class="attempt-pip${i < used ? " attempt-pip--used" : ""}" aria-hidden="true"></span>`,
    ).join("");
    attemptsEl.innerHTML = `<span class="attempt-pips">${pips}</span><span class="attempts-label">${remaining} ${remaining === 1 ? "attempt" : "attempts"} left</span>`;
  }

  function renderExplanation(): void {
    if (gameState.status === "playing") {
      explanationEl.hidden = true;
      explanationEl.innerHTML = "";
      return;
    }
    const won = gameState.status === "won";
    explanationEl.hidden = false;
    explanationEl.className = `explanation-panel explanation-panel--${won ? "success" : "danger"}`;
    explanationEl.innerHTML = `
      <p class="explanation-verdict">${won ? "Found it." : "Out of attempts."}</p>
      <p class="explanation-text">${escapeHtml(puzzle.explanation)}</p>
    `;
    if (won) spawnConfetti(explanationEl);
  }

  function renderShare(): void {
    if (!sharePanel || !shareTextEl) return;
    if (gameState.status === "playing") {
      sharePanel.hidden = true;
      return;
    }
    const text = buildShareText({
      puzzleNumber,
      won: gameState.status === "won",
      attemptsUsed: gameState.attemptedLines.length,
      streak: currentStreak(store, puzzleNumber),
    });
    shareTextEl.textContent = text;
    sharePanel.hidden = false;
  }

  function handleAttempt(line: number): void {
    if (gameState.status !== "playing") return;
    const { state: nextState, result } = attemptLine(gameState, line);
    gameState = nextState;
    options.onStateChange(gameState);
    renderCodePanel();
    renderAttempts();
    renderExplanation();

    sound.play(result === "correct" ? "correct" : "incorrect");

    if (gameState.status !== "playing") {
      if (gameState.status === "won") sound.play("win");
      if (!isPractice) {
        recordResult(store, puzzleNumber, gameState.status === "won");
        renderStreakBadge();
      }
      renderShare();
    }
  }

  if (copyButton && shareTextEl) {
    copyButton.addEventListener("click", () => {
      void copyToClipboard(
        shareTextEl.textContent ?? "",
        navigator.clipboard,
      ).then((ok) => {
        copyButton.classList.remove(
          "copy-button--success",
          "copy-button--error",
        );
        copyButton.classList.add(
          ok ? "copy-button--success" : "copy-button--error",
        );
        copyButton.textContent = ok ? "Copied!" : "Copy failed";
        window.setTimeout(() => {
          copyButton.textContent = "Copy result";
          copyButton.classList.remove(
            "copy-button--success",
            "copy-button--error",
          );
        }, 2000);
      });
    });
  }

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

  renderCodePanel();
  renderAttempts();
  renderExplanation();
  renderShare();
}

let dailyGameState: GameState = createGameState(todaysPuzzle);
const practiceGameStates = new Map<string, GameState>();

function renderDailyView(): void {
  renderPuzzleScreen(viewRoot, {
    puzzle: todaysPuzzle,
    puzzleNumber: todaysPuzzleNumber,
    isPractice: false,
    initialState: dailyGameState,
    onStateChange: (state) => {
      dailyGameState = state;
    },
  });
}

function renderPracticeView(date: string): void {
  const parsedDate = parseISODate(date);
  if (!parsedDate) {
    navigateTo(archiveHash(null));
    return;
  }
  const puzzle = puzzleForDate(bugBank, parsedDate);
  const puzzleNumber = puzzleNumberForDate(parsedDate);
  const initialState = practiceGameStates.get(date) ?? createGameState(puzzle);

  renderPuzzleScreen(viewRoot, {
    puzzle,
    puzzleNumber,
    isPractice: true,
    initialState,
    onStateChange: (state) => {
      practiceGameStates.set(date, state);
    },
  });
}

function renderArchiveView(category: BugCategory | null): void {
  const entries = filterArchiveByCategory(
    buildArchive(bugBank, today),
    category,
  );

  const optionsHtml = BUG_CATEGORIES.map(
    (cat) =>
      `<option value="${cat}" ${cat === category ? "selected" : ""}>${cat}</option>`,
  ).join("");

  const listHtml =
    entries.length === 0
      ? `<div class="archive-empty">
          <p class="archive-empty-text">No puzzles in this category yet.</p>
          <a class="archive-empty-link" href="${archiveHash(null)}">Clear filter</a>
        </div>`
      : `<ul class="archive-list" role="list">
          ${entries
            .map(
              (entry) => `
            <li>
              <a class="archive-entry" href="${practiceHash(entry.date)}">
                <span class="archive-entry-date">${entry.date}</span>
                <span class="archive-entry-title">${escapeHtml(entry.puzzle.title)}</span>
                <span class="archive-entry-tags">
                  <span class="archive-tag">${entry.puzzle.language}</span>
                  <span class="archive-tag">${entry.puzzle.category}</span>
                </span>
              </a>
            </li>`,
            )
            .join("")}
        </ul>`;

  viewRoot.innerHTML = `
    <section class="archive-panel" aria-labelledby="archive-title">
      <div class="archive-header">
        <h1 id="archive-title" class="archive-title">Archive</h1>
        <p class="archive-subtitle">Practice past puzzles — results don't affect your streak.</p>
      </div>
      <div class="archive-controls">
        <label class="filter-label" for="category-filter">Category</label>
        <select id="category-filter" class="category-filter">
          <option value="">All categories</option>
          ${optionsHtml}
        </select>
      </div>
      ${listHtml}
    </section>
  `;

  const select = viewRoot.querySelector<HTMLSelectElement>(".category-filter")!;
  select.addEventListener("change", () => {
    const value = select.value as BugCategory | "";
    navigateTo(archiveHash(value === "" ? null : value));
  });
}

function navigateTo(hash: string): void {
  window.location.hash = hash;
}

function updateNavActiveState(route: Route): void {
  navLinks.forEach((link) => {
    const isActive =
      (link.dataset.nav === "daily" && route.view === "daily") ||
      (link.dataset.nav === "archive" &&
        (route.view === "archive" || route.view === "practice"));
    link.classList.toggle("nav-link--active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function renderRoute(): void {
  const route = parseHash(window.location.hash);
  updateNavActiveState(route);
  if (route.view === "daily") {
    renderDailyView();
  } else if (route.view === "archive") {
    renderArchiveView(route.category);
  } else {
    renderPracticeView(route.date);
  }
}

window.addEventListener("hashchange", renderRoute);

function renderOnboardingOverlay(): void {
  const overlay = document.createElement("div");
  overlay.className = "onboarding-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "onboarding-title");
  overlay.innerHTML = `
    <div class="onboarding-card">
      <h2 id="onboarding-title" class="onboarding-title">How to play</h2>
      <ol class="onboarding-steps">
        <li>Every day there's one short function with exactly one planted bug.</li>
        <li>Click — or tab to a line and press Enter — the line you think is buggy.</li>
        <li>You get 3 attempts. A correct click flashes green; a wrong one flashes red.</li>
        <li>Solve it to keep your streak, then share a spoiler-free result card.</li>
      </ol>
      <button type="button" class="onboarding-dismiss">Got it</button>
    </div>
  `;
  document.body.appendChild(overlay);

  function dismiss(): void {
    dismissOnboarding(store);
    overlay.remove();
    document.removeEventListener("keydown", handleKeydown);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") dismiss();
  }

  overlay
    .querySelector<HTMLButtonElement>(".onboarding-dismiss")!
    .addEventListener("click", dismiss);
  document.addEventListener("keydown", handleKeydown);
}

renderStreakBadge();
renderMuteButton();
renderRoute();

if (shouldShowOnboarding(store, hasStreakRecord(store))) {
  renderOnboardingOverlay();
}
