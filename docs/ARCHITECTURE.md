# Architecture

A concise map of the codebase for anyone (including a future build pass) picking this up cold.
Kept current as the code changes — see `CLAUDE.md`'s "Do this run" step 5 in the build prompt.

## Shape

Static TypeScript/Vite app, no backend. All persistent state (streak, mute preference) lives
in `localStorage`. `npm run build` produces a self-contained `dist/` servable from any subpath.

## Data flow

```
today's Date
  -> dailySeed.puzzleNumberForDate / puzzleForDate   (deterministic pick from bugBank)
  -> game.createGameState(puzzle)                    (attemptedLines: [], status: "playing")
  -> [user clicks a code line]
  -> game.attemptLine(state, line)                   (pure reducer -> new GameState + result)
  -> lineView.buildLineViewModels(state)              (GameState -> per-line render state)
  -> main.ts renders the DOM from those view models
  -> on win/loss: streak.recordResult + shareCard.buildShareText
```

Every stage left of `main.ts` is pure and DOM-free, so game rules, streak math, highlighting,
and share text are all unit-tested without a browser (see `tests/`). `main.ts` is the one
"impure" layer: DOM construction, event wiring, and side effects (sound, storage, clipboard).

## Modules (`src/`)

- **`types.ts`** — `Puzzle`, `Language`, `BugCategory`. The shared vocabulary.
- **`puzzles/bank.ts`** — the curated bug bank (`bugBank: Puzzle[]`). One hand-written entry
  per bug, each with exactly one `buggyLine` and a written `explanation`.
- **`dailySeed.ts`** — `puzzleNumberForDate` (days since a fixed epoch) and `puzzleForDate`
  (wraps the bank index so any date is safe, even beyond the bank's length).
- **`game.ts`** — the game rules as a pure reducer: `createGameState`, `attemptLine`
  (`MAX_ATTEMPTS = 3`), `attemptsRemaining`, `hasAttempted`. No DOM, no I/O.
- **`lineView.ts`** — `buildLineViewModels(state)` turns a `GameState` into per-line render
  state (`default` / `correct` / `incorrect` / `revealed`, plus `disabled`) and highlighted
  HTML. This is what `main.ts` actually renders — keeping it DOM-free means the "what should
  this line look like" logic is tested directly instead of via jsdom.
- **`highlight.ts`** — a small dependency-free regex tokenizer (keyword / string / comment /
  number / plain) per `Language`, plus `escapeHtml` / `tokensToHtml` for safe rendering.
- **`storage.ts`** — `KeyValueStore` interface (shaped like `localStorage`) plus
  `createMemoryStore` (tests) and `browserStore` (real `localStorage`, with an in-memory
  fallback if unavailable). Every persistence module takes a store as a parameter instead of
  reaching for the global, so it's testable without a DOM.
- **`streak.ts`** — `recordResult` / `currentStreak`, built on `storage.ts`. Wins only extend a
  streak that was active the previous puzzle; a loss or a missed day resets it.
- **`sound.ts`** — `SoundEngine`, synthesized WebAudio SFX (oscillators, no audio files) for
  select/correct/incorrect/win. Lazily creates its `AudioContext` on first `play()` and is
  guarded so a missing/broken WebAudio implementation (including test environments) never
  throws. `loadMuted`/`saveMuted` persist the mute toggle via `storage.ts`.
- **`shareCard.ts`** — `buildShareText` (pure, spoiler-free Wordle-style summary) and
  `copyToClipboard` (DI'd clipboard interface, never throws).
- **`main.ts`** — the entry point. Wires everything above into the DOM: renders today's puzzle,
  handles clicks/keyboard activation on code lines, updates the attempts indicator and
  explanation panel, spawns the win confetti, and wires the streak badge, mute toggle, and
  share/copy button.
- **`style.css`** — design tokens (`docs/DESIGN.md`) as CSS custom properties, plus every
  component's states (hover/focus/active/disabled), the code-line flash keyframes, the
  confetti win celebration, `prefers-reduced-motion` overrides, and responsive breakpoints at
  768px/480px.

## Tests (`tests/`)

One file per `src/` module (`game`, `streak`, `sound`, `highlight`, `bank`, `lineView`,
`shareCard`, `dailySeed`), covering the happy path plus boundaries (empty bank, exhausted
attempts, corrupted localStorage, missing WebAudio, clipboard failure). Run with
`npm test` (Vitest). No DOM tests — the DOM-free architecture above means `main.ts` is the
only file that isn't directly unit tested; it's kept thin (render + wire, no logic) so that's
an acceptable seam.

## Build & run

```sh
npm run dev      # Vite dev server
npm test         # vitest run
npm run lint     # eslint . --max-warnings 0
npm run build    # tsc --noEmit && vite build -> dist/
```

`vite.config.ts` sets `base: "./"` so the built site works from any subpath (it's deployed at
`apps.charliekrug.com/bughunt/`, not a root domain) — every asset reference must stay relative.
