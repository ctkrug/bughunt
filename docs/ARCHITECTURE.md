# Architecture

A concise map of the codebase for anyone (including a future build pass) picking this up cold.
Kept current as the code changes — see `CLAUDE.md`'s "Do this run" step 5 in the build prompt.

## Shape

Static TypeScript/Vite app, no backend. All persistent state (streak, mute preference) lives
in `localStorage`. `npm run build` produces a self-contained `site/` servable from any subpath.

## Data flow

```
location.hash
  -> router.parseHash                                 (-> Route: daily | archive | practice)
today's Date
  -> dailySeed.puzzleNumberForDate / puzzleForDate     (deterministic pick from bugBank)
  -> game.createGameState(puzzle)                      (attemptedLines: [], status: "playing")
  -> [user clicks a code line]
  -> game.attemptLine(state, line)                     (pure reducer -> new GameState + result)
  -> lineView.buildLineViewModels(state)                (GameState -> per-line render state)
  -> main.ts renders the DOM from those view models
  -> on win/loss (daily only): streak.recordResult + shareCard.buildShareText
```

The archive/practice path reuses the same `game.ts`/`lineView.ts` reducer, just seeded from
`archive.buildArchive` (the last 30 days mapped onto their puzzles via `dailySeed`) instead of
today's date, and it skips `streak.recordResult` so practice never touches the daily streak.

Every stage left of `main.ts` is pure and DOM-free, so game rules, streak math, highlighting,
routing, and share text are all unit-tested without a browser (see `tests/`). `main.ts` is the
one "impure" layer: DOM construction, event wiring, and side effects (sound, storage, clipboard,
`location.hash`).

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
- **`router.ts`** — `parseHash(location.hash)` -> `Route` (`daily` / `archive` with an optional
  category / `practice` with a date), plus `archiveHash`/`practiceHash`/`DAILY_HASH` builders.
  Unrecognized or malformed hashes fall back to `daily` instead of throwing. DOM-free.
- **`archive.ts`** — `buildArchive(bank, today, lookbackDays = 30)` maps the last N days onto
  their puzzles via `dailySeed`, newest first; `filterArchiveByCategory` narrows the list;
  `parseISODate` turns a route's `YYYY-MM-DD` back into a UTC `Date`, rejecting anything that
  isn't a real calendar date; `isPracticeDateInRange` bounds a parsed date to that same
  lookback window, so the practice route handler can reject a hand-typed pre-epoch or
  future-dated URL instead of rendering a nonsensical puzzle number. DOM-free.
- **`onboarding.ts`** — `shouldShowOnboarding(store, hasPlayed)` composes a persisted
  dismissed-flag with a `hasPlayed` signal (from `streak.hasStreakRecord`) so the how-to-play
  overlay only ever targets a genuine first-time visitor, never a returning player whose streak
  dropped to 0.
- **`main.ts`** — the entry point. Renders the persistent header (wordmark, Today/Archive nav,
  streak badge, mute toggle) once, then a `hashchange`-driven router swaps `#view-root` between
  the daily view, the archive/filter view, and a practice view. The click-to-reveal puzzle
  screen itself (code panel, attempts, explanation, confetti, optional share panel) is built by
  one shared `renderPuzzleScreen`, reused by both daily and practice so there's a single
  implementation of the core loop. Daily and practice `GameState` are cached in module scope so
  switching views mid-puzzle doesn't lose progress. Also shows the onboarding overlay
  (dismiss via its button or Escape) on first load when warranted.
- **`style.css`** — design tokens (`docs/DESIGN.md`) as CSS custom properties, plus every
  component's states (hover/focus/active/disabled), the code-line flash keyframes, the
  confetti win celebration, the archive card grid, the onboarding overlay,
  `prefers-reduced-motion` overrides, and responsive breakpoints at 768px/480px.

## Tests (`tests/`)

One file per `src/` module (`game`, `streak`, `sound`, `highlight`, `bank`, `lineView`,
`shareCard`, `dailySeed`, `router`, `archive`, `onboarding`), covering the happy path plus
boundaries (empty bank, exhausted attempts, corrupted localStorage, missing WebAudio, clipboard
failure, malformed hashes/dates). Run with `npm test` (Vitest). No DOM tests — the DOM-free
architecture above means `main.ts` is the only file that isn't directly unit tested; it's kept
thin (render + wire, no logic) so that's an acceptable seam.

## Build & run

```sh
npm run dev      # Vite dev server
npm test         # vitest run
npm run lint     # eslint . --max-warnings 0
npm run build    # tsc --noEmit && vite build -> site/
```

`vite.config.ts` sets `base: "./"` so the built site works from any subpath (it's deployed at
`apps.charliekrug.com/bughunt/`, not a root domain) — every asset reference must stay relative.
