# Backlog

Epics and stories for the v1 build. Every story lists concrete, checkable acceptance criteria —
build implements to them, QA attacks them. Story 1 is the wow moment and ships first.

## Epic 1 — Core daily puzzle loop

- [x] **1. Click-to-reveal buggy line with red/green flash and "here's why" (WOW MOMENT)**
  - Clicking the correct line flashes green and the explanation panel appears within 150ms.
  - Clicking an incorrect line flashes red and does not end the puzzle (attempts remain).
  - Every puzzle has exactly one line marked as the correct answer.

- [x] **2. Deterministic daily puzzle selection**
  - The same calendar date (UTC) yields the same puzzle for every player.
  - The puzzle-number formula (days since a fixed epoch) is covered by a unit test.
  - A puzzle-bank index beyond the bank's length wraps instead of throwing or crashing.

- [x] **3. Curated bug bank with syntax highlighting across languages**
  - At least 5 languages are represented in the bank.
  - Each entry renders with language-appropriate syntax highlighting.
  - Each entry has exactly one planted bug line and a written explanation.

- [x] **4. Design polish pass — puzzle screen**
  - Matches `docs/DESIGN.md` tokens and the blueprint/technical direction.
  - Composed with no dead space at 390px, 768px, and 1440px widths.
  - Every control (buttons, line rows) has themed hover, focus-visible, active, and disabled
    states.

## Epic 2 — Streak & sharing

- [x] **5. Local streak tracking**
  - Solving a puzzle correctly on a new day increments the streak by 1.
  - Missing a day (no solve since the last calendar day played) resets the streak to 0.
  - Streak count persists across page reloads via `localStorage`.

- [x] **6. Shareable streak/result card**
  - After solving, a share card renders a Wordle-style attempt summary without revealing the bug.
  - A "copy to clipboard" button copies exactly the rendered share text.
  - Share text includes the current streak and the puzzle number.

- [x] **7. Guess attempt limit and scoring**
  - Each puzzle allows a maximum of 3 line-click attempts.
  - The result reflects the number of attempts used to solve.
  - Exhausting all attempts reveals the correct line, marks the puzzle failed, and resets the
    streak to 0.

- [x] **8. Design polish pass — streak/share UI**
  - Share card matches `docs/DESIGN.md` tokens and remains legible/composed at 390px width.
  - The copy button shows a distinct success state and a distinct failure state.

## Epic 3 — Puzzle archive & content depth

- [ ] **9. Puzzle archive / practice mode**
  - Past puzzles (by date) are listed and playable in a practice mode.
  - Practice-mode results do not change the daily streak.
  - The archive list is fully keyboard-navigable (arrow keys or tab order + enter to open).

- [ ] **10. Expand bug bank to 30+ puzzles**
  - The bank contains at least 30 entries.
  - Each entry has a category tag (e.g. off-by-one, null-check, type-coercion, scoping).
  - No two entries in the same language share an identical buggy line of code.

- [ ] **11. Difficulty/category filter for practice mode**
  - Selecting a category filters the visible archive list without a full page reload.
  - The active filter is reflected in the URL query string (shareable/bookmarkable).
  - An empty filter result shows a designed empty state, not a blank list.

- [ ] **12. Design polish pass — archive/practice UI**
  - Archive list matches `docs/DESIGN.md` tokens.
  - All interactive targets are at least 44px for touch.
  - Empty and loading states are designed per the D2 craft rules, not left blank.

## Epic 4 — Onboarding & accessibility

- [ ] **13. First-time onboarding walkthrough**
  - A visitor with no existing streak in `localStorage` sees a dismissible how-to-play overlay
    on first visit.
  - Dismissing the overlay is remembered in `localStorage` so it doesn't reappear.
  - The overlay can be dismissed with the Escape key.

- [x] **14. Sound design and mute control**
  - Synthesized WebAudio SFX play on hover, line select, correct, incorrect, and win.
  - The mute toggle's state persists across reloads via `localStorage`.
  - The `AudioContext` is created lazily on the first user gesture and SFX calls are guarded so
    they never throw in environments without WebAudio (e.g. test environments).

- [x] **15. Accessibility pass — keyboard and reduced motion**
  - The entire puzzle can be completed via keyboard alone (tab to a line, Enter/Space to select).
  - `prefers-reduced-motion` disables shake/particle animations while preserving all state
    changes (color flash, panel appearance).
  - All icon-only buttons (mute, share-copy, etc.) have an `aria-label`.
